// src/core/ports/bankingPort.ts

import type { BankingEntry } from "../domain/bankingEntry";

export interface BankingRecordsResponse {
  cbBefore: number;
  available: number;
  entries: BankingEntry[];
}

export interface BankingPort {
  getBankingRecords(
    shipId: string,
    year: number
  ): Promise<BankingRecordsResponse>;
  bankSurplus(shipId: string, year: number, amount: number): Promise<void>;
  applyBank(shipId: string, year: number, amount: number): Promise<void>;
}
