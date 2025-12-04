import { ComplianceRepository } from "../../ports/complianceRepository";

const TARGET = 89.3368; // gCO2/MJ
const MJ_PER_TON = 41000;

export function makeComputeCB(complianceRepo: ComplianceRepository) {
  return async function computeCBForShip(
    shipId: string,
    actualIntensity: number,
    fuelTons: number,
    year: number
  ) {
    // --- VALIDATION ---
    if (!shipId) throw new Error("shipId is required");
    if (fuelTons <= 0) throw new Error("fuelTons must be > 0");
    if (actualIntensity <= 0) throw new Error("actualIntensity must be > 0");
    if (year < 2020) throw new Error("Invalid year");

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
