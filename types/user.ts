import { Profile, Wallet } from "@/types/contract";

export interface PortfolioRow {
  contractId: string;
  contractTitle: string;
  status: "active" | "resolved";
  yesShares: number;
  noShares: number;
  pYes: number;
  markToMarketValue: number;
}

export interface Portfolio {
  profile: Profile;
  wallet: Wallet;
  positions: PortfolioRow[];
  netWorth: number;
}

export interface LeaderboardRow {
  userId: string;
  username: string;
  netWorth: number;
  walletBalance: number;
}
