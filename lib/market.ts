// lib/market.ts
import { adminClient } from "@/lib/supabase/admin";
import { calculateFee } from "@/lib/amm";
import type { TradeAction, TradeInput, TradeResult, TradeSide } from "@/types/trade";

function assertUuid(id: string, label: string) {
  const ok = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
  if (!ok) throw new Error(`Invalid UUID for ${label}: ${id}`);
}

function priceYesFromPools(yesPool: number, noPool: number) {
  const total = yesPool + noPool;
  if (total <= 0) return 0.5;
  return yesPool / total;
}

function sharesFromSpend(pSide: number, amountTokens: number) {
  const safeP = Math.max(pSide, 0.01);
  return amountTokens / safeP;
}

export async function executeTrade(
  userId: string,
  input: TradeInput,
): Promise<TradeResult> {
  assertUuid(userId, "userId");
  assertUuid(input.contractId, "contractId");

  const side: TradeSide = input.side;
  const action: TradeAction = input.action;
  const amountTokensNum = Number(input.amountTokens);

  if (!Number.isFinite(amountTokensNum) || amountTokensNum <= 0) {
    throw new Error("amountTokens must be a positive number.");
  }

  // IMPORTANT: DB columns for wallet + pools are typically integers.
  // Keep spend + fee as integers to avoid invalid integer syntax.
  const amountTokens = Math.floor(amountTokensNum);
  if (amountTokens <= 0) throw new Error("amountTokens is too small.");

  const fee = calculateFee(amountTokens); // integer
  const totalDebit = amountTokens + fee;

  // Fetch wallet
  const { data: wallet, error: walletErr } = await adminClient
    .from("wallets")
    .select("id,user_id,balance_tokens")
    .eq("user_id", userId)
    .maybeSingle();

  if (walletErr) throw new Error(walletErr.message);
  if (!wallet) throw new Error("Wallet not found.");

  // Fetch contract
  const { data: contract, error: contractErr } = await adminClient
    .from("contracts")
    .select("id,seed_tokens,yes_token_pool,no_token_pool,status,end_date")
    .eq("id", input.contractId)
    .maybeSingle();

  if (contractErr) throw new Error(contractErr.message);
  if (!contract) throw new Error("Contract not found.");

  if (contract.status !== "active") throw new Error("Contract is not active.");
  if (contract.end_date && new Date(contract.end_date).getTime() <= Date.now()) {
    throw new Error("Contract has expired.");
  }

  const seed = Number(contract.seed_tokens ?? 0);
  const yesPoolLive = Number(contract.yes_token_pool ?? 0) + seed;
  const noPoolLive = Number(contract.no_token_pool ?? 0) + seed;

  const pYes = priceYesFromPools(yesPoolLive, noPoolLive);
  const pSide = side === "yes" ? pYes : 1 - pYes;

  // BUY
  if (action === "buy") {
    if (Number(wallet.balance_tokens ?? 0) < totalDebit) {
      throw new Error("Insufficient wallet balance for trade and fee.");
    }

    const sharesReceived = sharesFromSpend(pSide, amountTokens);

    // Update wallet
    const newWalletBalance = Number(wallet.balance_tokens) - totalDebit;

    const { error: wUpErr } = await adminClient
      .from("wallets")
      .update({ balance_tokens: newWalletBalance })
      .eq("id", wallet.id);

    if (wUpErr) throw new Error(wUpErr.message);

    // Update pools (store excluding seed; seed is constant)
    const yesTokenPoolBase = Number(contract.yes_token_pool ?? 0);
    const noTokenPoolBase = Number(contract.no_token_pool ?? 0);

    const nextYesBase = side === "yes" ? yesTokenPoolBase + amountTokens : yesTokenPoolBase;
    const nextNoBase = side === "no" ? noTokenPoolBase + amountTokens : noTokenPoolBase;

    const { error: cUpErr } = await adminClient
      .from("contracts")
      .update({
        yes_token_pool: nextYesBase,
        no_token_pool: nextNoBase,
      })
      .eq("id", contract.id);

    if (cUpErr) throw new Error(cUpErr.message);

    // Insert trade (NO `action` column in DB)
    const { data: insertedTrade, error: tInsErr } = await adminClient
      .from("trades")
      .insert({
        user_id: userId,
        contract_id: contract.id,
        side,
        tokens_spent: amountTokens,          // integer
        shares_received: sharesReceived,     // can be numeric/float
        fee,                                 // integer
        price_yes_at_trade: pYes,
        price_no_at_trade: 1 - pYes,
      })
      .select("id,created_at")
      .maybeSingle();

    if (tInsErr) throw new Error(tInsErr.message);

    const yesPoolAfter = nextYesBase + seed;
    const noPoolAfter = nextNoBase + seed;
    const pYesAfter = priceYesFromPools(yesPoolAfter, noPoolAfter);

    return {
      contractId: contract.id,
      yesPool: yesPoolAfter,
      noPool: noPoolAfter,
      pYes: pYesAfter,
      walletBalance: newWalletBalance,
      position: { yesShares: 0, noShares: 0 }, // optional: wire positions table later
      feeCharged: fee,
      tradeId: insertedTrade?.id,
      tradeCreatedAt: insertedTrade?.created_at,
    } as any;
  }

  // SELL (if you don’t support sell yet, fail loudly)
  throw new Error("Sell is not implemented yet (DB positions not wired).");
}

// Optional exports used elsewhere (keep minimal so Vercel build stops failing)
export async function getLeaderboard() {
  const { data, error } = await adminClient
    .from("wallets")
    .select("user_id,balance_tokens")
    .order("balance_tokens", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPlatformStats() {
  const { count, error } = await adminClient
    .from("trades")
    .select("*", { count: "exact", head: true });

  if (error) throw new Error(error.message);
  return { totalTrades: count ?? 0 };
}