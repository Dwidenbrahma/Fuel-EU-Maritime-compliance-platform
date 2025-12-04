import { Route } from "../domain/route";

export type RouteRecord = {
  id: string;
  ship_id: string;
  route_name?: string;
  vessel_type?: string;
  fuel_type?: string;
  fuel_tons: number;
  year: number;
  distance_nm?: number;
  energy_mj?: number;
  emissions_gco2eq?: number;
  intensity_gco2_per_mj?: number;
  baseline_intensity?: number | null;
};

export type RouteFilter = {
  shipId?: string;
  year?: number;
  vesselType?: string;
  fuelType?: string;
  minEmissions?: number;
  minIntensity?: number;
  minFuel?: number;
};

export interface RouteRepository {
  // legacy methods (kept for compatibility)
  findAll(): Promise<Route[]>;
  findById(id: number): Promise<Route | null>;
  findByRouteId(routeId: string): Promise<Route | null>;
  setBaseline(routeId: string): Promise<void>;
  findBaselineByYear(year: number): Promise<Route | null>;
  findComparison(year?: number): Promise<Route[]>; // can be tailored

  // New API for Routes Tab
  listRoutes(filters: RouteFilter): Promise<RouteRecord[]>;
  getRoute(routeId: string): Promise<RouteRecord | null>;
  updateMetrics(
    routeId: string,
    metrics: {
      energy_mj: number;
      emissions_gco2eq: number;
      intensity_gco2_per_mj: number;
    },
  ): Promise<void>;
  setBaselineValue(routeId: string, baseline: number): Promise<void>;
}
