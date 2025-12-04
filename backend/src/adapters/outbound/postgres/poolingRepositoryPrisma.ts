// src/adapters/outbound/postgres/poolingRepositoryPrisma.ts

import { prisma } from "./prismaClient";
import {
  PoolMember,
  PoolingRepository,
} from "../../../core/ports/poolingRepository";

export class PoolingRepositoryPrisma implements PoolingRepository {
  async createPool(year: number): Promise<number> {
    const pool = await prisma.pool.create({
      data: { year },
    });
    return pool.id;
  }

  async addPoolMembers(poolId: number, members: PoolMember[]): Promise<void> {
    await prisma.poolMember.createMany({
      data: members.map((m) => ({
        pool_id: poolId,
        ship_id: m.ship_id,
        cb_before: m.cb_before,
        cb_after: m.cb_after,
      })),
    });
  }
}
