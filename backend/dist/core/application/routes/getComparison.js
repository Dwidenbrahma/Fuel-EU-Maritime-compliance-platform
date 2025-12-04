"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeGetComparison = makeGetComparison;
function makeGetComparison(routeRepo) {
    return async function getComparison() {
        // This returns baseline + other routes with percentDiff & compliant flags
        const routes = await routeRepo.findComparison();
        // find baseline per year(s)
        // naive example: assume baseline exists and is unique per year
        const groupedByYear = routes.reduce((acc, r) => {
            var _a;
            (acc[_a = r.year] || (acc[_a] = [])).push(r);
            return acc;
        }, {});
        const result = [];
        for (const yearStr of Object.keys(groupedByYear)) {
            const year = Number(yearStr);
            const list = groupedByYear[year];
            const baseline = list.find((r) => r.is_baseline);
            if (!baseline) {
                // skip or treat
                continue;
            }
            for (const r of list) {
                if (r.route_id === baseline.route_id)
                    continue;
                const percentDiff = (r.ghg_intensity / baseline.ghg_intensity - 1) * 100;
                const target = 89.3368;
                const compliant = r.ghg_intensity <= target;
                result.push({
                    year,
                    routeId: r.route_id,
                    ghgIntensityBaseline: baseline.ghg_intensity,
                    ghgIntensityComparison: r.ghg_intensity,
                    percentDiff,
                    compliant,
                });
            }
        }
        return result;
    };
}
