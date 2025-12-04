import express from "express";
import cors from "cors";

// Repository adapters (Prisma) - outbound adapters
import { ComplianceRepositoryPrisma } from "../../adapters/outbound/postgres/complianceRepositoryPrisma";
import { RouteRepositoryPrisma } from "../../adapters/outbound/postgres/routeRepositoryPrisma";
import { BankingRepositoryPrisma } from "../../adapters/outbound/postgres/bankingRepositoryPrisma";
import { PoolingRepositoryPrisma } from "../../adapters/outbound/postgres/poolingRepositoryPrisma";

// HTTP routers (Inbound adapters)
import makeRoutesRouter from "../../adapters/inbound/http/routesRouter";
import makeComplianceRouter from "../../adapters/inbound/http/complianceController";
import makeBankingRouter from "../../adapters/inbound/http/bankingController";
import makePoolingRouter from "../../adapters/inbound/http/poolingController";
import { createCompareRouter } from "../../adapters/inbound/http/routesCompareRouter";

// createApp only composes the application: middleware, repository instantiation,
// and wiring repositories into HTTP adapters (controllers). No use-case logic
// or Prisma queries are executed here.
export function createApp() {
  const app = express();

  // Middlewares
  app.use(express.json());
  app.use(cors());

  // Instantiate repository adapters (Prisma implementations of ports)
  const routeRepo = new RouteRepositoryPrisma();
  const complianceRepo = new ComplianceRepositoryPrisma();
  const bankingRepo = new BankingRepositoryPrisma();
  const poolRepo = new PoolingRepositoryPrisma();

  // Wire inbound HTTP adapters by injecting repository ports.
  // Controllers will create their own use-case instances from the ports.
  app.use("/api/routes", makeRoutesRouter(routeRepo));
  app.use("/api/compliance", makeComplianceRouter(complianceRepo));
  app.use("/api/banking", makeBankingRouter(bankingRepo, complianceRepo));
  app.use("/api/pools", makePoolingRouter(poolRepo, complianceRepo));
  app.use("/api/compare", createCompareRouter());

  // Health check
  app.get("/api/", (_req, res) => res.send("FuelEU Backend Running ✔"));

  return app;
}
