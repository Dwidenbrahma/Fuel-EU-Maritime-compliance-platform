"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBankSurplus = makeBankSurplus;
function makeBankSurplus(bankingRepo) {
    return async function bankSurplus(shipId, year, amount) {
        if (amount <= 0)
            throw new Error("Cannot bank non-positive amount");
        await bankingRepo.addBankEntry(shipId, year, amount);
        return;
    };
}
