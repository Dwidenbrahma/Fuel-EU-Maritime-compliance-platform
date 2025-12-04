"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BankingRepositoryPrisma = void 0;
const prismaClient_1 = require("./prismaClient");
class BankingRepositoryPrisma {
    async addBankEntry(shipId, year, amount) {
        await prismaClient_1.prisma.bankEntry.create({
            data: { ship_id: shipId, year, amount_gco2eq: amount },
        });
    }
    async getBankedAmount(shipId, year) {
        const rows = await prismaClient_1.prisma.bankEntry.findMany({
            where: { ship_id: shipId, year },
        });
        return rows.reduce((s, r) => s + r.amount_gco2eq, 0);
    }
    async deductBankedAmount(shipId, year, amount) {
        // naive: create negative entry to represent deduction
        await prismaClient_1.prisma.bankEntry.create({
            data: { ship_id: shipId, year, amount_gco2eq: -Math.abs(amount) },
        });
    }
}
exports.BankingRepositoryPrisma = BankingRepositoryPrisma;
