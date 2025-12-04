// src/adapters/inbound/http/bankingRouter.ts
import { Router } from "express";
import { BankingRepository } from "../../../core/ports/bankingRepository";
import { ComplianceRepository } from "../../../core/ports/complianceRepository";
import { makeBankSurplus } from "../../../core/application/banking/bankSurplus";
import { makeApplyBank } from "../../../core/application/banking/applyBank";

export default function makeBankingRouter(
  bankingRepo: BankingRepository,
  complianceRepo: ComplianceRepository
) {
  const router = Router();

  const bankSurplus = makeBankSurplus(bankingRepo, complianceRepo);
  const applyBank = makeApplyBank(bankingRepo, complianceRepo);

  // GET banking records / summary
  router.get("/records", async (req, res) => {
    try {
      const { routeId, year } = req.query;
      if (!routeId || !year)
        return res.status(400).json({ error: "routeId & year required" });

      const shipId = String(routeId);
      const y = Number(year);

      // cb_before
      const cb = await complianceRepo.getComplianceBalance(shipId, y);
      const cb_before = cb ? cb.cb_gco2eq : 0;

      // available banked amount
      const available = await bankingRepo.getAvailableBanked(shipId, y);

      // list all bank entries
      const entries = await bankingRepo.listBankEntries(shipId, y);

      res.json({
        cb_before,
        available,
        entries,
      });
    } catch (err: any) {
      console.error("GET /banking/records error:", err);
      res.status(500).json({ error: err.message || "failed" });
    }
  });

  // POST bank => bank the positive CB
  router.post("/bank", async (req, res) => {
    try {
      const { routeId, year } = req.body;
      if (!routeId || !year)
        return res.status(400).json({ error: "routeId & year required" });

      const result = await bankSurplus(String(routeId), Number(year));
      res.json(result);
    } catch (err: any) {
      console.error("POST /banking/bank error:", err);
      res.status(400).json({ error: err.message || "failed to bank" });
    }
  });

  // POST apply => apply banked amount to a deficit
  // body: { routeId, year, amount }
  router.post("/apply", async (req, res) => {
    try {
      const { routeId, year, amount } = req.body;
      if (!routeId || !year || !amount)
        return res
          .status(400)
          .json({ error: "routeId, year and amount required" });

      const result = await applyBank(
        String(routeId),
        Number(year),
        Number(amount)
      );
      res.json(result);
    } catch (err: any) {
      console.error("POST /banking/apply error:", err);
      res
        .status(400)
        .json({ error: err.message || "failed to apply banked amount" });
    }
  });

  return router;
}
