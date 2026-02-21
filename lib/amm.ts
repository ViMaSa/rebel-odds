import { ContractOutcome } from "@/types/contract";
import { TradeSide } from "@/types/trade";

export const FEE_BPS = 50; // 0.5%

export function calculateFee(amountTokens: number): number {
  // integer fee (0.5%), rounded UP
  return Math.ceil(amountTokens * (FEE_BPS / 10_000));
}

export function toProbabilityYes(yesPool: number, noPool: number) {
  const total = yesPool + noPool;
  if (total <= 0) return 0.5;
  return yesPool / total;
}

export function toProbabilitySide(yesPool: number, noPool: number, side: TradeSide) {
  const pYes = toProbabilityYes(yesPool, noPool);
  return side === "yes" ? pYes : 1 - pYes;
}

export function sharesFromSpend(yesPool: number, noPool: number, side: TradeSide, amountTokens: number) {
  const pSide = Math.max(toProbabilitySide(yesPool, noPool, side), 0.01);
  return amountTokens / pSide;
}

export function payoutPerShare(outcome: ContractOutcome, yesShares: number, noShares: number) {
  return outcome === "yes" ? yesShares : noShares;
}