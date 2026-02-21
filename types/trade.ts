export type TradeSide = "yes" | "no";
export type TradeAction = "buy" | "sell";

export interface TradeInput {
  contractId: string;
  side: TradeSide;
  action: TradeAction;
  amountTokens: number;
}

export interface Trade {
  id: string;
  userId: string;
  contractId: string;
  side: TradeSide;
  action: TradeAction;
  tokensSpent: number;
  sharesDelta: number;
  fee: number;
  createdAt: string;
}

export interface TradeResult {
  contractId: string;
  yesPool: number;
  noPool: number;
  pYes: number;
  walletBalance: number;
  position: {
    yesShares: number;
    noShares: number;
  };
  feeCharged: number;
}
