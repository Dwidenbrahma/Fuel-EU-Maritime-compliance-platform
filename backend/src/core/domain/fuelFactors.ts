export const ENERGY_DENSITY: Record<string, number> = {
  HFO: 40000,
  MGO: 43000,
  LNG: 50000,
  METHANOL: 20000,
};

export const EMISSION_FACTORS: Record<string, number> = {
  HFO: 3200000,
  MGO: 3180000,
  LNG: 2750000,
  METHANOL: 1400000,
};

export const SUPPORTED_FUELS = Object.keys(ENERGY_DENSITY);
