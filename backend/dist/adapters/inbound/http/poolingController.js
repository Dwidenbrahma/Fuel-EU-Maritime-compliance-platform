"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makePoolingRouter;
const express_1 = __importDefault(require("express"));
const createPool_1 = require("../../../core/application/pooling/createPool");
function makePoolingRouter(poolRepo) {
    const router = express_1.default.Router();
    const createPool = (0, createPool_1.makeCreatePool)(poolRepo);
    router.post("/", async (req, res) => {
        try {
            const { year, members } = req.body; // members: [{ shipId, cb_before }]
            const pool = await createPool(year, members);
            res.status(201).json(pool);
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
    return router;
}
