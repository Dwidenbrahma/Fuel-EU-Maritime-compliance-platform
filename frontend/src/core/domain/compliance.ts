// src/core/domain/compliance.ts

export interface ComplianceBalance {
  shipId: string;
  year: number;
  originalCB: number;
  appliedBanked: number;
  adjustedCB: number;
  inPool: boolean;
  pooledCB?: number;
}

export const createComplianceBalance = (
  overrides?: Partial<ComplianceBalance>
): ComplianceBalance => ({
  shipId: "",
  year: new Date().getFullYear(),
  originalCB: 0,
  appliedBanked: 0,
  adjustedCB: 0,
  inPool: false,
  ...overrides,
});

// Domain logic: calculate adjusted compliance balance
export const calculateAdjustedCB = (
  originalCB: number,
  appliedBanked: number
): number => {
  return originalCB + appliedBanked;
};

// Domain logic: get effective CB (respects pool membership)
export const getEffectiveCB = (balance: ComplianceBalance): number => {
  if (balance.inPool && balance.pooledCB !== undefined) {
    return balance.pooledCB;
  }
  return balance.adjustedCB;
};

// Domain logic: check compliance status
export const isCompliant = (balance: ComplianceBalance): boolean => {
  return getEffectiveCB(balance) >= 0;
};

// Domain logic: calculate deficit or surplus
export const getComplianceStatus = (
  balance: ComplianceBalance
): { status: "compliant" | "non-compliant"; amount: number } => {
  const effective = getEffectiveCB(balance);
  return {
    status: effective >= 0 ? "compliant" : "non-compliant",
    amount: Math.abs(effective),
  };
};

// Domain logic: validate compliance balance consistency
export const isValidComplianceBalance = (
  balance: ComplianceBalance
): boolean => {
  return (
    balance.shipId.length > 0 &&
    balance.year > 2020 &&
    typeof balance.originalCB === "number" &&
    typeof balance.appliedBanked === "number" &&
    typeof balance.adjustedCB === "number"
  );
};
