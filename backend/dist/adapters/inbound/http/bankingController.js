"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = makeBankingRouter;
const express_1 = __importDefault(require("express"));
const bankSurplus_1 = require("../../../core/application/banking/bankSurplus");
const applyBank_1 = require("../../../core/application/banking/applyBank");
function makeBankingRouter(bankingRepo) {
    const router = express_1.default.Router();
    const bankSurplus = (0, bankSurplus_1.makeBankSurplus)(bankingRepo);
    const applyBank = (0, applyBank_1.makeApplyBank)(bankingRepo);
    router.get("/records", async (req, res) => {
        const shipId = String(req.query.shipId);
        const year = Number(req.query.year);
        const amount = await bankingRepo.getBankedAmount(shipId, year);
        res.json({ banked: amount });
    });
    router.post("/bank", async (req, res) => {
        try {
            const { shipId, year, amount } = req.body;
            await bankSurplus(shipId, year, amount);
            res.status(201).json({ ok: true });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
    router.post("/apply", async (req, res) => {
        try {
            const { shipId, year, amount } = req.body;
            await applyBank(shipId, year, amount);
            res.json({ ok: true });
        }
        catch (err) {
            res.status(400).json({ error: err.message });
        }
    });
    return router;
}
