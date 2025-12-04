import { ComplianceRepository } from "../../ports/complianceRepository";
import { PoolingRepository } from "../../ports/poolingRepository";

export function makeGetAdjustedCB(
  complianceRepo: ComplianceRepository,
  poolingRepo?: PoolingRepository
) {
  return async function getAdjustedCB(shipId: string, year: number) {
    if (!shipId) throw new Error("shipId required");

    // 1. Check if ship is in a pool for this year
    let adjustedCB: number;

    if (poolingRepo) {
      const poolInfo = await poolingRepo.getPoolForShip(shipId, year);
      if (poolInfo) {
        // Ship is in a pool → use pooled CB
        adjustedCB = poolInfo.pooledCB;
        return {
          shipId,
          year,
          originalCB: 0,
          bankedApplied: 0,
          adjustedCB,
          poolId: poolInfo.poolId,
          inPool: true,
          compliant: adjustedCB >= 0,
          deficit: adjustedCB < 0 ? -adjustedCB : 0,
        };
      }
    }

    // 2. Ship is NOT in a pool → use original CB + banked applied
    const cbRecord = await complianceRepo.getComplianceBalance(shipId, year);

    if (!cbRecord) {
      return {
        shipId,
        year,
        originalCB: 0,
        bankedApplied: 0,
        adjustedCB: 0,
        message: "No compliance balance found.",
      };
    }

    const originalCB = cbRecord.cb_gco2eq;

    const appliedEntries = await complianceRepo.getAppliedBankEntries(
      shipId,
      year
    );

    const bankedApplied = appliedEntries.reduce(
      (sum, entry) => sum + entry.amount_gco2eq,
      0
    );

    adjustedCB = originalCB + bankedApplied;

    return {
      shipId,
      year,
      originalCB,
      bankedApplied,
      adjustedCB,
      inPool: false,
      compliant: adjustedCB >= 0,
      deficit: adjustedCB < 0 ? -adjustedCB : 0,
    };
  };
}
