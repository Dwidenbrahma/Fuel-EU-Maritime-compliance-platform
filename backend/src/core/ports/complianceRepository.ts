import { ShipCompliance } from "../domain/compliance";

export interface ComplianceRepository {
  saveSnapshot(record: ShipCompliance): Promise<ShipCompliance>;

  findByShipAndYear(
    shipId: string,
    year: number
  ): Promise<ShipCompliance | null>;

  // Used for Company-wide pooling results
  listAdjustedCB(
    year: number
  ): Promise<{ ship_id: string; cb_before: number }[]>;

  // Required for getAdjustedCB use-case
  getComplianceBalance(
    shipId: string,
    year: number
  ): Promise<{ cb_gco2eq: number } | null>;

  getAppliedBankEntries(
    shipId: string,
    year: number
  ): Promise<{ amount_gco2eq: number }[]>;
}
