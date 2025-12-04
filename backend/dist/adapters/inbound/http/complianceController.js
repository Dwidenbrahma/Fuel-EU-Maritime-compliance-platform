"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeComplianceRouter;
const express_1 = __importDefault(require("express"));
const computeCB_1 = require("../../../core/application/compliance/computeCB");
//import { makeGetAdjustedCB } from "../../../core/application/compliance/getAdjustedCB"; // implement similarly
function makeComplianceRouter(complianceRepo) {
    const router = express_1.default.Router();
    const computeCB = (0, computeCB_1.makeComputeCB)(complianceRepo);
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
        res.json(rows);
    });
    return router;
}
