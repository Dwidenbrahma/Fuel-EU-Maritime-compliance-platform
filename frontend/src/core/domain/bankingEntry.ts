// src/core/domain/bankingEntry.ts

export interface BankingEntry {
  id: string;
  shipId: string;
  year: number;
  amountGco2eq: number;
  applied: boolean;
  createdAt?: string;
}

export const createBankingEntry = (
  id: string,
  overrides?: Partial<BankingEntry>
): BankingEntry => ({
  id,
  shipId: "",
  year: new Date().getFullYear(),
  amountGco2eq: 0,
  applied: false,
  ...overrides,
});

// Domain logic: validate banking entry
export const isValidBankingEntry = (entry: BankingEntry): boolean => {
  return (
    entry.id.length > 0 &&
    entry.shipId.length > 0 &&
    entry.amountGco2eq > 0 &&
    entry.year > 0
  );
};

// Domain logic: calculate banked amount (cumulative surplus)
export const calculateBankedAmount = (entries: BankingEntry[]): number => {
  return entries
    .filter((e) => !e.applied)
    .reduce((sum, e) => sum + e.amountGco2eq, 0);
};

// Domain logic: validate application (can only apply available banked)
export const canApplyAmount = (
  availableBanked: number,
  amountToApply: number
): boolean => {
  return amountToApply > 0 && amountToApply <= availableBanked;
};

// Domain logic: calculate remaining banked amount after application
export const calculateRemainingBanked = (
  entries: BankingEntry[],
  appliedAmount: number
): number => {
  const totalBanked = calculateBankedAmount(entries);
  return Math.max(0, totalBanked - appliedAmount);
};

// Domain logic: validate banking entry for creation
export const canCreateBankEntry = (
  shipId: string,
  year: number,
  amount: number
): boolean => {
  return (
    shipId.length > 0 &&
    year > 2020 &&
    amount > 0 &&
    !isNaN(amount) &&
    isFinite(amount)
  );
};
