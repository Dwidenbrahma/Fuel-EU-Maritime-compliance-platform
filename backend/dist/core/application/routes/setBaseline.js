"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSetBaseline = makeSetBaseline;
const computeRouteMetrics_1 = require("./computeRouteMetrics");
function makeSetBaseline(routeRepo) {
    const compute = (0, computeRouteMetrics_1.makeComputeRouteMetrics)(routeRepo);
    return async function setBaseline(routeId) {
        const route = await routeRepo.getRoute(routeId);
        if (!route)
            throw new Error("Route not found");
        // Ensure metrics exist
        if (!route.intensity_gco2_per_mj) {
            const metrics = await compute(routeId);
            route.energy_mj = metrics.energy_mj;
            route.emissions_gco2eq = metrics.emissions_gco2eq;
            route.intensity_gco2_per_mj = metrics.intensity_gco2_per_mj;
        }
        const baseline = route.intensity_gco2_per_mj;
        await routeRepo.setBaselineValue(routeId, baseline);
        return { baseline };
    };
}
