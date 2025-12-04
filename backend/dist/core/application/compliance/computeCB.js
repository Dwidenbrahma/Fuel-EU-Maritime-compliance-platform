"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeComputeCB = makeComputeCB;
const TARGET = 89.3368;
const MJ_PER_TON = 41000;
function makeComputeCB(complianceRepo) {
    return async function computeCBForShip(shipId, actualIntensity, fuelTons, year) {
        const energyScope = fuelTons * MJ_PER_TON;
        const cb = (TARGET - actualIntensity) * energyScope; // gCO2e
        // save snapshot
        const record = { ship_id: shipId, year, cb_gco2eq: cb };
        await complianceRepo.saveSnapshot(record);
        return cb;
    };
}
