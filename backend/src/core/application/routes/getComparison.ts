import { RouteRepository } from "../../ports/routeRepository";
import { TARGET_GHG_INTENSITY_2030 } from "../../domain/constants";

export function makeGetComparison(routeRepo: RouteRepository) {
  return async function getComparison() {
    const routes = await routeRepo.findComparison();

    const grouped = routes.reduce<Record<number, any[]>>((acc, r) => {
      (acc[r.year] ||= []).push(r);
      return acc;
    }, {});

    const finalResult: any[] = [];

    for (const yearStr of Object.keys(grouped)) {
      const year = Number(yearStr);
      const list = grouped[year];

      // baseline is the route in the year with a non-null baseline_intensity
      const baseline = list.find(
        r => r.baseline_intensity !== null && r.baseline_intensity !== undefined,
      );

      if (!baseline) {
        console.warn(`⚠ No baseline found for year ${year}. Skipping.`);
        continue;
      }

      list.forEach(r => {
        if (r.id === baseline.id) return;

        const baseVal = Number(baseline.baseline_intensity ?? 0);
        const curVal = Number(r.intensity_gco2_per_mj ?? 0);

        const percentDiff = baseVal > 0 ? Number(((curVal / baseVal - 1) * 100).toFixed(2)) : 0;

        const compliant = curVal <= TARGET_GHG_INTENSITY_2030;

        finalResult.push({
          year,
          routeId: r.id,
          vesselType: r.vessel_type,
          fuelType: r.fuel_type,
          baselineGHG: baseVal,
          comparisonGHG: curVal,
          percentDiff,
          compliant,
        });
      });
    }

    return finalResult;
  };
}
