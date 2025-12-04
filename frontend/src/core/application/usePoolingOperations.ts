// src/core/application/usePoolingOperations.ts

import type { PoolingPort } from "../ports/poolingPort";
import { isValidPoolCreation } from "../domain/pool";

export const makeUseCreatePool = (poolingPort: PoolingPort) => {
  return async (shipIds: string[], year: number) => {
    if (!isValidPoolCreation(shipIds, year)) {
      throw new Error(
        "Invalid pool creation: need at least 2 ships and valid year"
      );
    }
    return poolingPort.createPool(shipIds, year);
  };
};

export const makeUseGetPoolMembers = (poolingPort: PoolingPort) => {
  return async (poolId: string) => {
    if (!poolId) {
      throw new Error("Pool ID is required");
    }
    return poolingPort.getPoolMembers(poolId);
  };
};

export const makeUseGetPoolForShip = (poolingPort: PoolingPort) => {
  return async (shipId: string, year: number) => {
    if (!shipId || year <= 0) {
      throw new Error("Valid ship ID and year are required");
    }
    return poolingPort.getPoolForShip(shipId, year);
  };
};
