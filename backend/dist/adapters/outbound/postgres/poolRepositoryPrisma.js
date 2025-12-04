"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PoolRepositoryPrisma = void 0;
const prismaClient_1 = require("./prismaClient");
class PoolRepositoryPrisma {
    async createPool(year, members) {
        const p = await prismaClient_1.prisma.pool.create({
            data: {
                year,
                members: {
                    create: members.map((m) => ({
                        ship_id: m.shipId,
                        cb_before: m.cb_before,
                        cb_after: m.cb_after ?? 0,
                    })),
                },
            },
            include: { members: true },
        });
        return p;
    }
}
exports.PoolRepositoryPrisma = PoolRepositoryPrisma;
