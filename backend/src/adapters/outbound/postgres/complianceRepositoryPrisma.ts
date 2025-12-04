import { prisma } from "./prismaClient";
import type { ShipCompliance } from "../../../core/domain/compliance";
import { ComplianceRepository } from "../../../core/ports/complianceRepository";

/**
 * Compliance Repository Adapter (Prisma implementation)
 * Handles all database operations for ship compliance records.
 * Manages carbon balance snapshots and banked amount tracking.
 */
export class ComplianceRepositoryPrisma implements ComplianceRepository {
  /**
   * Save a compliance snapshot (carbon balance record) for a ship in a given year.
   */
  async saveSnapshot(record: ShipCompliance): Promise<ShipCompliance> {
    const r = await prisma.shipCompliance.create({
      data: {
        ship_id: record.ship_id,
        year: record.year,
        cb_gco2eq: record.cb_gco2eq,
      },
    });
    return r as unknown as ShipCompliance;
  }
  /**
   * Find compliance record for a specific ship in a given year.
   */
  async findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<ShipCompliance | null> {
    return prisma.shipCompliance.findFirst({
      where: { ship_id: shipId, year },
    }) as unknown as ShipCompliance | null;
  }
  /**
   * List adjusted CB for all ships in a given year (used for pooling).
   */
  async listAdjustedCB(
    year: number
  ): Promise<{ ship_id: string; cb_before: number }[]> {
    const rows = await prisma.shipCompliance.findMany({ where: { year } });
    return rows.map((r) => ({ ship_id: r.ship_id, cb_before: r.cb_gco2eq }));
  }
  /**
   * Get compliance balance for a ship in a given year.
   */
  async getComplianceBalance(
    shipId: string,
    year: number
  ): Promise<{ cb_gco2eq: number } | null> {
    const row = await prisma.shipCompliance.findFirst({
      where: { ship_id: shipId, year },
      select: { cb_gco2eq: true },
    });
    return row as unknown as { cb_gco2eq: number } | null;
  }

  /**
   * Get all applied bank entries (deductions) for a ship in a given year.
   * Applied entries are represented as negative BankEntry amounts.
   */
  async getAppliedBankEntries(
    shipId: string,
    year: number
  ): Promise<{ amount_gco2eq: number }[]> {
    const rows = await prisma.bankEntry.findMany({
      where: { ship_id: shipId, year, amount_gco2eq: { lt: 0 } },
      select: { amount_gco2eq: true },
    });
    return rows as { amount_gco2eq: number }[];
  }
}
