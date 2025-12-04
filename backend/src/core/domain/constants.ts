/**
 * Core regulatory and business constants for FuelEU Maritime compliance
 * Source: EU Directive 2023/1805 and related regulations
 */

// ========================
// Regulatory Targets (gCO2/MJ)
// ========================

/**
 * IMO 2030 GHG intensity reduction target
 * Source: IMO MEPC resolutions for post-2020 GHG regulations
 * Unit: gCO2eq/MJ
 */
export const TARGET_GHG_INTENSITY_2030 = 89.3368;

/**
 * IMO 2050 GHG intensity reduction target (aspirational)
 * Unit: gCO2eq/MJ
 */
export const TARGET_GHG_INTENSITY_2050 = 50.0;

// ========================
// Baseline & Defaults
// ========================

/**
 * Default baseline GHG intensity if no route-specific baseline is set
 * Falls back to this for comparison calculations
 * Unit: gCO2eq/MJ
 */
export const DEFAULT_BASELINE_INTENSITY = 89.3368;

/**
 * Minimum valid intensity value (enforce positive compliance)
 * Unit: gCO2eq/MJ
 */
export const MIN_INTENSITY = 0.01;

/**
 * Maximum allowed intensity before flagged as non-compliant
 * Unit: gCO2eq/MJ
 */
export const MAX_INTENSITY = 200.0;

// ========================
// Carbon Banking & Article 20
// ========================

/**
 * Maximum banking horizon (years a surplus can be carried forward)
 * Source: Article 20 of FuelEU Maritime
 */
export const MAX_BANKING_YEARS = 5;

/**
 * Discount factor for banked credits (e.g., 0.95 = 5% annual discount)
 * Encourages timely compliance vs. banking
 */
export const BANKING_DISCOUNT_FACTOR = 0.95;

// ========================
// Pooling & Article 21
// ========================

/**
 * Minimum number of ships required to form a compliance pool
 * Source: Article 21 of FuelEU Maritime
 */
export const MIN_POOL_MEMBERS = 2;

/**
 * Maximum number of ships in a single pool (optional limit)
 * Leave as Infinity for no upper limit
 */
export const MAX_POOL_MEMBERS = Infinity;

/**
 * Minimum fleet average CB to be eligible for pooling
 * Unit: gCO2eq (or null to allow any positive CB)
 */
export const MIN_POOL_ELIGIBLE_CB = 0;

// ========================
// Fuel Properties & Factors
// ========================

/**
 * Energy density by fuel type (MJ/tonne)
 * Source: IPCC and shipping industry standards
 */
export const ENERGY_DENSITY_BY_FUEL = {
  HFO: 46000, // Heavy Fuel Oil
  MGO: 46200, // Marine Gas Oil
  LNG: 50000, // Liquefied Natural Gas (by weight)
  LSFO: 46300, // Low-Sulfur Fuel Oil
  MeOH: 20100, // Methanol
  Ammonia: 18600, // Ammonia
} as const;

/**
 * GHG emission factors by fuel type (gCO2/tonne fuel burned)
 * Source: IPCC AR5 and IMO guidelines
 */
export const EMISSION_FACTOR_BY_FUEL = {
  HFO: 3170, // ~3.17 tonnes CO2/tonne fuel
  MGO: 3180,
  LNG: 2750, // Lower due to methane content differences
  LSFO: 3180,
  MeOH: 1380, // Methanol (lower carbon content)
  Ammonia: 0, // Zero carbon during combustion (but production emissions in Well-to-Wake)
} as const;

// ========================
// Reporting & Admin
// ========================

/**
 * Default compliance year if not specified
 */
export const DEFAULT_COMPLIANCE_YEAR = new Date().getFullYear();

/**
 * Number of decimal places for rounding compliance metrics
 */
export const PRECISION_DECIMAL_PLACES = 4;

/**
 * Tolerance threshold for floating-point comparisons (e.g., compliance checks)
 */
export const EPSILON = 0.0001;

/**
 * Version of this constants file for audit/logging purposes
 */
export const CONSTANTS_VERSION = "1.0.0";
