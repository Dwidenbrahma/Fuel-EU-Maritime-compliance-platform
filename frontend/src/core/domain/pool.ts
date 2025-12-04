// src/core/domain/pool.ts

export interface Pool {
  id: string;
  year: number;
  pooledCB: number;
  createdAt?: string;
}

export interface PoolMember {
  shipId: string;
  adjustedCB: number;
}

export const createPool = (id: string, overrides?: Partial<Pool>): Pool => ({
  id,
  year: new Date().getFullYear(),
  pooledCB: 0,
  ...overrides,
});

// Domain logic: validate pool creation
export const isValidPoolCreation = (
  shipIds: string[],
  year: number
): boolean => {
  return (
    shipIds.length >= 2 &&
    year > 0 &&
    Array.isArray(shipIds) &&
    shipIds.every((id) => id.length > 0)
  );
};

// Domain logic: calculate pooled CB
export const calculatePooledCB = (members: PoolMember[]): number => {
  return members.reduce((sum, member) => sum + member.adjustedCB, 0);
};

// Domain logic: check eligibility for pool (must have positive CB)
export const isEligibleForPool = (adjustedCB: number): boolean => {
  return adjustedCB > 0;
};

// Domain logic: calculate average adjusted CB in pool
export const calculateAverageAdjustedCB = (members: PoolMember[]): number => {
  if (members.length === 0) return 0;
  const sum = members.reduce((acc, m) => acc + m.adjustedCB, 0);
  return sum / members.length;
};

// Domain logic: calculate distribution for compliance sharing
// Count members with surplus vs deficit
export const calculateCompliantMembers = (members: PoolMember[]): number => {
  return members.filter((m) => m.adjustedCB >= 0).length;
};

export const calculateDeficitMembers = (members: PoolMember[]): number => {
  return members.filter((m) => m.adjustedCB < 0).length;
};
