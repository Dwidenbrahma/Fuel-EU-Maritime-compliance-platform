import { RouteRepository } from "../../ports/routeRepository";
import { ENERGY_DENSITY, EMISSION_FACTORS } from "../../domain/fuelFactors";

export function makeComputeRouteMetrics(routeRepo: RouteRepository) {
  return async function computeRouteMetrics(routeId: string) {
    const route = await routeRepo.getRoute(routeId);
    if (!route) throw new Error("Route not found");

    const fuelType = (route.fuel_type || "").toUpperCase();
    if (!fuelType || !ENERGY_DENSITY[fuelType])
      throw new Error(`Unsupported or missing fuel type: ${route.fuel_type}`);

    if (!route.fuel_tons || route.fuel_tons <= 0)
      throw new Error("fuel_tons must be > 0 to compute metrics");

    const energy_mj = Number((route.fuel_tons * ENERGY_DENSITY[fuelType]).toFixed(2));
    const emissions_gco2eq = Number((route.fuel_tons * EMISSION_FACTORS[fuelType]).toFixed(2));

    if (energy_mj === 0) throw new Error("Computed energy is zero");

    const intensity_gco2_per_mj = Number((emissions_gco2eq / energy_mj).toFixed(4));

    await routeRepo.updateMetrics(routeId, {
      energy_mj,
      emissions_gco2eq,
      intensity_gco2_per_mj,
    });

    return {
      energy_mj,
      emissions_gco2eq,
      intensity_gco2_per_mj,
    };
  };
}
