"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeApplyBank = makeApplyBank;
function makeApplyBank(bankingRepo, complianceRepo) {
    return async function applyBank(shipId, year, amountToApply) {
        // Validate
        if (amountToApply <= 0)
            throw new Error("Amount must be positive");
        const available = await bankingRepo.getAvailableBanked(shipId, year);
        if (available <= 0)
            throw new Error("No available banked amount");
        if (amountToApply > available)
            throw new Error("Requested amount exceeds available banked surplus");
        // Get original CB
        const cbRecord = await complianceRepo.getComplianceBalance(shipId, year);
        const cb_before = cbRecord ? cbRecord.cb_gco2eq : 0;
        // Apply banked amount (mark entries as applied up to amount)
        const applied = await bankingRepo.applyBankedAmount(shipId, year, amountToApply);
        // After applying, adjusted CB = cb_before + applied
        const cb_after = cb_before + applied;
        // (Optional) store adjusted snapshot or history — we leave snapshots to compliance use-cases
        return {
            cb_before,
            applied,
            cb_after,
        };
    };
}
