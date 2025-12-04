// src/adapters/outbound/postgres/poolingRepositoryPrisma.ts

import { prisma } from "../../../infrastructure/prisma/prismaClient";
import { PoolMember, PoolingRepository } from "../../../core/ports/poolingRepository";

export class PoolingRepositoryPrisma implements PoolingRepository {
  async createPool(year: number, pooledCB: number): Promise<{ id: string }> {
    const pool = await prisma.pool.create({
      data: { year, pooled_cb: pooledCB },
    });
    return { id: pool.id };
  }

  async addShipToPool(poolId: string, shipId: string, adjustedCB: number): Promise<void> {
    await prisma.poolMember.create({
      data: {
        pool_id: poolId,
        ship_id: shipId,
        adjusted_cb: adjustedCB,
      },
    });
  }

  async isShipInPool(shipId: string, year: number): Promise<boolean> {
    const member = await prisma.poolMember.findFirst({
      where: {
        ship_id: shipId,
        Pool: { year },
      },
    });
    return !!member;
  }

  async getPoolForShip(
    shipId: string,
    year: number,
  ): Promise<{ poolId: string; pooledCB: number } | null> {
    const member = await prisma.poolMember.findFirst({
      where: {
        ship_id: shipId,
        Pool: { year },
      },
      include: { Pool: true },
    });
    if (!member) return null;
    return {
      poolId: member.pool_id,
      pooledCB: member.Pool!.pooled_cb,
    };
  }

  async getPoolMembers(poolId: string): Promise<Array<{ shipId: string; adjustedCB: number }>> {
    const members = await prisma.poolMember.findMany({
      where: { pool_id: poolId },
    });
    return members.map(m => ({
      shipId: m.ship_id,
      adjustedCB: m.adjusted_cb,
    }));
  }
}
