"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeRoutesRouter;
const express_1 = __importDefault(require("express"));
const fetchRoutes_1 = require("../../../core/application/routes/fetchRoutes");
const setBaseline_1 = require("../../../core/application/routes/setBaseline");
const getComparison_1 = require("../../../core/application/routes/getComparison");
function makeRoutesRouter(routeRepo) {
    const router = express_1.default.Router();
    const fetchRoutes = (0, fetchRoutes_1.makeFetchRoutes)(routeRepo);
    const setBaseline = (0, setBaseline_1.makeSetBaseline)(routeRepo);
    const getComparison = (0, getComparison_1.makeGetComparison)(routeRepo);
    router.get("/", async (req, res) => {
        const data = await fetchRoutes();
        res.json(data);
    });
    router.post("/:routeId/baseline", async (req, res) => {
        try {
            await setBaseline(req.params.routeId);
            res.status(204).send(null);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
    router.get("/comparison", async (req, res) => {
        const data = await getComparison();
        res.json(data);
    });
    return router;
}
