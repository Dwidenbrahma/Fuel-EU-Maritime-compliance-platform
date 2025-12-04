"use strict";
// src/adapters/outbound/postgres/poolingRepositoryPrisma.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolingRepositoryPrisma = void 0;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
class PoolingRepositoryPrisma {
    async createPool(year, pooledCB) {
        const pool = await prismaClient_1.prisma.pool.create({
            data: { year, pooled_cb: pooledCB },
        });
        return { id: pool.id };
    }
    async addShipToPool(poolId, shipId, adjustedCB) {
        await prismaClient_1.prisma.poolMember.create({
            data: {
                pool_id: poolId,
                ship_id: shipId,
                adjusted_cb: adjustedCB,
            },
        });
    }
    async isShipInPool(shipId, year) {
        const member = await prismaClient_1.prisma.poolMember.findFirst({
            where: {
                ship_id: shipId,
                Pool: { year },
            },
        });
        return !!member;
    }
    async getPoolForShip(shipId, year) {
        const member = await prismaClient_1.prisma.poolMember.findFirst({
            where: {
                ship_id: shipId,
                Pool: { year },
            },
            include: { Pool: true },
        });
        if (!member)
            return null;
        return {
            poolId: member.pool_id,
            pooledCB: member.Pool.pooled_cb,
        };
    }
    async getPoolMembers(poolId) {
        const members = await prismaClient_1.prisma.poolMember.findMany({
            where: { pool_id: poolId },
        });
        return members.map((m) => ({
            shipId: m.ship_id,
            adjustedCB: m.adjusted_cb,
        }));
    }
}
exports.PoolingRepositoryPrisma = PoolingRepositoryPrisma;
