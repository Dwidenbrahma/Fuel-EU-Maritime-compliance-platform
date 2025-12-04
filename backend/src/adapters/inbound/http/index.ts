import express from "express";
import makeRoutesRouter from "./routeController";
import makeComplianceRouter from "./complianceController";
import makeBankingRouter from "./bankingController";
import makePoolingRouter from "./poolingController";

import { RouteRepositoryPrisma } from "../../outbound/postgres/routeRepositoryPrisma";
import { ComplianceRepositoryPrisma } from "../../outbound/postgres/complianceRepositoryPrisma";
import { BankingRepositoryPrisma } from "../../outbound/postgres/bankingRepositoryPrisma";
import { PoolRepositoryPrisma } from "../../outbound/postgres/poolRepositoryPrisma";

export function registerRouters(app: express.Express) {
  const routeRepo = new RouteRepositoryPrisma();
  const complianceRepo = new ComplianceRepositoryPrisma();
  const bankingRepo = new BankingRepositoryPrisma();
  const poolRepo = new PoolRepositoryPrisma();

  app.use("/routes", makeRoutesRouter(routeRepo));
  app.use("/compliance", makeComplianceRouter(complianceRepo));
  app.use("/banking", makeBankingRouter(bankingRepo));
  app.use("/pools", makePoolingRouter(poolRepo));
}
