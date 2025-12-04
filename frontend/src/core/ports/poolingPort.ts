// src/core/ports/poolingPort.ts

import type { Pool, PoolMember } from "../domain/pool";

export interface CreatePoolResponse {
  poolId: string;
  year: number;
  pooledCB: number;
  ships: Array<{ shipId: string; adjustedCB: number }>;
}

export interface PoolingPort {
  createPool(shipIds: string[], year: number): Promise<CreatePoolResponse>;
  getPoolMembers(poolId: string): Promise<PoolMember[]>;
  getPoolForShip(shipId: string, year: number): Promise<Pool | null>;
}
