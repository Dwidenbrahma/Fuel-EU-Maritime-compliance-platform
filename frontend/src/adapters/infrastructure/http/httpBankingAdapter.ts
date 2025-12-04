// src/adapters/infrastructure/http/httpBankingAdapter.ts

import type {
  BankingPort,
  BankingRecordsResponse,
} from "../../../core/ports/bankingPort";
import type { BankingEntry } from "../../../core/domain/bankingEntry";

export class HttpBankingAdapter implements BankingPort {
  async getBankingRecords(
    shipId: string,
    year: number
  ): Promise<BankingRecordsResponse> {
    const res = await fetch(
      `/api/banking/records?shipId=${shipId}&year=${year}`
    );
    if (!res.ok) throw new Error("Failed to fetch banking records");
    const data = await res.json();

    const entries: BankingEntry[] = (data.entries ?? []).map(
      (e: Record<string, unknown>) => ({
        id: (e.id as string) ?? "",
        shipId: (e.ship_id as string) ?? shipId,
        year: (e.year as number) ?? year,
        amountGco2eq:
          (e.amount_gco2eq as number) ?? (e.amountGco2eq as number) ?? 0,
        applied: (e.applied as boolean) ?? false,
        createdAt: e.created_at as string | Date,
      })
    );

    return {
      cbBefore: data.cb_before ?? data.cbBefore ?? 0,
      available: data.available ?? 0,
      entries,
    };
  }

  async bankSurplus(
    shipId: string,
    year: number,
    amount: number
  ): Promise<void> {
    const res = await fetch("/api/banking/bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, year, amount }),
    });
    if (!res.ok) throw new Error("Failed to bank surplus");
  }

  async applyBank(shipId: string, year: number, amount: number): Promise<void> {
    const res = await fetch("/api/banking/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shipId, year, amount }),
    });
    if (!res.ok) throw new Error("Failed to apply bank");
  }
}
