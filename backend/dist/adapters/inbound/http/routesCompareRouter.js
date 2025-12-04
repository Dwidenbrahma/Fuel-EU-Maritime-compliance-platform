"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCompareRouter = createCompareRouter;
const express_1 = require("express");
const getComparison_1 = require("../../../core/application/routes/getComparison");
const routeRepositoryPrisma_1 = require("../../outbound/postgres/routeRepositoryPrisma");
function createCompareRouter() {
    const router = (0, express_1.Router)();
    const repo = new routeRepositoryPrisma_1.RouteRepositoryPrisma();
    const getComparison = (0, getComparison_1.makeGetComparison)(repo);
    router.get("/comparison", async (req, res) => {
        try {
            const data = await getComparison();
            res.json(data);
        }
        catch (err) {
            console.error("Error computing comparison:", err);
            res.status(500).json({ error: "Failed to compute comparison results" });
        }
    });
    return router;
}
