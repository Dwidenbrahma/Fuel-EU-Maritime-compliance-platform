import { RouteRepository, RouteFilter, RouteRecord } from "../../ports/routeRepository";
import { makeComputeRouteMetrics } from "./computeRouteMetrics";

export function makeListRoutesWithMetrics(routeRepo: RouteRepository) {
  const compute = makeComputeRouteMetrics(routeRepo);

  return async function listRoutesWithMetrics(filters: RouteFilter) {
    const routes = await routeRepo.listRoutes(filters);

    const results: RouteRecord[] = [];

    for (const r of routes) {
      const record = { ...r } as RouteRecord;

      const needsCompute =
        !record.energy_mj || !record.emissions_gco2eq || !record.intensity_gco2_per_mj;
      if (needsCompute) {
        try {
          const metrics = await compute(record.id);
          record.energy_mj = metrics.energy_mj;
          record.emissions_gco2eq = metrics.emissions_gco2eq;
          record.intensity_gco2_per_mj = metrics.intensity_gco2_per_mj;
        } catch (err) {
          // leave as-is if computation fails for a single route
        }
      }

      results.push(record);
    }

    return results;
  };
}
