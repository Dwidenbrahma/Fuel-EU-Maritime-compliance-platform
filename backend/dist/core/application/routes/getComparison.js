"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGetComparison = makeGetComparison;
const TARGET_2025 = 89.3368;
function makeGetComparison(routeRepo) {
    return async function getComparison() {
        const routes = await routeRepo.findComparison();
        const grouped = routes.reduce((acc, r) => {
            var _a;
            (acc[_a = r.year] || (acc[_a] = [])).push(r);
            return acc;
        }, {});
        const finalResult = [];
        for (const yearStr of Object.keys(grouped)) {
            const year = Number(yearStr);
            const list = grouped[year];
            const baseline = list.find((r) => r.is_baseline);
            if (!baseline) {
                console.warn(`⚠ No baseline found for year ${year}. Skipping.`);
                continue;
            }
            list.forEach((r) => {
                if (r.route_id === baseline.route_id)
                    return;
                const percentDiff = Number(((r.ghg_intensity / baseline.ghg_intensity - 1) * 100).toFixed(2));
                const compliant = r.ghg_intensity <= TARGET_2025;
                finalResult.push({
                    year,
                    routeId: r.route_id,
                    vesselType: r.vesselType,
                    fuelType: r.fuelType,
                    baselineGHG: baseline.ghg_intensity,
                    comparisonGHG: r.ghg_intensity,
                    percentDiff,
                    compliant,
                });
            });
        }
        return finalResult;
    };
}
