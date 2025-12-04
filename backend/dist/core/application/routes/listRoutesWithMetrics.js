"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeListRoutesWithMetrics = makeListRoutesWithMetrics;
const computeRouteMetrics_1 = require("./computeRouteMetrics");
function makeListRoutesWithMetrics(routeRepo) {
    const compute = (0, computeRouteMetrics_1.makeComputeRouteMetrics)(routeRepo);
    return async function listRoutesWithMetrics(filters) {
        const routes = await routeRepo.listRoutes(filters);
        const results = [];
        for (const r of routes) {
            let record = { ...r };
            const needsCompute = !record.energy_mj ||
                !record.emissions_gco2eq ||
                !record.intensity_gco2_per_mj;
            if (needsCompute) {
                try {
                    const metrics = await compute(record.id);
                    record.energy_mj = metrics.energy_mj;
                    record.emissions_gco2eq = metrics.emissions_gco2eq;
                    record.intensity_gco2_per_mj = metrics.intensity_gco2_per_mj;
                }
                catch (err) {
                    // leave as-is if computation fails for a single route
                }
            }
            results.push(record);
        }
        return results;
    };
}
