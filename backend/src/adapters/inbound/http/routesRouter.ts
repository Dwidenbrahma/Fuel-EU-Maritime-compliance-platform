import { Router } from "express";
import { RouteRepository } from "../../../core/ports/routeRepository";
import { makeListRoutesWithMetrics } from "../../../core/application/routes/listRoutesWithMetrics";
import { makeSetBaseline } from "../../../core/application/routes/setBaseline";
import { makeCompareRoutes } from "../../../core/application/routes/compareRoutes";

export default function makeRoutesRouter(routeRepo: RouteRepository) {
  const router = Router();
  const listRoutesWithMetrics = makeListRoutesWithMetrics(routeRepo);
  const setBaseline = makeSetBaseline(routeRepo);
  const compareRoutes = makeCompareRoutes(routeRepo);

  router.get("/", async (req, res) => {
    try {
      const filters: any = {};
      if (req.query.shipId) filters.shipId = String(req.query.shipId);
      if (req.query.year) filters.year = Number(req.query.year);
      if (req.query.vesselType)
        filters.vesselType = String(req.query.vesselType);
      if (req.query.fuelType) filters.fuelType = String(req.query.fuelType);
      if (req.query.minEmissions)
        filters.minEmissions = Number(req.query.minEmissions);
      if (req.query.minIntensity)
        filters.minIntensity = Number(req.query.minIntensity);
      if (req.query.minFuel) filters.minFuel = Number(req.query.minFuel);

      const routes = await listRoutesWithMetrics(filters);

      // Map to frontend shape
      const out = routes.map((r) => ({
        routeId: r.id,
        routeName: r.route_name || "",
        vesselType: r.vessel_type || "",
        fuelType: r.fuel_type || "",
        fuelTons: r.fuel_tons,
        distanceNm: r.distance_nm || 0,
        emissions: r.emissions_gco2eq || 0,
        energy: r.energy_mj || 0,
        intensity: r.intensity_gco2_per_mj || 0,
        baseline: r.baseline_intensity ?? null,
      }));

      res.json(out);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "failed to list routes" });
    }
  });

  router.get("/compare", async (req, res) => {
    try {
      const { shipId, year, vesselType, fuelType, minEmissions, minIntensity } =
        req.query;

      if (!shipId || !year) {
        return res.status(400).json({ error: "shipId and year are required" });
      }

      const filters: any = {};
      if (vesselType) filters.vesselType = String(vesselType);
      if (fuelType) filters.fuelType = String(fuelType);
      if (minEmissions) filters.minEmissions = Number(minEmissions);
      if (minIntensity) filters.minIntensity = Number(minIntensity);

      const comparison = await compareRoutes(
        String(shipId),
        Number(year),
        filters
      );
      res.json(comparison);
    } catch (err: any) {
      res
        .status(400)
        .json({ error: err.message || "failed to compare routes" });
    }
  });

  router.post("/set-baseline", async (req, res) => {
    try {
      const { routeId } = req.body || {};
      if (!routeId) return res.status(400).json({ error: "routeId required" });

      const result = await setBaseline(routeId);
      res.json({ routeId, baseline: result.baseline });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "failed to set baseline" });
    }
  });

  return router;
}
