"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGetAdjustedCB = makeGetAdjustedCB;
function makeGetAdjustedCB(complianceRepo) {
    return async function getAdjustedCB(shipId, year) {
        // 1. Get original CB
        const cbRecord = await complianceRepo.getComplianceBalance(shipId, year);
        if (!cbRecord) {
            return {
                shipId,
                year,
                originalCB: 0,
                bankedApplied: 0,
                adjustedCB: 0,
                message: "No CB recorded for this ship/year.",
            };
        }
        const originalCB = cbRecord.cb_gco2eq;
        // 2. Get all applied bank entries
        const appliedEntries = await complianceRepo.getAppliedBankEntries(shipId, year);
        const bankedApplied = appliedEntries.reduce((sum, entry) => sum + entry.amount_gco2eq, 0);
        // 3. Compute adjusted CB
        const adjustedCB = originalCB + bankedApplied;
        return {
            shipId,
            year,
            originalCB,
            bankedApplied,
            adjustedCB,
        };
    };
}
