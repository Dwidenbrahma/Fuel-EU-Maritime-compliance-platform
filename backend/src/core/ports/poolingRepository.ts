// src/core/ports/poolingRepository.ts

export interface PoolMember {
  ship_id: string;
  adjusted_cb: number;
}

export interface PoolRecord {
  id: string;
  year: number;
  pooled_cb: number;
  created_at?: Date;
}

export interface PoolingRepository {
  createPool(year: number, pooledCB: number): Promise<{ id: string }>;
  addShipToPool(
    poolId: string,
    shipId: string,
    adjustedCB: number
  ): Promise<void>;
  isShipInPool(shipId: string, year: number): Promise<boolean>;
  getPoolForShip(
    shipId: string,
    year: number
  ): Promise<{ poolId: string; pooledCB: number } | null>;
  getPoolMembers(
    poolId: string
  ): Promise<Array<{ shipId: string; adjustedCB: number }>>;
}
