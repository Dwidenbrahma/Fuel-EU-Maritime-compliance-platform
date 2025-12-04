"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplianceRepositoryPrisma = void 0;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
/**
 * Compliance Repository Adapter (Prisma implementation)
 * Handles all database operations for ship compliance records.
 * Manages carbon balance snapshots and banked amount tracking.
 */
class ComplianceRepositoryPrisma {
    /**
     * Save a compliance snapshot (carbon balance record) for a ship in a given year.
     */
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
    /**
     * Find compliance record for a specific ship in a given year.
     */
    async findByShipAndYear(shipId, year) {
        return prismaClient_1.prisma.shipCompliance.findFirst({
            where: { ship_id: shipId, year },
        });
    }
    /**
     * List adjusted CB for all ships in a given year (used for pooling).
     */
    async listAdjustedCB(year) {
        const rows = await prismaClient_1.prisma.shipCompliance.findMany({ where: { year } });
        return rows.map((r) => ({ ship_id: r.ship_id, cb_before: r.cb_gco2eq }));
    }
    /**
     * Get compliance balance for a ship in a given year.
     */
    async getComplianceBalance(shipId, year) {
        const row = await prismaClient_1.prisma.shipCompliance.findFirst({
            where: { ship_id: shipId, year },
            select: { cb_gco2eq: true },
        });
        return row;
    }
    /**
     * Get all applied bank entries (deductions) for a ship in a given year.
     * Applied entries are represented as negative BankEntry amounts.
     */
    async getAppliedBankEntries(shipId, year) {
        const rows = await prismaClient_1.prisma.bankEntry.findMany({
            where: { ship_id: shipId, year, amount_gco2eq: { lt: 0 } },
            select: { amount_gco2eq: true },
        });
        return rows;
    }
}
exports.ComplianceRepositoryPrisma = ComplianceRepositoryPrisma;
