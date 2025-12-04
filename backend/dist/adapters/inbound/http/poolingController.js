"use strict";
// src/adapters/inbound/http/poolingController.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makePoolingRouter;
const express_1 = require("express");
const createPool_1 = require("../../../core/application/pooling/createPool");
function makePoolingRouter(poolingRepo, complianceRepo) {
    const router = (0, express_1.Router)();
    const createPool = (0, createPool_1.makeCreatePool)(complianceRepo, poolingRepo);
    // POST /pooling/create
    router.post("/create", async (req, res) => {
        try {
            const { shipIds, year } = req.body;
            if (!shipIds || !Array.isArray(shipIds)) {
                return res.status(400).json({ error: "shipIds array is required" });
            }
            if (!year) {
                return res.status(400).json({ error: "year is required" });
            }
            const result = await createPool(shipIds, year);
            res.json({
                poolId: result.poolId,
                year: result.year,
                pooledCB: result.pooledCB,
                ships: result.ships.map((s) => ({
                    shipId: s.shipId,
                    adjustedCB: s.adjustedCB,
                })),
            });
        }
        catch (err) {
            res.status(400).json({ error: err.message || "failed to create pool" });
        }
    });
    // GET /pooling/members?poolId=XYZ
    router.get("/members", async (req, res) => {
        try {
            const { poolId } = req.query;
            if (!poolId) {
                return res.status(400).json({ error: "poolId is required" });
            }
            const members = await poolingRepo.getPoolMembers(String(poolId));
            res.json({ poolId, members });
        }
        catch (err) {
            res
                .status(400)
                .json({ error: err.message || "failed to fetch pool members" });
        }
    });
    // GET /pooling/ship?shipId=XYZ&year=2024
    router.get("/ship", async (req, res) => {
        try {
            const { shipId, year } = req.query;
            if (!shipId || !year) {
                return res.status(400).json({ error: "shipId and year are required" });
            }
            const pool = await poolingRepo.getPoolForShip(String(shipId), Number(year));
            res.json(pool);
        }
        catch (err) {
            res.status(400).json({ error: err.message || "failed to fetch pool" });
        }
    });
    return router;
}
