export type UserRole = "trader" | "admin";

export type ContractType = "gpa" | "course" | "credits";
export type ContractStatus = "active" | "resolved";
export type ContractOutcome = "yes" | "no";

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
}

export interface Wallet {
  userId: string;
  balanceTokens: number;
}

export interface Student {
  id: string;
  name: string;
  major: string;
  standing: string;
  previousGpa: number;
  performanceTier: string;
}

export interface Contract {
  id: string;
  title: string;
  description: string;
  studentId: string;
  type: ContractType;
  threshold: number;
  yesPool: number;
  noPool: number;
  status: ContractStatus;
  endDate: string;
  resolvedOutcome?: ContractOutcome;
}

export interface Position {
  userId: string;
  contractId: string;
  yesShares: number;
  noShares: number;
}
