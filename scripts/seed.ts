// scripts/seed.ts
import "dotenv/config";
import { faker } from "@faker-js/faker";
import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";

const SUPABASE_URL =
  process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;

const SUPABASE_SECRET_KEY =
  process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SECRET_KEY) {
  throw new Error(
    "Missing SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and/or SUPABASE_SECRET_KEY (or SUPABASE_SERVICE_ROLE_KEY) in env."
  );
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SECRET_KEY, {
  auth: { persistSession: false },
});

type UUID = string;

const RESET_DB = process.env.RESET_DB === "true";
const ALLOW_PROD_RESET = process.env.ALLOW_PROD_RESET === "true";
const IS_HOSTED = SUPABASE_URL.includes("supabase.co");

// Guard rails
if (RESET_DB && IS_HOSTED && !ALLOW_PROD_RESET) {
  throw new Error(
    "RESET_DB=true detected. Refusing to truncate hosted Supabase unless ALLOW_PROD_RESET=true is also set."
  );
}

// Determinism
const SEED_SALT = process.env.SEED_SALT ?? "rebel-odds-seed-v1";
faker.seed(seed32(SEED_SALT));

// Domain constants (standing must match DB check constraint → lowercase)
const STANDINGS = ["freshman", "sophomore", "junior", "senior"] as const;
const PERFORMANCE_TIERS = ["top", "average", "underdog"] as const;
const CONTRACT_TYPES = ["gpa", "course"] as const;

const SUBJECTS = [
  "BIO",
  "CS",
  "ART",
  "MATH",
  "ENG",
  "CHEM",
  "PSY",
  "NURS",
  "BUS",
] as const;

function sha256Hex(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}
function stableUuid(input: string): UUID {
  const hex = sha256Hex(input).slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
function seed32(input: string): number {
  const hex = sha256Hex(input).slice(0, 8);
  return parseInt(hex, 16) >>> 0;
}
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

async function rpcOrThrow(fn: string) {
  const { error } = await supabase.rpc(fn);
  if (error) throw error;
}

async function countTable(table: string): Promise<number> {
  const { count, error } = await supabase.from(table).select("*", {
    head: true,
    count: "exact",
  });
  if (error) throw error;
  return count ?? 0;
}

async function resetDbIfRequested() {
  if (!RESET_DB) return;

  console.log("RESET_DB: calling reset_app()...");
  await rpcOrThrow("reset_app");

  const walletsCount = await countTable("wallets");
  const txCount = await countTable("wallet_transactions");
  console.log("DEBUG after reset:", { walletsCount, txCount });

  if (walletsCount !== 0 || txCount !== 0) {
    throw new Error(
      `reset_app() ran but wallets=${walletsCount}, wallet_transactions=${txCount}. Fix reset_app() to clear both.`
    );
  }

  console.log("RESET_DB: reset_app() truncated app tables (auth users untouched).");
}

// Auth helpers
async function createAuthUser(email: string, password: string): Promise<UUID> {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;
  if (!data.user?.id) throw new Error("No user id returned from createUser()");
  return data.user.id;
}

async function getOrCreateAuthUser(email: string, password: string): Promise<UUID> {
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });
  if (error) throw error;

  const existing = data.users.find(
    (u) => u.email?.toLowerCase() === email.toLowerCase()
  );
  if (existing?.id) return existing.id;

  return createAuthUser(email, password);
}

function pickDistinctIndices(n: number, k: number, seed: number): number[] {
  const rng = mulberry32(seed);
  const indices = Array.from({ length: n }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  return indices.slice(0, Math.min(k, n));
}

function randomCourse(rng: () => number) {
  const subject = SUBJECTS[Math.floor(rng() * SUBJECTS.length)];
  const level = [100, 200, 300, 400][Math.floor(rng() * 4)];
  const num = level + Math.floor(rng() * 100); // e.g., 100–199, 200–299, etc.
  return { subject, num, code: `${subject} ${num}`, course_level: level };
}

async function main() {
  const now = new Date().toISOString();

  console.log("ENV CHECK:", {
    SUPABASE_URL,
    SUPABASE_SECRET_KEY_PREFIX: SUPABASE_SECRET_KEY.slice(0, 12),
    RESET_DB,
    SEED_SALT,
  });

  console.log("Seeding...");

  // ---- knobs ----
  const NUM_TRADERS_TOTAL = 12; // includes demo user
  const NUM_STUDENTS = 30;
  const NUM_PROFESSORS = 6;
  const CONTRACTS_PER_STUDENT = { min: 1, max: 2 };
  const INITIAL_BALANCE = 10_000;

  const TRADES_PER_USER = { min: 3, max: 8 };
  const TOKENS_SPENT_RANGE = { min: 50, max: 400 };

  const SEED_SOME_RESOLVED = true;
  const NUM_RESOLVED = 5;

  // fee settings
  const NON_TOP_FEE = 0.03; // 3%
  const TOP_FEE_MIN = 0.04; // 4%
  const TOP_FEE_MAX = 0.08; // 8%

  // 0) RESET (optional)
  await resetDbIfRequested();

  // 1) AUTH USERS + PROFILES (includes a stable demo user)
  console.log("STEP 1: profiles/auth users...");

  const seedPassword = process.env.SEED_USER_PASSWORD ?? "Password123!";

  const DEMO_EMAIL = process.env.DEMO_USER_EMAIL ?? "demo@rebelodds.dev";
  const DEMO_USERNAME = process.env.DEMO_USER_USERNAME ?? "demo_trader";
  const DEMO_PASSWORD = process.env.DEMO_USER_PASSWORD ?? seedPassword;

  const demoUserId = await getOrCreateAuthUser(DEMO_EMAIL, DEMO_PASSWORD);

  const profiles: Array<{
    id: UUID;
    username: string;
    role: "trader";
    created_at: string;
    updated_at: string;
  }> = [
    {
      id: demoUserId,
      username: DEMO_USERNAME,
      role: "trader",
      created_at: now,
      updated_at: now,
    },
  ];

  const NUM_OTHER_TRADERS = Math.max(0, NUM_TRADERS_TOTAL - 1);
  for (let i = 0; i < NUM_OTHER_TRADERS; i++) {
    const email = `seed.trader.${i}@example.com`;
    const userId = await getOrCreateAuthUser(email, seedPassword);

    faker.seed(seed32(`${SEED_SALT}:username:${userId}`));
    const username = faker.internet.username().toLowerCase();

    profiles.push({
      id: userId,
      username,
      role: "trader",
      created_at: now,
      updated_at: now,
    });
  }

  {
    const { error } = await supabase.from("profiles").upsert(profiles, { onConflict: "id" });
    if (error) throw error;
  }

  // 2) WALLETS (select/insert only — never upsert wallets)
  console.log("STEP 2: wallets (select/insert only)...");

  const walletByUser = new Map<UUID, { wallet_id: UUID; balance: number }>();

  for (const p of profiles) {
    const { data: existing, error: readErr } = await supabase
      .from("wallets")
      .select("id,balance_tokens")
      .eq("user_id", p.id)
      .maybeSingle();

    if (readErr) throw readErr;

    if (existing?.id) {
      walletByUser.set(p.id, { wallet_id: existing.id, balance: existing.balance_tokens });
      continue;
    }

    const wallet_id = stableUuid(`${SEED_SALT}:wallet:${p.id}`);
    const { error: insErr } = await supabase.from("wallets").insert({
      id: wallet_id,
      user_id: p.id,
      balance_tokens: INITIAL_BALANCE,
      created_at: now,
      updated_at: now,
    });
    if (insErr) throw insErr;

    walletByUser.set(p.id, { wallet_id, balance: INITIAL_BALANCE });
  }

  // 2b) initial_grant wallet_transactions (valid type)
  console.log("STEP 2b: initial_grant wallet_transactions...");

  {
    const grantTx = profiles.map((p) => {
      const w = walletByUser.get(p.id)!;
      return {
        id: stableUuid(`${SEED_SALT}:wallet_tx:initial_grant:${w.wallet_id}`),
        wallet_id: w.wallet_id,
        amount: INITIAL_BALANCE,
        balance_after: INITIAL_BALANCE,
        type: "initial_grant", // must match wallet_transactions_type_check
        reference_id: null,
        created_at: now,
      };
    });

    const { error } = await supabase
      .from("wallet_transactions")
      .upsert(grantTx, { onConflict: "id" });

    if (error) throw error;
  }

  // 3) PROFESSORS
  console.log("STEP 3: professors...");

  faker.seed(seed32(`${SEED_SALT}:professors`));
  const professors = Array.from({ length: NUM_PROFESSORS }).map((_, i) => ({
    id: stableUuid(`${SEED_SALT}:professor:${i}`),
    name: `Dr. ${faker.person.lastName()}`,
    institution_name: faker.helpers.arrayElement(["UNLV", "CSN", "UNR"]),
    overall_rating: faker.number.float({ min: 2.8, max: 4.9, multipleOf: 0.1 }),
    num_ratings: faker.number.int({ min: 10, max: 350 }),
    created_at: now,
    updated_at: now,
  }));

  {
    const { error } = await supabase.from("professors").upsert(professors, { onConflict: "id" });
    if (error) throw error;
  }

  // 4) STUDENTS (standing lowercase, streak >= 0, fee percent rules)
  console.log("STEP 4: students...");

  faker.seed(seed32(`${SEED_SALT}:students`));
  const majors = [
    "Computer Science",
    "Nursing",
    "Business",
    "Engineering",
    "Biology",
    "Psychology",
    "Math",
  ];

  const students = Array.from({ length: NUM_STUDENTS }).map((_, i) => {
    const performance_tier = faker.helpers.arrayElement(PERFORMANCE_TIERS);

    const trade_fee_percent =
      performance_tier === "top"
        ? faker.number.float({ min: TOP_FEE_MIN, max: TOP_FEE_MAX, multipleOf: 0.001 })
        : NON_TOP_FEE;

    return {
      id: stableUuid(`${SEED_SALT}:student:${i}`),
      name: faker.person.fullName(),
      major: faker.helpers.arrayElement(majors),
      standing: faker.helpers.arrayElement(STANDINGS), // lowercase to satisfy constraint
      previous_gpa: faker.number.float({ min: 2.0, max: 4.0, multipleOf: 0.01 }),
      trade_fee_percent,
      streak: faker.number.int({ min: 0, max: 10 }), // min 0
      performance_tier,
      created_at: now,
      updated_at: now,
    };
  });

  {
    const { error } = await supabase.from("students").upsert(students, { onConflict: "id" });
    if (error) throw error;
  }

  const studentById = new Map(students.map((s) => [s.id, s]));

  // 5) CONTRACTS (omit generated total_token_pool)
  console.log("STEP 5: contracts...");

  const contracts: any[] = [];

  for (const s of students) {
    const rng = mulberry32(seed32(`${SEED_SALT}:contracts_for_student:${s.id}`));
    const count =
      CONTRACTS_PER_STUDENT.min +
      Math.floor(rng() * (CONTRACTS_PER_STUDENT.max - CONTRACTS_PER_STUDENT.min + 1));

    for (let i = 0; i < count; i++) {
      const type = CONTRACT_TYPES[Math.floor(rng() * CONTRACT_TYPES.length)];
      const professor = professors[Math.floor(rng() * professors.length)];

      const startingYes = Math.round((0.2 + rng() * 0.6) * 100) / 100;
      const startingNo = Number((1 - startingYes).toFixed(2));

      const threshold =
        type === "gpa"
          ? Math.round((2.5 + rng() * 1.5) * 10) / 10
          : 60 + Math.floor(rng() * 36);

      const firstName = s.name.split(" ")[0];
      const course = randomCourse(rng);

      const title =
        type === "gpa"
          ? `Will ${firstName} finish with a semester GPA of ${threshold}?`
          : `Will ${firstName} finish ${course.code} with a course grade ≥ ${threshold}%?`;

      contracts.push({
        id: stableUuid(`${SEED_SALT}:contract:${s.id}:${i}`),
        title,
        description:
          type === "gpa"
            ? "End of semester GPA contract"
            : `End of semester course grade contract (${course.code})`,
        student_id: s.id,
        professor_id: professor.id,
        type,
        threshold,
        course_level: course.course_level,
        is_milestone: rng() > 0.5,
        starting_yes_odds: startingYes,
        starting_no_odds: startingNo,

        yes_token_pool: 0,
        no_token_pool: 0,
        // total_token_pool is GENERATED in your DB → do NOT insert/update it
        seed_tokens: 250 + Math.floor(rng() * 1751),

        yes_shares_outstanding: 0,
        no_shares_outstanding: 0,

        status: "active",
        outcome: null,
        end_date: null,
        resolved_at: null,
        created_at: now,
        updated_at: now,
      });
    }
  }

  {
    const { error } = await supabase.from("contracts").upsert(contracts, { onConflict: "id" });
    if (error) throw error;
  }

  // Track pools + shares outstanding in-memory while generating trades
  const poolByContract = new Map<UUID, { yes: number; no: number }>();
  const sharesByContract = new Map<UUID, { yes: number; no: number }>();
  for (const c of contracts) {
    poolByContract.set(c.id, { yes: 0, no: 0 });
    sharesByContract.set(c.id, { yes: 0, no: 0 });
  }

  // 6) TRADES + POSITIONS + WALLET_TX
  console.log("STEP 6: trades/positions/wallet_transactions...");

  const positionsAgg = new Map<
    string,
    { id: UUID; user_id: UUID; contract_id: UUID; yes: number; no: number }
  >();

  const tradeRows: any[] = [];
  const walletTxRows: any[] = [];

  for (const u of profiles) {
    const rng = mulberry32(seed32(`${SEED_SALT}:trades_for_user:${u.id}`));
    const howMany =
      TRADES_PER_USER.min +
      Math.floor(rng() * (TRADES_PER_USER.max - TRADES_PER_USER.min + 1));

    const chosenIdx = pickDistinctIndices(
      contracts.length,
      Math.min(howMany, contracts.length),
      seed32(`${SEED_SALT}:pick_contracts:${u.id}`)
    );
    const chosenContracts = chosenIdx.map((i) => contracts[i]);

    for (let ti = 0; ti < chosenContracts.length; ti++) {
      const c = chosenContracts[ti];
      const pools = poolByContract.get(c.id)!;
      const outstanding = sharesByContract.get(c.id)!;
      const student = studentById.get(c.student_id)!;

      const total = pools.yes + pools.no;
      const priceYes = total === 0 ? 0.5 : pools.yes / total;
      const priceNo = total === 0 ? 0.5 : pools.no / total;

      const side = rng() > 0.5 ? "yes" : "no";
      const tokens_spent =
        TOKENS_SPENT_RANGE.min +
        Math.floor(rng() * (TOKENS_SPENT_RANGE.max - TOKENS_SPENT_RANGE.min + 1));

      const fee_percent_at_trade = student.trade_fee_percent;
      const fee = Math.max(1, Math.round(tokens_spent * fee_percent_at_trade));
      const shares_received = Math.max(1, tokens_spent - fee);
      const total_cost = tokens_spent + fee;

      const wallet = walletByUser.get(u.id)!;
      if (wallet.balance < total_cost) continue;

      // update pools + outstanding shares
      if (side === "yes") {
        pools.yes += shares_received;
        outstanding.yes += shares_received;
      } else {
        pools.no += shares_received;
        outstanding.no += shares_received;
      }

      wallet.balance -= total_cost;

      const trade_id = stableUuid(`${SEED_SALT}:trade:${u.id}:${c.id}:${ti}`);
      tradeRows.push({
        id: trade_id,
        user_id: u.id,
        contract_id: c.id,
        side,
        tokens_spent,
        shares_received,
        fee,
        fee_percent_at_trade,
        price_yes_at_trade: Number(priceYes.toFixed(4)),
        price_no_at_trade: Number(priceNo.toFixed(4)),
        yes_pool_after: pools.yes,
        no_pool_after: pools.no,
        created_at: now,
      });

      walletTxRows.push({
        id: stableUuid(`${SEED_SALT}:wallet_tx:trade_purchase:${trade_id}`),
        wallet_id: wallet.wallet_id,
        amount: -total_cost,
        balance_after: wallet.balance,
        type: "trade_purchase", // must match wallet_transactions_type_check
        reference_id: trade_id,
        created_at: now,
      });

      const posKey = `${u.id}::${c.id}`;
      if (!positionsAgg.has(posKey)) {
        positionsAgg.set(posKey, {
          id: stableUuid(`${SEED_SALT}:position:${u.id}:${c.id}`),
          user_id: u.id,
          contract_id: c.id,
          yes: 0,
          no: 0,
        });
      }
      const pos = positionsAgg.get(posKey)!;
      if (side === "yes") pos.yes += shares_received;
      else pos.no += shares_received;
    }
  }

  if (tradeRows.length) {
    const { error } = await supabase.from("trades").upsert(tradeRows, { onConflict: "id" });
    if (error) throw error;
  }

  const positionRows = Array.from(positionsAgg.values()).map((p) => ({
    id: p.id,
    user_id: p.user_id,
    contract_id: p.contract_id,
    yes_shares: p.yes,
    no_shares: p.no,
    realized_pnl: null,
    status: "open",
    created_at: now,
    updated_at: now,
  }));

  if (positionRows.length) {
    const { error } = await supabase.from("positions").upsert(positionRows, { onConflict: "id" });
    if (error) throw error;
  }

  if (walletTxRows.length) {
    const { error } = await supabase
      .from("wallet_transactions")
      .upsert(walletTxRows, { onConflict: "id" });
    if (error) throw error;
  }

  // 6b) update wallet balances
  console.log("STEP 6b: update wallet balances...");
  for (const u of profiles) {
    const w = walletByUser.get(u.id)!;
    const { error } = await supabase
      .from("wallets")
      .update({ balance_tokens: w.balance, updated_at: now })
      .eq("id", w.wallet_id);
    if (error) throw error;
  }

  // 6c) update contract pools + shares outstanding (omit total_token_pool)
  console.log("STEP 6c: update contract pools...");
  for (const c of contracts) {
    const pools = poolByContract.get(c.id)!;
    const out = sharesByContract.get(c.id)!;

    const { error } = await supabase
      .from("contracts")
      .update({
        yes_token_pool: pools.yes,
        no_token_pool: pools.no,
        yes_shares_outstanding: out.yes,
        no_shares_outstanding: out.no,
        updated_at: now,
      })
      .eq("id", c.id);

    if (error) throw error;
  }

  // 7) OPTIONAL: resolve a few (contract_resolutions has no created_at → do not include)
  console.log("STEP 7: optional resolutions...");
  if (SEED_SOME_RESOLVED && contracts.length > 0) {
    const idx = pickDistinctIndices(
      contracts.length,
      Math.min(NUM_RESOLVED, contracts.length),
      seed32(`${SEED_SALT}:resolve_some`)
    );
    const toResolve = idx.map((i) => contracts[i]);

    const resolutionRows = toResolve.map((c, i) => ({
      id: stableUuid(`${SEED_SALT}:contract_resolution:${c.id}:${i}`),
      contract_id: c.id,
      resolved_by: profiles[i % profiles.length].id,
      outcome: (seed32(`${SEED_SALT}:outcome:${c.id}`) % 2) === 0,
      total_shares_paid: 100,
      total_shares_burned: 50,
      total_tokens_paid_out: 500,
      resolved_at: now,
    }));

    for (const r of resolutionRows) {
      const { error } = await supabase
        .from("contracts")
        .update({
          status: "resolved",
          outcome: r.outcome,
          resolved_at: r.resolved_at,
          updated_at: now,
        })
        .eq("id", r.contract_id);
      if (error) throw error;
    }

    const { error } = await supabase
      .from("contract_resolutions")
      .upsert(resolutionRows, { onConflict: "id" });
    if (error) throw error;
  }

  console.log("Seed complete ✅");
  console.log("Demo trader:", {
    email: DEMO_EMAIL,
    username: DEMO_USERNAME,
    password: DEMO_PASSWORD,
    user_id: demoUserId,
    wallet_id: walletByUser.get(demoUserId)?.wallet_id,
  });

  console.log(`Counts snapshot:
- profiles: ${profiles.length}
- wallets: ${await countTable("wallets")}
- wallet_transactions: ${await countTable("wallet_transactions")}
- professors: ${await countTable("professors")}
- students: ${await countTable("students")}
- contracts: ${await countTable("contracts")}
- trades: ${await countTable("trades")}
- positions: ${await countTable("positions")}
- contract_resolutions: ${await countTable("contract_resolutions")}
`);
}

main().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});