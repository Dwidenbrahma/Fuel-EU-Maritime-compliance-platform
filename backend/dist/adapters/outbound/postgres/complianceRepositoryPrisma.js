"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceRepositoryPrisma = void 0;
const prismaClient_1 = require("./prismaClient");
class ComplianceRepositoryPrisma {
    async saveSnapshot(record) {
        const r = await prismaClient_1.prisma.shipCompliance.create({
            data: {
                ship_id: record.ship_id,
                year: record.year,
                cb_gco2eq: record.cb_gco2eq,
            },
        });
        return r;
    }
    async findByShipAndYear(shipId, year) {
        return prismaClient_1.prisma.shipCompliance.findFirst({
            where: { ship_id: shipId, year },
        });
    }
    async listAdjustedCB(year) {
        // example: join with bank entries to adjust values — keep simple: return saved snapshots
        const rows = await prismaClient_1.prisma.shipCompliance.findMany({ where: { year } });
        return rows.map((r) => ({ ship_id: r.ship_id, cb_before: r.cb_gco2eq }));
    }
    async getComplianceBalance(shipId, year) {
        const row = await prismaClient_1.prisma.shipCompliance.findFirst({
            where: { ship_id: shipId, year },
            select: { cb_gco2eq: true },
        });
        return row;
    }
    async getAppliedBankEntries(shipId, year) {
        // Applied bank entries are represented as negative bankEntry records
        // created by `deductBankedAmount`. Return those entries so use-cases
        // can compute the adjusted CB.
        const rows = await prismaClient_1.prisma.bankEntry.findMany({
            where: { ship_id: shipId, year, amount_gco2eq: { lt: 0 } },
            select: { amount_gco2eq: true },
        });
        return rows;
    }
}
exports.ComplianceRepositoryPrisma = ComplianceRepositoryPrisma;
