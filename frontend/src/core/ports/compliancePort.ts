// src/core/ports/compliancePort.ts

import type { ComplianceBalance } from "../domain/compliance";

export interface CompliancePort {
  getComplianceBalance(
    shipId: string,
    year: number
  ): Promise<ComplianceBalance>;
  getAdjustedCB(shipId: string, year: number): Promise<number>;
}
