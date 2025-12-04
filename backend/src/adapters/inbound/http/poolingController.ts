// src/adapters/inbound/http/poolingRouter.ts

import { Router } from "express";
import { PoolingRepositoryPrisma } from "../../outbound/postgres/poolingRepositoryPrisma";
import { ComplianceRepositoryPrisma } from "../../outbound/postgres/complianceRepositoryPrisma";
import { makeCreatePool } from "../../../core/application/pooling/createPool";

export default function makePoolingRouter() {
  const router = Router();
  const poolingRepo = new PoolingRepositoryPrisma();
  const complianceRepo = new ComplianceRepositoryPrisma();

  const createPool = makeCreatePool(complianceRepo, poolingRepo);

  router.post("/", async (req, res) => {
    try {
      const { shipIds, year } = req.body;
      const result = await createPool(shipIds, year);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}
