import { ComplianceRepository } from "../../ports/complianceRepository";

const TARGET = 89.3368;
const MJ_PER_TON = 41000;

export function makeComputeCB(complianceRepo: ComplianceRepository) {
  return async function computeCBForShip(
    shipId: string,
    actualIntensity: number,
    fuelTons: number,
    year: number
  ) {
    const energyScope = fuelTons * MJ_PER_TON;
    const cb = (TARGET - actualIntensity) * energyScope; // gCO2e
    // save snapshot
    const record = { ship_id: shipId, year, cb_gco2eq: cb };
    await complianceRepo.saveSnapshot(record);
    return cb;
  };
}
