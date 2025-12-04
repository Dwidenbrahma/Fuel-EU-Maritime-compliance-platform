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
      if (req.query.vesselType) filters.vesselType = String(req.query.vesselType);
      if (req.query.fuelType) filters.fuelType = String(req.query.fuelType);
      if (req.query.minEmissions) filters.minEmissions = Number(req.query.minEmissions);
      if (req.query.minIntensity) filters.minIntensity = Number(req.query.minIntensity);
      if (req.query.minFuel) filters.minFuel = Number(req.query.minFuel);

      const routes = await listRoutesWithMetrics(filters);

      // Map to frontend shape (use canonical field names: id, baseline_intensity)
      const out = routes.map(r => ({
        id: r.id,
        shipId: r.ship_id || "",
        routeName: r.route_name || "",
        vesselType: r.vessel_type || "",
        fuelType: r.fuel_type || "",
        fuelTons: r.fuel_tons,
        distanceNm: r.distance_nm || 0,
        emissionsGco2eq: r.emissions_gco2eq || 0,
        energyMj: r.energy_mj || 0,
        intensityGco2PerMj: r.intensity_gco2_per_mj || 0,
        baselineIntensity: r.baseline_intensity,
        createdAt: new Date().toISOString(),
      }));

      res.json(out);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "failed to list routes" });
    }
  });

  router.get("/compare", async (req, res) => {
    try {
      const { shipId, year, vesselType, fuelType, minEmissions, minIntensity } = req.query;

      if (!shipId || !year) {
        return res.status(400).json({ error: "shipId and year are required" });
      }

      const filters: any = {};
      if (vesselType) filters.vesselType = String(vesselType);
      if (fuelType) filters.fuelType = String(fuelType);
      if (minEmissions) filters.minEmissions = Number(minEmissions);
      if (minIntensity) filters.minIntensity = Number(minIntensity);

      const comparison = await compareRoutes(String(shipId), Number(year), filters);
      res.json(comparison);
    } catch (err: any) {
      res.status(400).json({ error: err.message || "failed to compare routes" });
    }
  });

  router.post("/set-baseline", async (req, res) => {
    try {
      const { routeId, intensity } = req.body || {};
      if (!routeId) return res.status(400).json({ error: "routeId required" });
      if (intensity === undefined || intensity === null) {
        return res.status(400).json({ error: "intensity required" });
      }

      // Allow intensity = 0 to clear/unset baseline
      if (intensity !== 0 && intensity <= 0) {
        return res.status(400).json({ error: "intensity must be positive or 0 to clear" });
      }

      // If intensity is 0, set baseline to null; otherwise use the value
      const baselineValue = intensity === 0 ? null : intensity;
      await routeRepo.setBaselineValue(routeId, baselineValue);
      res.json({ success: true, routeId, baseline: baselineValue });
    } catch (err: any) {
      res.status(400).json({ error: err.message || "failed to set baseline" });
    }
  });

  return router;
}
