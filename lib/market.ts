import { adminClient } from "@/lib/supabase/admin";
import { calculateFee } from "@/lib/amm";

type TradeSide = "yes" | "no";
type TradeAction = "buy" | "sell";

function assertUuid(id: string) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
    throw new Error(`Invalid UUID: ${id}`);
  }
}

function priceYesFromPools(yesPool: number, noPool: number) {
  const denom = yesPool + noPool;
  if (denom <= 0) return 0.5;
  return yesPool / denom;
}

function sharesFromSpend(price: number, spendTokens: number) {
  const safe = Math.max(price, 0.01);
  return spendTokens / safe;
}

function ensureTradable(status: string, endDate: string | null) {
  if (status !== "active") throw new Error("Contract is not active.");
  if (endDate && new Date(endDate).getTime() <= Date.now()) throw new Error("Contract has expired.");
}

export async function executeTrade(
  userId: string,
  input: { contractId: string; side: TradeSide; action: TradeAction; amountTokens: number }
) {
  assertUuid(userId);
  assertUuid(input.contractId);

  // Fetch contract
  const { data: contract, error: cErr } = await adminClient
    .from("contracts")
    .select("id,status,end_date,seed_tokens,yes_token_pool,no_token_pool")
    .eq("id", input.contractId)
    .single();

  if (cErr || !contract) throw new Error("Contract not found.");
  ensureTradable(contract.status, contract.end_date);

  const seed = Number(contract.seed_tokens ?? 0);
  const yesPool = Number(contract.yes_token_pool ?? 0) + seed;
  const noPool = Number(contract.no_token_pool ?? 0) + seed;

  const priceYes = priceYesFromPools(yesPool, noPool);
  const priceNo = Number((1 - priceYes).toFixed(4));

  // Fetch wallet
  const { data: wallet, error: wErr } = await adminClient
    .from("wallets")
    .select("id,user_id,balance_tokens")
    .eq("user_id", userId)
    .single();

  if (wErr || !wallet) throw new Error("Wallet not found.");

  const fee = calculateFee(input.amountTokens);

  if (input.action !== "buy") {
    throw new Error("Sell not implemented in demo build.");
  }

  const totalDebit = input.amountTokens + fee;
  if (Number(wallet.balance_tokens) < totalDebit) throw new Error("Insufficient wallet balance.");

  const pSide = input.side === "yes" ? priceYes : 1 - priceYes;
  const shares = sharesFromSpend(pSide, input.amountTokens);

  // Upsert position
  const { data: posExisting } = await adminClient
    .from("positions")
    .select("id,user_id,contract_id,yes_shares,no_shares")
    .eq("user_id", userId)
    .eq("contract_id", input.contractId)
    .maybeSingle();

  const yesSharesNew =
    Number(posExisting?.yes_shares ?? 0) + (input.side === "yes" ? shares : 0);
  const noSharesNew =
    Number(posExisting?.no_shares ?? 0) + (input.side === "no" ? shares : 0);

  if (!posExisting) {
    const { error: insPosErr } = await adminClient.from("positions").insert({
      user_id: userId,
      contract_id: input.contractId,
      yes_shares: input.side === "yes" ? shares : 0,
      no_shares: input.side === "no" ? shares : 0,
    });
    if (insPosErr) throw new Error(insPosErr.message);
  } else {
    const { error: updPosErr } = await adminClient
      .from("positions")
      .update({ yes_shares: yesSharesNew, no_shares: noSharesNew })
      .eq("id", posExisting.id);
    if (updPosErr) throw new Error(updPosErr.message);
  }

  // Update wallet
  const newBalance = Number(wallet.balance_tokens) - totalDebit;
  const { error: updWalletErr } = await adminClient
    .from("wallets")
    .update({ balance_tokens: newBalance })
    .eq("id", wallet.id);
  if (updWalletErr) throw new Error(updWalletErr.message);

  // Update contract pools (stored pools exclude seed)
  const yesTokenPoolNew =
    Number(contract.yes_token_pool ?? 0) + (input.side === "yes" ? input.amountTokens : 0);
  const noTokenPoolNew =
    Number(contract.no_token_pool ?? 0) + (input.side === "no" ? input.amountTokens : 0);

  const { error: updContractErr } = await adminClient
    .from("contracts")
    .update({ yes_token_pool: yesTokenPoolNew, no_token_pool: noTokenPoolNew })
    .eq("id", contract.id);
  if (updContractErr) throw new Error(updContractErr.message);

  // Insert trade record
  const { error: tradeErr } = await adminClient.from("trades").insert({
    user_id: userId,
    contract_id: input.contractId,
    side: input.side,
    action: input.action,
    tokens_spent: input.amountTokens,
    shares_received: shares,
    fee,
    price_yes_at_trade: priceYes,
    price_no_at_trade: priceNo,
  });
  if (tradeErr) throw new Error(tradeErr.message);

  // Return fresh “computed” pools including seed (for UI)
  const yesPoolAfter = yesTokenPoolNew + seed;
  const noPoolAfter = noTokenPoolNew + seed;
  const pYesAfter = priceYesFromPools(yesPoolAfter, noPoolAfter);

  return {
    contractId: contract.id,
    yesPool: yesPoolAfter,
    noPool: noPoolAfter,
    pYes: pYesAfter,
    walletBalance: newBalance,
    feeCharged: fee,
    sharesReceived: shares,
  };
}
