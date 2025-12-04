// src/core/ports/routesPort.ts

import type { Route } from "../domain/route";

export interface RouteMetrics {
  id: string;
  shipId: string;
  routeName: string;
  vesselType: string;
  fuelType: string;
  year: number;
  fuelTons: number;
  distanceNm: number;
  energyMj: number;
  emissionsGco2eq: number;
  intensityGco2PerMj: number;
  baselineIntensity: number | null;
  createdAt: string;
}

export interface RouteFilters {
  shipId?: string;
  year?: number;
  vesselType?: string;
  fuelType?: string;
}

export interface ComparisonRoute extends RouteMetrics {
  percentChange?: number;
  status?: "BETTER" | "WORSE" | "UNKNOWN";
}

export interface ComparisonResponse {
  routes: ComparisonRoute[];
  chartData?: {
    labels: string[];
    actual: number[];
    baseline: number[];
  };
}

export interface RoutesPort {
  listRoutes(filters?: RouteFilters): Promise<RouteMetrics[]>;
  getRoute(routeId: string): Promise<Route>;
  setBaseline(routeId: string, intensity: number): Promise<void>;
  compareRoutes(filters?: RouteFilters): Promise<ComparisonResponse>;
}
