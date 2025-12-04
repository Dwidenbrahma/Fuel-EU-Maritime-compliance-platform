"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApplyBank = makeApplyBank;
function makeApplyBank(bankingRepo) {
    return async function applyBank(shipId, year, amount) {
        const available = await bankingRepo.getBankedAmount(shipId, year);
        if (amount > available)
            throw new Error("Insufficient banked amount");
        await bankingRepo.deductBankedAmount(shipId, year, amount);
        return;
    };
}
