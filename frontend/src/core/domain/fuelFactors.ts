// src/core/domain/fuelFactors.ts

export type FuelType = "HFO" | "MGO" | "LNG" | "METHANOL";

// Energy density in MJ/ton for each fuel type
export const ENERGY_DENSITY: Record<FuelType, number> = {
  HFO: 40000,
  MGO: 43000,
  LNG: 50000,
  METHANOL: 20000,
};

// Emission factors in gCO2/ton for each fuel type
export const EMISSION_FACTORS: Record<FuelType, number> = {
  HFO: 3200000,
  MGO: 3180000,
  LNG: 2750000,
  METHANOL: 1400000,
};

// Domain logic: compute energy in MJ from fuel tons
export const computeEnergy = (fuelTons: number, fuelType: FuelType): number => {
  const density = ENERGY_DENSITY[fuelType] || ENERGY_DENSITY.HFO;
  return fuelTons * density;
};

// Domain logic: compute emissions in gCO2 from fuel tons
export const computeEmissions = (
  fuelTons: number,
  fuelType: FuelType
): number => {
  const factor = EMISSION_FACTORS[fuelType] || EMISSION_FACTORS.HFO;
  return fuelTons * factor;
};

// Domain logic: compute intensity as gCO2/MJ
export const computeIntensity = (emissions: number, energy: number): number => {
  if (energy <= 0) return 0;
  return emissions / energy;
};

// Domain logic: compute intensity for a route
export const computeRouteIntensity = (
  fuelTons: number,
  fuelType: FuelType
): number => {
  const emissions = computeEmissions(fuelTons, fuelType);
  const energy = computeEnergy(fuelTons, fuelType);
  return computeIntensity(emissions, energy);
};
