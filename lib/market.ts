import { calculateFee, payoutPerShare, sharesFromSpend, toProbabilityYes } from "@/lib/amm";
import { logger } from "@/lib/server/logger";
import {
  Contract,
  ContractOutcome,
  Position,
  Profile,
  Student,
  Wallet,
} from "@/types/contract";
import { Trade, TradeInput, TradeResult } from "@/types/trade";
import { LeaderboardRow, Portfolio } from "@/types/user";

const STARTING_BALANCE = 10_000;

const state: {
  profiles: Profile[];
  wallets: Wallet[];
  students: Student[];
  contracts: Contract[];
  positions: Position[];
  trades: Trade[];
  platformRevenueTokens: number;
} = {
  profiles: [
    { id: "admin-1", username: "admin.demo", role: "admin" },
    { id: "trader-1", username: "victor", role: "trader" },
    { id: "trader-2", username: "sam", role: "trader" },
  ],
  wallets: [
    { userId: "admin-1", balanceTokens: STARTING_BALANCE },
    { userId: "trader-1", balanceTokens: STARTING_BALANCE },
    { userId: "trader-2", balanceTokens: STARTING_BALANCE },
  ],
  students: [
    {
      id: "student-1",
      name: "Jordan Lee",
      major: "Computer Science",
      standing: "Junior",
      previousGpa: 3.4,
      performanceTier: "high",
    },
    {
      id: "student-2",
      name: "Avery Kim",
      major: "Biology",
      standing: "Sophomore",
      previousGpa: 3.7,
      performanceTier: "high",
    },
  ],
  contracts: [
    {
      id: "contract-1",
      title: "Jordan Lee GPA >= 3.5 this semester",
      description: "YES wins if final GPA is at least 3.5.",
      studentId: "student-1",
      type: "gpa",
      threshold: 3.5,
      yesPool: 5000,
      noPool: 5000,
      status: "active",
      endDate: "2026-05-30T23:59:59.000Z",
    },
    {
      id: "contract-2",
      title: "Avery Kim credits completed >= 15",
      description: "YES wins if at least 15 credits are completed.",
      studentId: "student-2",
      type: "credits",
      threshold: 15,
      yesPool: 5000,
      noPool: 5000,
      status: "active",
      endDate: "2026-05-30T23:59:59.000Z",
    },
  ],
  positions: [],
  trades: [],
  platformRevenueTokens: 0,
};

let queue = Promise.resolve();

async function withAtomic<T>(fn: () => T | Promise<T>): Promise<T> {
  const run = queue.then(fn);
  queue = run.then(
    () => undefined,
    () => undefined,
  );
  return run;
}

function toPublicContract(contract: Contract) {
  return {
    ...contract,
    pYes: toProbabilityYes(contract),
  };
}

function getProfileOrThrow(userId: string) {
  const profile = state.profiles.find((item) => item.id === userId);
  if (!profile) {
    throw new Error("Profile not found.");
  }
  return profile;
}

function getWalletOrThrow(userId: string) {
  const wallet = state.wallets.find((item) => item.userId === userId);
  if (!wallet) {
    throw new Error("Wallet not found.");
  }
  return wallet;
}

function getContractOrThrow(contractId: string) {
  const contract = state.contracts.find((item) => item.id === contractId);
  if (!contract) {
    throw new Error("Contract not found.");
  }
  return contract;
}

function getPosition(userId: string, contractId: string) {
  return state.positions.find((item) => item.userId === userId && item.contractId === contractId);
}

function getOrCreatePosition(userId: string, contractId: string) {
  let position = getPosition(userId, contractId);
  if (!position) {
    position = { userId, contractId, yesShares: 0, noShares: 0 };
    state.positions.push(position);
  }
  return position;
}

function ensureContractTradable(contract: Contract) {
  if (contract.status !== "active") {
    throw new Error("Contract is not active.");
  }
  if (new Date(contract.endDate).getTime() <= Date.now()) {
    throw new Error("Contract has expired.");
  }
}

function roundTo6(value: number) {
  return Number(value.toFixed(6));
}

export function listContracts() {
  return state.contracts.map(toPublicContract);
}

export function getContractById(contractId: string) {
  const contract = state.contracts.find((item) => item.id === contractId);
  if (!contract) {
    return null;
  }
  const student = state.students.find((item) => item.id === contract.studentId) || null;
  const recentTrades = state.trades
    .filter((item) => item.contractId === contract.id)
    .slice(-10)
    .reverse();

  return {
    contract: toPublicContract(contract),
    student,
    recentTrades,
  };
}

export function createContract(input: {
  title: string;
  description: string;
  studentId: string;
  type: Contract["type"];
  threshold: number;
  yesPool?: number;
  noPool?: number;
  endDate: string;
}) {
  if (!input.title.trim()) {
    throw new Error("title is required.");
  }
  if (!input.studentId.trim()) {
    throw new Error("studentId is required.");
  }
  const endDateMs = new Date(input.endDate).getTime();
  if (!Number.isFinite(endDateMs)) {
    throw new Error("Invalid endDate.");
  }

  const newContract: Contract = {
    id: crypto.randomUUID(),
    title: input.title.trim(),
    description: input.description.trim(),
    studentId: input.studentId,
    type: input.type,
    threshold: input.threshold,
    yesPool: input.yesPool ?? 5000,
    noPool: input.noPool ?? 5000,
    status: "active",
    endDate: new Date(endDateMs).toISOString(),
  };

  state.contracts.push(newContract);
  return toPublicContract(newContract);
}

export async function executeTrade(userId: string, input: TradeInput): Promise<TradeResult> {
  return withAtomic(async () => {
    const wallet = getWalletOrThrow(userId);
    const contract = getContractOrThrow(input.contractId);
    const position = getOrCreatePosition(userId, input.contractId);

    ensureContractTradable(contract);

    const fee = calculateFee(input.amountTokens);
    if (input.action === "buy") {
      const totalDebit = input.amountTokens + fee;
      if (wallet.balanceTokens < totalDebit) {
        throw new Error("Insufficient wallet balance for trade and fee.");
      }

      const sharesDelta = sharesFromSpend(contract, input.side, input.amountTokens);
      wallet.balanceTokens = roundTo6(wallet.balanceTokens - totalDebit);
      state.platformRevenueTokens = roundTo6(state.platformRevenueTokens + fee);

      if (input.side === "yes") {
        contract.yesPool = roundTo6(contract.yesPool + input.amountTokens);
        position.yesShares = roundTo6(position.yesShares + sharesDelta);
      } else {
        contract.noPool = roundTo6(contract.noPool + input.amountTokens);
        position.noShares = roundTo6(position.noShares + sharesDelta);
      }

      state.trades.push({
        id: crypto.randomUUID(),
        userId,
        contractId: input.contractId,
        side: input.side,
        action: input.action,
        tokensSpent: input.amountTokens,
        sharesDelta: roundTo6(sharesDelta),
        fee: roundTo6(fee),
        createdAt: new Date().toISOString(),
      });
    } else {
      const pSide = input.side === "yes" ? toProbabilityYes(contract) : 1 - toProbabilityYes(contract);
      const safeP = Math.max(pSide, 0.01);
      const sharesRequired = input.amountTokens / safeP;

      if (input.side === "yes" && position.yesShares < sharesRequired) {
        throw new Error("Not enough YES shares to sell.");
      }
      if (input.side === "no" && position.noShares < sharesRequired) {
        throw new Error("Not enough NO shares to sell.");
      }

      const credit = input.amountTokens - fee;
      if (credit <= 0) {
        throw new Error("Sell amount is too small after fees.");
      }

      wallet.balanceTokens = roundTo6(wallet.balanceTokens + credit);
      state.platformRevenueTokens = roundTo6(state.platformRevenueTokens + fee);

      if (input.side === "yes") {
        contract.yesPool = roundTo6(Math.max(1, contract.yesPool - input.amountTokens));
        position.yesShares = roundTo6(position.yesShares - sharesRequired);
      } else {
        contract.noPool = roundTo6(Math.max(1, contract.noPool - input.amountTokens));
        position.noShares = roundTo6(position.noShares - sharesRequired);
      }

      state.trades.push({
        id: crypto.randomUUID(),
        userId,
        contractId: input.contractId,
        side: input.side,
        action: input.action,
        tokensSpent: input.amountTokens,
        sharesDelta: roundTo6(-sharesRequired),
        fee: roundTo6(fee),
        createdAt: new Date().toISOString(),
      });
    }

    const pYes = toProbabilityYes(contract);
    return {
      contractId: contract.id,
      yesPool: contract.yesPool,
      noPool: contract.noPool,
      pYes,
      walletBalance: wallet.balanceTokens,
      position: {
        yesShares: position.yesShares,
        noShares: position.noShares,
      },
      feeCharged: roundTo6(fee),
    };
  });
}

export function getPortfolio(userId: string): Portfolio {
  const profile = getProfileOrThrow(userId);
  const wallet = getWalletOrThrow(userId);
  const positions = state.positions
    .filter((item) => item.userId === userId)
    .map((position) => {
      const contract = getContractOrThrow(position.contractId);
      const pYes = toProbabilityYes(contract);
      const pNo = 1 - pYes;
      const markToMarketValue = roundTo6(position.yesShares * pYes + position.noShares * pNo);
      return {
        contractId: position.contractId,
        contractTitle: contract.title,
        status: contract.status,
        yesShares: position.yesShares,
        noShares: position.noShares,
        pYes,
        markToMarketValue,
      };
    });

  const netWorth =
    wallet.balanceTokens + positions.reduce((sum, item) => sum + item.markToMarketValue, 0);

  return {
    profile,
    wallet,
    positions,
    netWorth: roundTo6(netWorth),
  };
}

export function getLeaderboard(): LeaderboardRow[] {
  return state.profiles
    .map((profile) => {
      const portfolio = getPortfolio(profile.id);
      return {
        userId: profile.id,
        username: profile.username,
        netWorth: portfolio.netWorth,
        walletBalance: portfolio.wallet.balanceTokens,
      };
    })
    .sort((a, b) => b.netWorth - a.netWorth);
}

export async function resolveContract(contractId: string, outcome: ContractOutcome) {
  return withAtomic(async () => {
    const contract = getContractOrThrow(contractId);
    if (contract.status === "resolved") {
      throw new Error("Contract already resolved.");
    }

    contract.status = "resolved";
    contract.resolvedOutcome = outcome;

    for (const position of state.positions.filter((item) => item.contractId === contract.id)) {
      const payout = payoutPerShare(outcome, position.yesShares, position.noShares);
      if (payout <= 0) {
        continue;
      }
      const wallet = getWalletOrThrow(position.userId);
      wallet.balanceTokens = roundTo6(wallet.balanceTokens + payout);
    }

    logger.info({ contractId, outcome }, "Contract resolved");
    return toPublicContract(contract);
  });
}

export function getPlatformStats() {
  return {
    platformRevenueTokens: state.platformRevenueTokens,
    totalTrades: state.trades.length,
  };
}
