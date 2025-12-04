import { RouteRepository } from "../../ports/routeRepository";
import { makeComputeRouteMetrics } from "./computeRouteMetrics";

export function makeSetBaseline(routeRepo: RouteRepository) {
  const compute = makeComputeRouteMetrics(routeRepo);

  return async function setBaseline(routeId: string) {
    const route = await routeRepo.getRoute(routeId);
    if (!route) throw new Error("Route not found");

    // Ensure metrics exist
    if (!route.intensity_gco2_per_mj) {
      const metrics = await compute(routeId);
      route.energy_mj = metrics.energy_mj;
      route.emissions_gco2eq = metrics.emissions_gco2eq;
      route.intensity_gco2_per_mj = metrics.intensity_gco2_per_mj;
    }

    const baseline = route.intensity_gco2_per_mj as number;
    await routeRepo.setBaselineValue(routeId, baseline);

    return { baseline };
  };
}
