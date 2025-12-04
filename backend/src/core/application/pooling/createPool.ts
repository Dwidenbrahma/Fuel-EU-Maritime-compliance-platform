// src/core/application/pooling/createPool.ts

import { ComplianceRepository } from "../../ports/complianceRepository";
import { PoolingRepository } from "../../ports/poolingRepository";
import { makeGetAdjustedCB } from "../compliance/getAdjustedCB";

export interface PoolShip {
  shipId: string;
  adjustedCB: number;
}

export interface CreatePoolResult {
  poolId: string;
  year: number;
  pooledCB: number;
  ships: PoolShip[];
}

export function makeCreatePool(
  complianceRepo: ComplianceRepository,
  poolingRepo: PoolingRepository
) {
  return async function createPool(
    shipIds: string[],
    year: number
  ): Promise<CreatePoolResult> {
    // 1. Validate inputs
    if (!shipIds || shipIds.length === 0) {
      throw new Error("shipIds array is required");
    }
    if (shipIds.length < 2) {
      throw new Error("At least 2 ships required to create a pool");
    }
    if (!year || year <= 0) {
      throw new Error("Year is required and must be positive");
    }

    const getAdjustedCB = makeGetAdjustedCB(complianceRepo, poolingRepo);

    // 2. Fetch adjusted CB for all ships
    const ships: PoolShip[] = [];
    for (const shipId of shipIds) {
      const cb = await getAdjustedCB(shipId, year);

      if (!cb || cb.adjustedCB === null || cb.adjustedCB === undefined) {
        throw new Error(`Ship ${shipId} has no adjusted CB for year ${year}`);
      }

      if (cb.adjustedCB <= 0) {
        throw new Error(
          `Ship ${shipId} has adjustedCB <= 0 (value: ${cb.adjustedCB}). Only positive CB ships can join pools.`
        );
      }

      ships.push({
        shipId,
        adjustedCB: cb.adjustedCB,
      });
    }

    // 3. Validate no ship is already in a pool for this year
    for (const ship of ships) {
      const inPool = await poolingRepo.isShipInPool(ship.shipId, year);
      if (inPool) {
        throw new Error(
          `Ship ${ship.shipId} is already in a pool for year ${year}`
        );
      }
    }

    // 4. Calculate pooled CB (sum of adjusted CBs)
    const pooledCB = ships.reduce((sum, s) => sum + s.adjustedCB, 0);

    // 5. Create pool
    const poolResult = await poolingRepo.createPool(year, pooledCB);

    // 6. Add ships to pool
    for (const ship of ships) {
      await poolingRepo.addShipToPool(
        poolResult.id,
        ship.shipId,
        ship.adjustedCB
      );
    }

    return {
      poolId: poolResult.id,
      year,
      pooledCB,
      ships,
    };
  };
}
