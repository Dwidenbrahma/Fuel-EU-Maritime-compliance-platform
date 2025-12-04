// src/adapters/outbound/postgres/bankingRepositoryPrisma.ts

import { BankingRepository, BankEntryRecord } from "../../../core/ports/bankingRepository";
import { prisma } from "../../../infrastructure/prisma/prismaClient";

export class BankingRepositoryPrisma implements BankingRepository {
  async createBankEntry(entry: BankEntryRecord): Promise<BankEntryRecord> {
    const created = await prisma.bankEntry.create({
      data: {
        ship_id: entry.ship_id,
        year: entry.year,
        amount_gco2eq: entry.amount_gco2eq,
        applied: entry.applied ?? false,
      },
    });

    return {
      id: created.id, // string UUID
      ship_id: created.ship_id,
      year: created.year,
      amount_gco2eq: created.amount_gco2eq,
      applied: created.applied,
      created_at: created.created_at,
    };
  }

  async listBankEntries(
    shipId: string,
    year: number,
    onlyUnapplied = false,
  ): Promise<BankEntryRecord[]> {
    const where: any = { ship_id: shipId, year };
    if (onlyUnapplied) where.applied = false;

    const rows = await prisma.bankEntry.findMany({
      where,
      orderBy: { created_at: "asc" },
    });

    return rows.map(r => ({
      id: r.id,
      ship_id: r.ship_id,
      year: r.year,
      amount_gco2eq: r.amount_gco2eq,
      applied: r.applied,
      created_at: r.created_at,
    }));
  }

  async getAvailableBanked(shipId: string, year: number): Promise<number> {
    const rows = await prisma.bankEntry.findMany({
      where: { ship_id: shipId, year, applied: false },
      select: { amount_gco2eq: true },
    });

    return rows.reduce((sum, row) => sum + row.amount_gco2eq, 0);
  }

  async getAppliedAmount(shipId: string, year: number): Promise<number> {
    const rows = await prisma.bankEntry.findMany({
      where: { ship_id: shipId, year, applied: true },
      select: { amount_gco2eq: true },
    });

    return rows.reduce((sum, row) => sum + row.amount_gco2eq, 0);
  }

  /**
   * Mark bank entries as applied until reaching `amount`.
   * Returns the total applied.
   */
  async applyBankedAmount(shipId: string, year: number, amount: number): Promise<number> {
    if (amount <= 0) return 0;

    // Get unapplied bank entries (FIFO)
    const unapplied = await prisma.bankEntry.findMany({
      where: { ship_id: shipId, year, applied: false },
      orderBy: { created_at: "asc" },
    });

    let remaining = amount;
    let appliedTotal = 0;

    for (const entry of unapplied) {
      if (remaining <= 0) break;

      const take = Math.min(remaining, entry.amount_gco2eq);

      // Case 1: Fully consume the entry
      if (take === entry.amount_gco2eq) {
        await prisma.bankEntry.update({
          where: { id: entry.id },
          data: { applied: true },
        });

        appliedTotal += take;
        remaining -= take;
      } else {
        // Case 2: Partially consume entry → split into applied + remaining
        await prisma.bankEntry.update({
          where: { id: entry.id },
          data: {
            amount_gco2eq: entry.amount_gco2eq - take,
          },
        });

        await prisma.bankEntry.create({
          data: {
            ship_id: shipId,
            year,
            amount_gco2eq: take,
            applied: true,
          },
        });

        appliedTotal += take;
        remaining -= take;
      }
    }

    return appliedTotal;
  }
}
