import { RouteRepository, RouteFilter, RouteRecord } from "../../ports/routeRepository";
import { makeComputeRouteMetrics } from "./computeRouteMetrics";
import { DEFAULT_BASELINE_INTENSITY } from "../../domain/constants";

export interface CompareRoute {
  id: string;
  routeId: string;
  routeName: string;
  vesselType: string;
  fuelType: string;
  fuelTons: number;
  emissions_gco2eq: number;
  energy_mj: number;
  actualIntensity: number;
  baselineIntensity: number;
  percentChange: number | null;
  status: "BETTER" | "WORSE" | "UNKNOWN";
}

export interface CompareResponse {
  shipId: string;
  year: number;
  routes: CompareRoute[];
  chart: {
    labels: string[];
    actual: number[];
    baseline: number[];
  };
}

export function makeCompareRoutes(routeRepo: RouteRepository) {
  const compute = makeComputeRouteMetrics(routeRepo);

  return async function compareRoutes(
    shipId: string,
    year: number,
    filters?: RouteFilter,
  ): Promise<CompareResponse> {
    const filterObj = { ...filters, shipId, year } as RouteFilter;
    const routes = await routeRepo.listRoutes(filterObj);

    const compareRoutes: CompareRoute[] = [];
    const labels: string[] = [];
    const actualSeries: number[] = [];
    const baselineSeries: number[] = [];

    for (const r of routes) {
      const record = { ...r } as RouteRecord;

      // Ensure metrics are computed
      const needsCompute =
        !record.energy_mj || !record.emissions_gco2eq || !record.intensity_gco2_per_mj;
      if (needsCompute) {
        try {
          const metrics = await compute(record.id);
          record.energy_mj = metrics.energy_mj;
          record.emissions_gco2eq = metrics.emissions_gco2eq;
          record.intensity_gco2_per_mj = metrics.intensity_gco2_per_mj;
        } catch (err) {
          // Skip route if computation fails
          continue;
        }
      }

      const actualIntensity = record.intensity_gco2_per_mj || 0;
      const baselineIntensity = record.baseline_intensity ?? DEFAULT_BASELINE_INTENSITY;

      let percentChange: number | null = null;
      let status: "BETTER" | "WORSE" | "UNKNOWN" = "UNKNOWN";

      if (baselineIntensity > 0) {
        percentChange = ((actualIntensity - baselineIntensity) / baselineIntensity) * 100;
        status = actualIntensity <= baselineIntensity ? "BETTER" : "WORSE";
      }

      const compareRoute: CompareRoute = {
        id: record.id,
        routeId: record.id,
        routeName: record.route_name || `Route-${record.id}`,
        vesselType: record.vessel_type || "Unknown",
        fuelType: record.fuel_type || "Unknown",
        fuelTons: record.fuel_tons,
        emissions_gco2eq: record.emissions_gco2eq || 0,
        energy_mj: record.energy_mj || 0,
        actualIntensity: Number(actualIntensity.toFixed(4)),
        baselineIntensity: Number(baselineIntensity.toFixed(4)),
        percentChange: percentChange !== null ? Number(percentChange.toFixed(2)) : null,
        status,
      };

      compareRoutes.push(compareRoute);
      labels.push(record.route_name || `R${compareRoutes.length}`);
      actualSeries.push(Number(actualIntensity.toFixed(4)));
      baselineSeries.push(Number(baselineIntensity.toFixed(4)));
    }

    return {
      shipId,
      year,
      routes: compareRoutes,
      chart: {
        labels,
        actual: actualSeries,
        baseline: baselineSeries,
      },
    };
  };
}
