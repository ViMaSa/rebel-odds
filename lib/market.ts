// src/lib/market.ts
import { adminClient } from "@/lib/supabase/admin";
import { calculateFee, sharesFromSpend } from "@/lib/amm";
import { TradeInput, TradeResult } from "@/types/trade";

const STARTING_BALANCE = 10_000;
const FEE_PCT = 0.005;

type DbWallet = {
  id: string;
  user_id: string;
  balance_tokens: number;
};

type DbContract = {
  id: string;
  yes_token_pool: number;
  no_token_pool: number;
  seed_tokens: number;
  total_token_pool: number | null;
  yes_shares_outstanding: number | null;
  no_shares_outstanding: number | null;
  status: string;
  end_date: string | null;
};

type DbPosition = {
  id: string;
  user_id: string;
  contract_id: string;
  yes_shares: number;
  no_shares: number;
  status: string | null;
};

function asInt(n: number) {
  if (!Number.isFinite(n)) return 0;
  return Math.round(n);
}

function ensureTradable(contract: DbContract) {
  if (contract.status !== "active") throw new Error("Contract is not active.");
  if (contract.end_date) {
    const endMs = new Date(contract.end_date).getTime();
    if (Number.isFinite(endMs) && endMs <= Date.now()) throw new Error("Contract has expired.");
  }
}

async function getOrCreateWallet(userId: string): Promise<DbWallet> {
  const { data: existing, error: selErr } = await adminClient
    .from("wallets")
    .select("id,user_id,balance_tokens")
    .eq("user_id", userId)
    .maybeSingle();

  if (selErr) throw new Error(selErr.message);
  if (existing) {
    return {
      id: existing.id,
      user_id: existing.user_id,
      balance_tokens: Number(existing.balance_tokens),
    };
  }

  const { data: created, error: insErr } = await adminClient
    .from("wallets")
    .insert({ user_id: userId, balance_tokens: STARTING_BALANCE })
    .select("id,user_id,balance_tokens")
    .single();

  if (insErr || !created) throw new Error(insErr?.message ?? "Failed to create wallet.");
  return {
    id: created.id,
    user_id: created.user_id,
    balance_tokens: Number(created.balance_tokens),
  };
}

async function getContractOrThrow(contractId: string): Promise<DbContract> {
  const { data, error } = await adminClient
    .from("contracts")
    .select(
      "id,yes_token_pool,no_token_pool,seed_tokens,total_token_pool,yes_shares_outstanding,no_shares_outstanding,status,end_date",
    )
    .eq("id", contractId)
    .single();

  if (error || !data) throw new Error("Contract not found.");

  return {
    id: data.id,
    yes_token_pool: Number(data.yes_token_pool),
    no_token_pool: Number(data.no_token_pool),
    seed_tokens: Number(data.seed_tokens),
    total_token_pool: data.total_token_pool === null ? null : Number(data.total_token_pool),
    yes_shares_outstanding: data.yes_shares_outstanding === null ? null : Number(data.yes_shares_outstanding),
    no_shares_outstanding: data.no_shares_outstanding === null ? null : Number(data.no_shares_outstanding),
    status: String(data.status),
    end_date: data.end_date ? String(data.end_date) : null,
  };
}

async function getOrCreatePosition(userId: string, contractId: string): Promise<DbPosition> {
  const { data: existing, error: selErr } = await adminClient
    .from("positions")
    .select("id,user_id,contract_id,yes_shares,no_shares,status")
    .eq("user_id", userId)
    .eq("contract_id", contractId)
    .maybeSingle();

  if (selErr) throw new Error(selErr.message);
  if (existing) {
    return {
      id: existing.id,
      user_id: existing.user_id,
      contract_id: existing.contract_id,
      yes_shares: Number(existing.yes_shares),
      no_shares: Number(existing.no_shares),
      status: existing.status ?? null,
    };
  }

  const { data: created, error: insErr } = await adminClient
    .from("positions")
    .insert({
      user_id: userId,
      contract_id: contractId,
      yes_shares: 0,
      no_shares: 0,
      status: "open",
      realized_pnl: 0,
    })
    .select("id,user_id,contract_id,yes_shares,no_shares,status")
    .single();

  if (insErr || !created) throw new Error(insErr?.message ?? "Failed to create position.");
  return {
    id: created.id,
    user_id: created.user_id,
    contract_id: created.contract_id,
    yes_shares: Number(created.yes_shares),
    no_shares: Number(created.no_shares),
    status: created.status ?? null,
  };
}

function livePools(contract: DbContract) {
  const yesLive = contract.yes_token_pool + contract.seed_tokens;
  const noLive = contract.no_token_pool + contract.seed_tokens;
  return { yesLive, noLive };
}

function priceYesFromPools(yesLive: number, noLive: number) {
  const denom = yesLive + noLive;
  if (denom <= 0) return 0.5;
  return yesLive / denom;
}

export async function executeTrade(userId: string, input: TradeInput): Promise<TradeResult> {
  // Load entities
  const wallet = await getOrCreateWallet(userId);
  const contract = await getContractOrThrow(input.contractId);
  const position = await getOrCreatePosition(userId, input.contractId);

  ensureTradable(contract);

  const amountTokens = asInt(input.amountTokens);
  if (amountTokens <= 0) throw new Error("amountTokens must be positive.");

  const fee = asInt(calculateFee(amountTokens)); // your amm fee fn; schema stores int4
  const totalDebit = amountTokens + fee;

  const { yesLive, noLive } = livePools(contract);
  const priceYesBefore = priceYesFromPools(yesLive, noLive);
  const priceNoBefore = 1 - priceYesBefore;

  // Shares from your AMM uses yesPool/noPool — we feed LIVE pools (includes seed)
  const ammLikeContract = {
    id: contract.id,
    yesPool: yesLive,
    noPool: noLive,
    status: contract.status,
    endDate: contract.end_date ?? new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
  } as any;

  if (input.action !== "buy") {
    throw new Error("Only buy is supported in MVP.");
  }

  if (wallet.balance_tokens < totalDebit) {
    throw new Error("Insufficient wallet balance for trade and fee.");
  }

  const sharesFloat = sharesFromSpend(ammLikeContract, input.side, amountTokens);
  const sharesReceived = asInt(sharesFloat);
  if (sharesReceived <= 0) throw new Error("Trade amount too small to receive shares.");

  // Update pools (write ONLY real pools; seed stays separate)
  const newYesTokenPool =
    input.side === "yes" ? contract.yes_token_pool + amountTokens : contract.yes_token_pool;

  const newNoTokenPool =
    input.side === "no" ? contract.no_token_pool + amountTokens : contract.no_token_pool;

  const yesAfterLive = newYesTokenPool + contract.seed_tokens;
  const noAfterLive = newNoTokenPool + contract.seed_tokens;

  // Update position shares
  const newYesShares = input.side === "yes" ? position.yes_shares + sharesReceived : position.yes_shares;
  const newNoShares = input.side === "no" ? position.no_shares + sharesReceived : position.no_shares;

  // Update wallet
  const newWalletBalance = wallet.balance_tokens - totalDebit;

  // Write contract updates
  const totalTokenPool = newYesTokenPool + newNoTokenPool + contract.seed_tokens * 2;

  const yesSharesOut = (contract.yes_shares_outstanding ?? 0) + (input.side === "yes" ? sharesReceived : 0);
  const noSharesOut = (contract.no_shares_outstanding ?? 0) + (input.side === "no" ? sharesReceived : 0);

  const { error: cErr } = await adminClient
    .from("contracts")
    .update({
      yes_token_pool: newYesTokenPool,
      no_token_pool: newNoTokenPool,
      total_token_pool: totalTokenPool,
      yes_shares_outstanding: yesSharesOut,
      no_shares_outstanding: noSharesOut,
    })
    .eq("id", contract.id);

  if (cErr) throw new Error(cErr.message);

  // Write wallet update
  const { error: wErr } = await adminClient
    .from("wallets")
    .update({ balance_tokens: newWalletBalance })
    .eq("id", wallet.id);

  if (wErr) throw new Error(wErr.message);

  // Write position update
  const { error: pErr } = await adminClient
    .from("positions")
    .update({
      yes_shares: newYesShares,
      no_shares: newNoShares,
      status: "open",
    })
    .eq("id", position.id);

  if (pErr) throw new Error(pErr.message);

  // Insert trade (matches your schema)
  const { data: trade, error: tErr } = await adminClient
    .from("trades")
    .insert({
      user_id: userId,
      contract_id: contract.id,
      side: input.side,
      tokens_spent: amountTokens,
      shares_received: sharesReceived,
      fee,
      fee_percent_at_trade: FEE_PCT,
      price_yes_at_trade: priceYesBefore,
      price_no_at_trade: priceNoBefore,
      yes_pool_after: yesAfterLive,
      no_pool_after: noAfterLive,
    })
    .select("id")
    .single();

  if (tErr) throw new Error(tErr.message);

  // Insert wallet transaction (debit)
  const { error: wtErr } = await adminClient.from("wallet_transactions").insert({
    wallet_id: wallet.id,
    amount: -totalDebit,
    balance_after: newWalletBalance,
    type: "trade_buy",
    reference_id: trade?.id ?? null,
  });

  if (wtErr) throw new Error(wtErr.message);

  const pYesAfter = priceYesFromPools(yesAfterLive, noAfterLive);

  return {
    contractId: contract.id,
    yesPool: yesAfterLive,
    noPool: noAfterLive,
    pYes: pYesAfter,
    walletBalance: newWalletBalance,
    position: { yesShares: newYesShares, noShares: newNoShares },
    feeCharged: fee,
  };
}
