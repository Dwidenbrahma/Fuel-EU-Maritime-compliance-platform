// src/core/application/useBankingOperations.ts

import type { BankingPort } from "../ports/bankingPort";

export const makeUseGetBankingRecords = (bankingPort: BankingPort) => {
  return async (shipId: string, year: number) => {
    return bankingPort.getBankingRecords(shipId, year);
  };
};

export const makeUseBankSurplus = (bankingPort: BankingPort) => {
  return async (shipId: string, year: number, amount: number) => {
    if (amount <= 0) {
      throw new Error("Bank amount must be positive");
    }
    await bankingPort.bankSurplus(shipId, year, amount);
  };
};

export const makeUseApplyBank = (bankingPort: BankingPort) => {
  return async (shipId: string, year: number, amount: number) => {
    if (amount <= 0) {
      throw new Error("Apply amount must be positive");
    }
    await bankingPort.applyBank(shipId, year, amount);
  };
};
