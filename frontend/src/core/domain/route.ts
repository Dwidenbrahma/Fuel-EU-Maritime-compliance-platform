// src/core/domain/route.ts

export type FuelType = "HFO" | "MGO" | "LNG" | "METHANOL";
export type VesselType =
  | "Container"
  | "BulkCarrier"
  | "Tanker"
  | "RoRo"
  | "other";

export interface Route {
  id: string;
  shipId: string;
  routeName: string;
  vesselType: VesselType;
  fuelType: FuelType;
  year: number;
  fuelTons: number;
  distanceNm: number;
  energyMj?: number;
  emissionsGco2eq?: number;
  intensityGco2PerMj?: number;
  baselineIntensity?: number;
  createdAt?: string;
}

export const createRoute = (id: string, overrides?: Partial<Route>): Route => ({
  id,
  shipId: "",
  routeName: "",
  vesselType: "Container",
  fuelType: "HFO",
  year: new Date().getFullYear(),
  fuelTons: 0,
  distanceNm: 0,
  ...overrides,
});

// Domain logic: validate route data
export const isValidRoute = (route: Route): boolean => {
  return (
    route.id.length > 0 &&
    route.shipId.length > 0 &&
    route.fuelTons >= 0 &&
    route.distanceNm > 0 &&
    route.year > 0
  );
};

// Domain logic: check if baseline is set
export const hasBaseline = (route: Route): boolean => {
  return route.baselineIntensity !== undefined && route.baselineIntensity > 0;
};

// Domain logic: calculate GHG intensity improvement vs baseline
// Returns percentage change (negative = improved, positive = worse)
export const calculateBaselineImprovement = (
  currentIntensity: number,
  baselineIntensity: number
): number => {
  if (!baselineIntensity || baselineIntensity <= 0) return 0;
  return ((currentIntensity - baselineIntensity) / baselineIntensity) * 100;
};

// Domain logic: determine compliance based on baseline comparison
export const isComplianceStatusBetter = (
  currentIntensity: number,
  baselineIntensity: number
): boolean => {
  return currentIntensity < baselineIntensity;
};
