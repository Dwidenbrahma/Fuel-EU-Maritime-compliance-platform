// src/core/application/useComplianceBalance.ts

import type { CompliancePort } from "../ports/compliancePort";
import type { PoolingPort } from "../ports/poolingPort";
import type { ComplianceBalance } from "../domain/compliance";

export const makeUseGetComplianceBalance = (
  compliancePort: CompliancePort,
  poolingPort: PoolingPort
) => {
  return async (shipId: string, year: number): Promise<ComplianceBalance> => {
    const balance = await compliancePort.getComplianceBalance(shipId, year);

    // Check if ship is in a pool
    const pool = await poolingPort.getPoolForShip(shipId, year);

    return {
      ...balance,
      inPool: !!pool,
      pooledCB: pool?.pooledCB,
    };
  };
};
