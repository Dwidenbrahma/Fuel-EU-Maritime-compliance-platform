// src/core/ports/bankingRepository.ts
export type BankEntryRecord = {
  id?: string;
  ship_id: string;
  year: number;
  amount_gco2eq: number;
  applied?: boolean;
  created_at?: Date;
};

export interface BankingRepository {
  // create a bank entry (positive CB banking)
  createBankEntry(entry: BankEntryRecord): Promise<BankEntryRecord>;

  // list bank entries for a ship/year (optionally only unapplied)
  listBankEntries(
    shipId: string,
    year: number,
    onlyUnapplied?: boolean
  ): Promise<BankEntryRecord[]>;

  // sum of unapplied bank entries (available banked amount)
  getAvailableBanked(shipId: string, year: number): Promise<number>;

  // mark bank entries applied up to `amount` and return total applied
  applyBankedAmount(
    shipId: string,
    year: number,
    amount: number
  ): Promise<number>;
}
