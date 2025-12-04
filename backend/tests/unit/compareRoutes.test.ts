import { makeCompareRoutes } from "../../src/core/application/routes/compareRoutes";
import { vi } from "vitest";
import type { RouteRepository } from "../../src/core/ports/routeRepository";

describe("Compare Routes", () => {
  test("computes percent change", async () => {
    const repo: Partial<RouteRepository> = {
      listRoutes: vi.fn().mockResolvedValue([
        {
          id: "R001",
          ship_id: "S1",
          year: 2024,
          fuel_tons: 0,
          energy_mj: 1000,
          emissions_gco2eq: 100000,
          intensity_gco2_per_mj: 100,
          baseline_intensity: 80,
        },
      ]),
    };

    const compareRoutes = makeCompareRoutes(repo as RouteRepository);
    const result = await compareRoutes("S1", 2024);

    // stronger, clearer assertions
    expect(result.routes).toHaveLength(1);
    expect(result.routes[0].percentChange).toBeCloseTo(25);
    expect(result.routes[0].status).toBe("WORSE");
  });
});
