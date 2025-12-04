"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeBankSurplus = makeBankSurplus;
function makeBankSurplus(bankingRepo, complianceRepo) {
    return async function bankSurplus(shipId, year) {
        // Compute current CB (must exist)
        const cb = await complianceRepo.getComplianceBalance(shipId, year);
        if (!cb)
            throw new Error("No compliance balance found. Run compute CB first.");
        const cb_before = cb.cb_gco2eq;
        if (cb_before <= 0) {
            throw new Error("Cannot bank non-positive CB.");
        }
        // Create bank entry for the positive surplus
        const entry = await bankingRepo.createBankEntry({
            ship_id: shipId,
            year,
            amount_gco2eq: cb_before,
            applied: false,
        });
        return {
            cb_before,
            applied: 0,
            cb_after: cb_before, // still same because not applied yet, but UI expects structure
            bankEntryId: entry.id,
        };
    };
}
