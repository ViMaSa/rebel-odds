import { Contract, ContractOutcome } from "@/types/contract";
import { TradeSide } from "@/types/trade";

export const FEE_BPS = 50; // 0.5%

export function toProbabilityYes(contract: Pick<Contract, "yesPool" | "noPool">) {
  const total = contract.yesPool + contract.noPool;
  if (total <= 0) {
    return 0.5;
  }
  return contract.yesPool / total;
}

export function toProbabilitySide(contract: Pick<Contract, "yesPool" | "noPool">, side: TradeSide) {
  const pYes = toProbabilityYes(contract);
  return side === "yes" ? pYes : 1 - pYes;
}

export function calculateFee(amountTokens: number) {
  return (amountTokens * FEE_BPS) / 10_000;
}

export function sharesFromSpend(
  contract: Pick<Contract, "yesPool" | "noPool">,
  side: TradeSide,
  amountTokens: number,
) {
  const pSide = Math.max(toProbabilitySide(contract, side), 0.01);
  return amountTokens / pSide;
}

export function payoutPerShare(outcome: ContractOutcome, yesShares: number, noShares: number) {
  return outcome === "yes" ? yesShares : noShares;
}
