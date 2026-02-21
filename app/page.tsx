"use client";

import { useEffect, useMemo, useState } from "react";

// ── Types used by UI ───────────────────────────────────────────────────────
type PerformanceTier = "top" | "average" | "underdog";
type ContractType = "gpa" | "course" | "credits";

type ContractRow = {
  id: string;
  title: string;
  type: ContractType;
  status: string;
  end_date: string | null;

  seed_tokens: number;
  yes_token_pool: number;
  no_token_pool: number;

  students?: {
    name?: string | null;
    major?: string | null;
    standing?: string | null;
    performance_tier?: PerformanceTier | null;
  } | null;
};

type ContractsResponse = { ok: boolean; data?: ContractRow[]; error?: string };

type MeResponse = {
  ok: boolean;
  user: { id: string } | null;
  profile?: { id?: string; username?: string | null } | null;
  wallet?: { id?: string; balance_tokens?: number | null } | null;
  error?: string | null;
};

type ContractUI = {
  id: string;
  title: string;
  type: ContractType;
  status: string;
  end_date: string;

  yes_pool: number;
  no_pool: number;
  volume: number;

  student: {
    name: string;
    major: string;
    standing: string;
    performance_tier: PerformanceTier;
  };
};

type TierBadge = { bg: string; label: string };

// ── Helpers ───────────────────────────────────────────────────────────────
function yesPrice(yesPool: number, noPool: number) {
  const denom = yesPool + noPool;
  if (denom <= 0) return 0.5;
  return yesPool / denom;
}

function daysLeft(dateStr: string) {
  const diff = new Date(dateStr).getTime() - new Date().getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function tierBadge(tier: PerformanceTier): TierBadge {
  if (tier === "top") return { bg: "#A03123", label: "Top Scholar" };
  if (tier === "underdog") return { bg: "#6A737B", label: "Underdog" };
  return { bg: "#666666", label: "Average" };
}

function typeIcon(contractType: ContractType) {
  if (contractType === "gpa") return "📊";
  if (contractType === "course") return "📚";
  return "🎓";
}

function fallbackEndDate(end_date: string | null) {
  if (end_date) return end_date;
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString();
}

function toUIContract(row: ContractRow): ContractUI {
  const seed = Number(row.seed_tokens ?? 0);
  const yes_pool = Number(row.yes_token_pool ?? 0) + seed;
  const no_pool = Number(row.no_token_pool ?? 0) + seed;
  const student = row.students ?? null;

  return {
    id: row.id,
    title: row.title ?? "Untitled Contract",
    type: row.type ?? "course",
    status: row.status ?? "active",
    end_date: fallbackEndDate(row.end_date),

    yes_pool,
    no_pool,
    volume: yes_pool + no_pool,

    student: {
      name: String(student?.name ?? "Unknown Student"),
      major: String(student?.major ?? "Unknown Major"),
      standing: String(student?.standing ?? "Unknown Standing"),
      performance_tier: (student?.performance_tier ?? "average") as PerformanceTier,
    },
  };
}

// safer JSON parsing (prevents "Unexpected token <" crashes)
async function safeJson<T>(res: Response): Promise<T> {
  const text = await res.text();
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("application/json")) {
    throw new Error(`Expected JSON but got "${ct}" (${res.status}). Body: ${text.slice(0, 160)}`);
  }
  return JSON.parse(text) as T;
}

// ── UI Bits ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: string }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 4px rgba(0,0,0,.06)", minWidth: 0 }}>
      <div style={{ fontSize: 10, color: "#9FA1A4", textTransform: "uppercase", letterSpacing: 2, marginBottom: 4, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 900, color: accent ?? "#000", fontFamily: "Georgia,serif", lineHeight: 1.1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "#9FA1A4", marginTop: 2 }}>{sub}</div>
    </div>
  );
}

function ProbBar({ yesPool, noPool }: { yesPool: number; noPool: number }) {
  const pctNum = yesPrice(yesPool, noPool) * 100;
  const pct = pctNum.toFixed(1);
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 700, marginBottom: 4 }}>
        <span style={{ color: "#2d8a4e" }}>{pct}% YES</span>
        <span style={{ color: "#E31837" }}>{(100 - parseFloat(pct)).toFixed(1)}% NO</span>
      </div>
      <div style={{ height: 7, borderRadius: 99, background: "#f0d0d0", overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, background: "linear-gradient(90deg,#2d8a4e,#4caf72)", borderRadius: 99, transition: "width .7s ease" }} />
      </div>
    </div>
  );
}

function ContractCard({ contract, onClick }: { contract: ContractUI; onClick: (c: ContractUI) => void }) {
  const tier = tierBadge(contract.student.performance_tier);
  const days = daysLeft(contract.end_date);
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={() => onClick(contract)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        border: `1.5px solid ${hov ? "#E31837" : "#e0e0e0"}`,
        borderRadius: 14,
        padding: 18,
        textAlign: "left",
        cursor: "pointer",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        boxShadow: hov ? "0 6px 20px rgba(227,24,55,.12)" : "0 1px 4px rgba(0,0,0,.05)",
        transform: hov ? "translateY(-2px)" : "none",
        transition: "all .2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 16 }}>{typeIcon(contract.type)}</span>
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: tier.bg, color: "#fff" }}>
            {tier.label}
          </span>
        </div>
        {days > 0 && (
          <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: days <= 3 ? "#E31837" : "#f0f0f0", color: days <= 3 ? "#fff" : "#666666" }}>
            {days}d left
          </span>
        )}
      </div>

      <div>
        <div style={{ fontWeight: 800, fontSize: 13, color: hov ? "#B10202" : "#000", lineHeight: 1.35, fontFamily: "Georgia,serif" }}>
          {contract.title}
        </div>
        <div style={{ fontSize: 11, color: "#9FA1A4", marginTop: 2 }}>
          {contract.student.major} · {contract.student.standing}
        </div>
      </div>

      <ProbBar yesPool={contract.yes_pool} noPool={contract.no_pool} />

      <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 8, borderTop: "1px solid #f0f0f0" }}>
        <span style={{ fontSize: 10, color: "#9FA1A4" }}>Vol: {(contract.volume / 1000).toFixed(1)}K RT</span>
        <span style={{ fontSize: 10, fontWeight: 700, color: "#E31837", opacity: hov ? 1 : 0, transition: "opacity .2s" }}>
          Trade →
        </span>
      </div>
    </button>
  );
}

function TradeModal({
  contract,
  onClose,
  onTraded,
}: {
  contract: ContractUI;
  onClose: () => void;
  onTraded: () => Promise<void>;
}) {
  const [side, setSide] = useState<"yes" | "no">("yes");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tier = tierBadge(contract.student.performance_tier);
  const priceYes = yesPrice(contract.yes_pool, contract.no_pool);
  const curPrice = side === "yes" ? priceYes : 1 - priceYes;

  const amountNum = amount === "" ? NaN : Number(amount);
  const canTrade = Number.isFinite(amountNum) && amountNum > 0;

  const estShares = canTrade ? (amountNum / curPrice).toFixed(2) : "—";
  const fee = canTrade ? (amountNum * 0.005).toFixed(2) : "—";

  async function submit() {
    if (!canTrade || submitting) return;
    setSubmitting(true);
    setErr(null);

    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contractId: contract.id,
          side,
          action: "buy",
          amountTokens: amountNum,
        }),
      });

      const payload = await safeJson<{ ok: boolean; error?: string }>(res);
      if (!res.ok || !payload.ok) throw new Error(payload.error ?? `Trade failed (${res.status})`);

      await onTraded();
      onClose();
    } catch (e: any) {
      setErr(e?.message ?? "Trade failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,.75)", backdropFilter: "blur(4px)" }}>
      <div style={{ background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(0,0,0,.3)", maxWidth: 440, width: "100%", border: "2px solid #E31837", overflow: "hidden" }}>
        <div style={{ background: "#1e1e1e", padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ color: "#E31837", fontSize: 10, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>Contract Detail</div>
            <h2 style={{ color: "#fff", fontWeight: 900, fontSize: 15, lineHeight: 1.3, fontFamily: "Georgia,serif", margin: 0 }}>{contract.title}</h2>
          </div>
          <button onClick={onClose} style={{ color: "#666", background: "none", border: "none", fontSize: 24, cursor: "pointer", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ background: tier.bg, borderRadius: 12, padding: "12px 14px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 15 }}>
              {contract.student.name[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>{contract.student.name}</div>
              <div style={{ color: "rgba(255,255,255,.7)", fontSize: 11 }}>{contract.student.major} · {contract.student.standing}</div>
            </div>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: "rgba(255,255,255,.2)", color: "#fff" }}>{tier.label}</span>
          </div>

          <div>
            <ProbBar yesPool={contract.yes_pool} noPool={contract.no_pool} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9FA1A4", marginTop: 6 }}>
              <span>YES Pool: {contract.yes_pool.toLocaleString()} RT</span>
              <span>NO Pool: {contract.no_pool.toLocaleString()} RT</span>
            </div>
          </div>

          <div>
            <div style={{ display: "flex", borderRadius: 12, overflow: "hidden", border: "1.5px solid #e0e0e0", marginBottom: 12 }}>
              <button onClick={() => setSide("yes")} style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", background: side === "yes" ? "#2d8a4e" : "#fff", color: side === "yes" ? "#fff" : "#666" }}>
                Buy YES
              </button>
              <button onClick={() => setSide("no")} style={{ flex: 1, padding: "10px 0", fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", background: side === "no" ? "#E31837" : "#fff", color: side === "no" ? "#fff" : "#666" }}>
                Buy NO
              </button>
            </div>

            <div style={{ position: "relative", marginBottom: 10 }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Token amount..."
                style={{ width: "100%", border: "1.5px solid #e0e0e0", borderRadius: 12, padding: "12px 48px 12px 16px", fontSize: 13, outline: "none", boxSizing: "border-box" }}
                onFocus={(e) => (e.currentTarget.style.borderColor = "#E31837")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "#e0e0e0")}
              />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", fontSize: 11, color: "#9FA1A4", fontWeight: 700 }}>RT</span>
            </div>

            <div style={{ background: "#f8f8f8", borderRadius: 12, padding: "12px 14px", fontSize: 12, display: "flex", flexDirection: "column", gap: 6 }}>
              {(
                [
                  ["Price per share", `${(curPrice * 100).toFixed(1)}%`],
                  ["Est. shares", estShares],
                  ["Fee (0.5%)", `${fee} RT`],
                ] as [string, string][]
              ).map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#9FA1A4" }}>{k}</span>
                  <span style={{ fontWeight: 700, color: "#000" }}>{v}</span>
                </div>
              ))}
            </div>

            {err && <div style={{ marginTop: 10, background: "#fff", border: "1px solid #f0d0d0", color: "#B10202", borderRadius: 12, padding: 10, fontSize: 12 }}>{err}</div>}
          </div>

          <button
            disabled={!canTrade || submitting}
            onClick={submit}
            style={{ width: "100%", padding: "13px 0", borderRadius: 12, fontWeight: 900, fontSize: 14, border: "none", cursor: canTrade && !submitting ? "pointer" : "not-allowed", opacity: canTrade && !submitting ? 1 : 0.4, background: side === "yes" ? "#2d8a4e" : "#E31837", color: "#fff", fontFamily: "Georgia,serif" }}
          >
            {submitting ? "Placing trade…" : side === "yes" ? "Buy YES Shares" : "Buy NO Shares"}
          </button>

          <p style={{ textAlign: "center", fontSize: 10, color: "#9FA1A4", margin: 0 }}>⚠️ Paper trading only · Rebel Tokens have no cash value</p>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [sort, setSort] = useState<"trending" | "newest">("trending");
  const [selected, setSelected] = useState<ContractUI | null>(null);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [username, setUsername] = useState("demo_trader");
  const [walletBalance, setWalletBalance] = useState<number>(0);

  const [contracts, setContracts] = useState<ContractUI[]>([]);

  async function loadAll() {
    // ensure cookies exist (safe no-op if already logged in)
    await fetch("/api/demo/login", { method: "POST" }).catch(() => {});

    const meRes = await fetch("/api/me", { cache: "no-store" });
    const me = await safeJson<MeResponse>(meRes);
    if (!meRes.ok || !me.ok) throw new Error(me.error ?? `Failed to load /api/me (${meRes.status})`);

    setUsername(me?.profile?.username ?? "demo_trader");
    setWalletBalance(Number(me?.wallet?.balance_tokens ?? 0));

    const cRes = await fetch("/api/contracts", { cache: "no-store" });
    const c = await safeJson<ContractsResponse>(cRes);
    if (!cRes.ok || !c.ok) throw new Error(c.error ?? `Failed to load /api/contracts (${cRes.status})`);

    const rows = Array.isArray(c.data) ? c.data : [];
    setContracts(rows.map(toUIContract));
  }

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        await loadAll();
      } catch (e: any) {
        console.error(e);
        setErr(e?.message ?? "Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filteredSorted = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = contracts.filter((c) => !q || c.title.toLowerCase().includes(q) || c.student.name.toLowerCase().includes(q));
    return filtered.sort((a, b) => {
      if (sort === "trending") return (b.yes_pool + b.no_pool) - (a.yes_pool + a.no_pool);
      return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
    });
  }, [contracts, search, sort]);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", fontFamily: "'Helvetica Neue',Arial,sans-serif" }}>
      <div style={{ background: "#1e1e1e", borderBottom: "4px solid #E31837", padding: "28px 20px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 16, alignItems: "flex-end", justifyContent: "space-between" }}>
          <div>
            <p style={{ color: "#E31837", fontSize: 11, textTransform: "uppercase", letterSpacing: 3, marginBottom: 6, fontWeight: 700 }}>
              {loading ? "Loading…" : `Welcome back, ${username}`}
            </p>
            <h1 style={{ color: "#fff", fontSize: "clamp(22px,5vw,32px)", fontWeight: 900, fontFamily: "Georgia,serif", margin: 0, lineHeight: 1.1 }}>
              Today&apos;s Markets
            </h1>
            <p style={{ color: "#9FA1A4", fontSize: 13, marginTop: 6, marginBottom: 0 }}>Trade YES/NO contracts on student academic outcomes</p>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ color: "#E31837", fontSize: "clamp(20px,4vw,26px)", fontWeight: 900 }}>{walletBalance.toLocaleString()}</div>
              <div style={{ color: "#9FA1A4", fontSize: 11 }}>Rebel Tokens</div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 20px" }}>
        <style>{`
          .ro-stats-grid { grid-template-columns: repeat(4, 1fr); }
          @media (max-width: 700px) { .ro-stats-grid { grid-template-columns: repeat(2, 1fr); } }
          @media (max-width: 380px) { .ro-stats-grid { grid-template-columns: 1fr; } }
          .ro-filters { display: flex; flex-wrap: wrap; gap: 10px; align-items: center; margin-bottom: 20px; }
          .ro-sort-btns { display: flex; gap: 8px; }
          .ro-search { border: 1.5px solid #ddd; background: #fff; border-radius: 9px; padding: 9px 16px; font-size: 13px; outline: none; width: 240px; box-sizing: border-box; }
          .ro-search:focus { border-color: #E31837; }
          @media (max-width: 480px) {
            .ro-filters { flex-direction: column; align-items: stretch; }
            .ro-sort-btns { flex-direction: column; width: 100%; }
            .ro-sort-btns button { width: 100%; }
            .ro-search { width: 100%; text-align: center; }
          }
        `}</style>

        <div className="ro-stats-grid" style={{ display: "grid", gap: 12, marginTop: -20, marginBottom: 24 }}>
          <StatCard label="Active Markets" value={`${contracts.length}`} sub="Open for trading" />
          <StatCard label="Your Balance" value={`${walletBalance.toLocaleString()} RT`} sub="Available tokens" accent="#2d8a4e" />
          <StatCard label="Positions" value="—" sub="Coming soon" />
          <StatCard label="Rank" value="—" sub="(Navbar handles rank)" accent="#B10202" />
        </div>

        {err && (
          <div style={{ background: "#fff", border: "1px solid #f0d0d0", borderRadius: 12, padding: 14, marginBottom: 16 }}>
            <div style={{ fontWeight: 800, color: "#B10202", marginBottom: 4 }}>Couldn’t load markets</div>
            <div style={{ fontSize: 12, color: "#666" }}>{err}</div>
          </div>
        )}

        <div className="ro-filters">
          <div className="ro-sort-btns">
            {(["trending", "newest"] as const).map((key) => {
              const labels: Record<string, string> = { trending: "🔥 Trending", newest: "🆕 Newest" };
              return (
                <button
                  key={key}
                  onClick={() => setSort(key)}
                  style={{
                    padding: "9px 18px",
                    borderRadius: 9,
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: sort === key ? "#E31837" : "#fff",
                    color: sort === key ? "#fff" : "#666",
                    border: `1.5px solid ${sort === key ? "#E31837" : "#ddd"}`,
                  }}
                >
                  {labels[key]}
                </button>
              );
            })}
          </div>

          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search contracts or students..." className="ro-search" />
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9FA1A4" }}>Loading markets…</div>
        ) : filteredSorted.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#9FA1A4" }}>No contracts match your search.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16, paddingBottom: 48 }}>
            {filteredSorted.map((c) => (
              <ContractCard key={c.id} contract={c} onClick={setSelected} />
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", paddingBottom: 32 }}>
          <p style={{ fontSize: 10, color: "#9FA1A4", maxWidth: 420, margin: "0 auto" }}>
            ⚠️ <strong>Paper Trading Only.</strong> Rebel Tokens are virtual currency with no monetary value. No real money is involved. For educational and demonstration purposes only.
          </p>
        </div>
      </div>

      {selected && (
        <TradeModal
          contract={selected}
          onClose={() => setSelected(null)}
          onTraded={async () => {
            await loadAll();
          }}
        />
      )}
    </div>
  );
}