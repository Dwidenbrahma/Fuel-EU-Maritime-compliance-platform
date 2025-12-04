import express from "express";
import { ComplianceRepository } from "../../../core/ports/complianceRepository";
import { makeComputeCB } from "../../../core/application/compliance/computeCB";
//import { makeGetAdjustedCB } from "../../../core/application/compliance/getAdjustedCB"; // implement similarly

export default function makeComplianceRouter(
  complianceRepo: ComplianceRepository
) {
  const router = express.Router();
  const computeCB = makeComputeCB(complianceRepo);
  // implement other handlers as needed
  router.get("/cb", async (req, res) => {
    // compute using query params: shipId, year, actualIntensity, fuelConsumption
    const shipId = String(req.query.shipId || "ship1");
    const year = Number(req.query.year || 2025);
    const actualIntensity = Number(req.query.actualIntensity || 90);
    const fuel = Number(req.query.fuel || 1000);
    const cb = await computeCB(shipId, actualIntensity, fuel, year);
    res.json({ cb });
  });

  router.get("/adjusted-cb", async (req, res) => {
    // call repository for adjusted CBs
    const year = Number(req.query.year || 2025);
    const rows = await complianceRepo.listAdjustedCB(year);
    // map repository shape (snake_case) to API contract expected by frontend
    const mapped = rows.map((r) => ({
      shipId: r.ship_id,
      adjustedCB: r.cb_before,
    }));
    res.json(mapped);
  });

  return router;
}
