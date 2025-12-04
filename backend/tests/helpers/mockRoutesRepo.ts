import type {
  RouteRepository,
  RouteRecord,
  RouteFilter,
} from "../../src/core/ports/routeRepository";

export function makeMockRoutesRepo(): RouteRepository {
  // use snake_case fields to match current RouteRecord type
  const routes: RouteRecord[] = [
    {
      id: "R1",
      ship_id: "S1",
      route_name: "R1-name",
      vessel_type: "General",
      fuel_type: "HFO",
      fuel_tons: 100,
      year: 2024,
      distance_nm: 1000,
      energy_mj: 4600000,
      emissions_gco2eq: 317000,
      intensity_gco2_per_mj: 68.913,
      baseline_intensity: 91,
    },
    {
      id: "R2",
      ship_id: "S1",
      route_name: "R2-name",
      vessel_type: "General",
      fuel_type: "MGO",
      fuel_tons: 120,
      year: 2024,
      distance_nm: 1200,
      energy_mj: 5544000,
      emissions_gco2eq: 382000,
      intensity_gco2_per_mj: 68.9,
      baseline_intensity: 91,
    },
  ];

  return {
    // legacy methods (minimal implementations)
    async findAll() {
      return routes as any;
    },

    async findById(id: number) {
      return null;
    },

    async findByRouteId(routeId: string) {
      const r = routes.find(rr => rr.id === routeId);
      return r as unknown as any;
    },

    async setBaseline(_routeId: string) {
      return;
    },

    async findBaselineByYear(_year: number) {
      return null;
    },

    async findComparison(_year?: number) {
      // return a flat list suitable for comparison logic
      return routes as any;
    },

    // New API
    async listRoutes(filters?: RouteFilter) {
      if (!filters) return routes;
      return routes.filter(r => {
        if (filters.shipId && r.ship_id !== filters.shipId) return false;
        if (filters.year && r.year !== filters.year) return false;
        return true;
      });
    },

    async getRoute(routeId: string) {
      return routes.find(r => r.id === routeId) || null;
    },

    async updateMetrics(
      routeId: string,
      metrics: { energy_mj: number; emissions_gco2eq: number; intensity_gco2_per_mj: number },
    ) {
      const route = routes.find(r => r.id === routeId);
      if (route) {
        route.energy_mj = metrics.energy_mj;
        route.emissions_gco2eq = metrics.emissions_gco2eq;
        route.intensity_gco2_per_mj = metrics.intensity_gco2_per_mj;
      }
    },

    async setBaselineValue(routeId: string, baseline: number) {
      const route = routes.find(r => r.id === routeId);
      if (route) route.baseline_intensity = baseline;
    },
  } as unknown as RouteRepository;
}
