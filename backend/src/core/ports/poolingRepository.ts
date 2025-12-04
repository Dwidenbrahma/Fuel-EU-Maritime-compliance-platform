// src/core/ports/poolingRepository.ts

export interface PoolMember {
  ship_id: string;
  cb_before: number;
  cb_after: number;
}

export interface PoolRecord {
  id?: number;
  year: number;
  created_at?: Date;
}

export interface PoolingRepository {
  createPool(year: number): Promise<number>; // returns new pool_id
  addPoolMembers(poolId: number, members: PoolMember[]): Promise<void>;
}
