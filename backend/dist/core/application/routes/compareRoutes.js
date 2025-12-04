"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_BASELINE_INTENSITY = void 0;
exports.makeCompareRoutes = makeCompareRoutes;
const computeRouteMetrics_1 = require("./computeRouteMetrics");
// Default target intensity if no baseline is set (e.g., IMO 2030 target ~ 70% reduction)
exports.DEFAULT_BASELINE_INTENSITY = 50.0;
function makeCompareRoutes(routeRepo) {
    const compute = (0, computeRouteMetrics_1.makeComputeRouteMetrics)(routeRepo);
    return async function compareRoutes(shipId, year, filters) {
        const filterObj = { ...filters, shipId, year };
        const routes = await routeRepo.listRoutes(filterObj);
        const compareRoutes = [];
        const labels = [];
        const actualSeries = [];
        const baselineSeries = [];
        for (const r of routes) {
            let record = { ...r };
            // Ensure metrics are computed
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
                    // Skip route if computation fails
                    continue;
                }
            }
            const actualIntensity = record.intensity_gco2_per_mj || 0;
            const baselineIntensity = record.baseline_intensity ?? exports.DEFAULT_BASELINE_INTENSITY;
            let percentChange = null;
            let status = "UNKNOWN";
            if (baselineIntensity > 0) {
                percentChange =
                    ((actualIntensity - baselineIntensity) / baselineIntensity) * 100;
                status = actualIntensity <= baselineIntensity ? "BETTER" : "WORSE";
            }
            const compareRoute = {
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
