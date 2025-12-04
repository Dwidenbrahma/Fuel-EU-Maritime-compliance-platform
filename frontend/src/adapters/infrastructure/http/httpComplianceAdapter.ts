// src/adapters/infrastructure/http/httpComplianceAdapter.ts

import type { CompliancePort } from "../../../core/ports/compliancePort";
import type { ComplianceBalance } from "../../../core/domain/compliance";

export class HttpComplianceAdapter implements CompliancePort {
  async getComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance> {
    const res = await fetch(`/api/compliance/cb?shipId=${shipId}&year=${year}`);
    if (!res.ok) throw new Error("Failed to fetch compliance balance");
    const data = await res.json();

    return {
      shipId,
      year,
      originalCB: data.original_cb ?? data.originalCB ?? 0,
      appliedBanked: data.applied_banked ?? data.appliedBanked ?? 0,
      adjustedCB: data.adjusted_cb ?? data.adjustedCB ?? 0,
      inPool: false,
    };
  }

  async getAdjustedCB(shipId: string, year: number): Promise<number> {
    const res = await fetch(
      `/api/compliance/adjusted-cb?shipId=${shipId}&year=${year}`
    );
    if (!res.ok) throw new Error("Failed to fetch adjusted CB");
    const data = await res.json();
    return data.adjusted_cb ?? data.adjustedCB ?? 0;
  }
}
