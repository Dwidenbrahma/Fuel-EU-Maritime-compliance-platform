"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeComputeCB = makeComputeCB;
const TARGET = 89.3368; // gCO2/MJ
const MJ_PER_TON = 41000;
function makeComputeCB(complianceRepo) {
    return async function computeCBForShip(shipId, actualIntensity, fuelTons, year) {
        // --- VALIDATION ---
        if (!shipId)
            throw new Error("shipId is required");
        if (fuelTons <= 0)
            throw new Error("fuelTons must be > 0");
        if (actualIntensity <= 0)
            throw new Error("actualIntensity must be > 0");
        if (year < 2020)
            throw new Error("Invalid year");
        // --- DOMAIN LOGIC ---
        const energyScope = fuelTons * MJ_PER_TON;
        const delta = TARGET - actualIntensity;
        const cb = delta * energyScope; // gCO2e credit
        // --- BUILD DOMAIN OBJECT ---
        const record = {
            ship_id: shipId,
            year,
            cb_gco2eq: cb,
        };
        // --- SAVE SNAPSHOT IN REPO ---
        await complianceRepo.saveSnapshot(record);
        return {
            shipId,
            year,
            energyScope,
            actualIntensity,
            deltaFromTarget: delta,
            cb_gco2eq: cb,
            compliant: cb >= 0,
        };
    };
}
