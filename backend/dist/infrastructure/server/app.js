"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Repository adapters (Prisma) - outbound adapters
const complianceRepositoryPrisma_1 = require("../../adapters/outbound/postgres/complianceRepositoryPrisma");
const routeRepositoryPrisma_1 = require("../../adapters/outbound/postgres/routeRepositoryPrisma");
const bankingRepositoryPrisma_1 = require("../../adapters/outbound/postgres/bankingRepositoryPrisma");
const poolingRepositoryPrisma_1 = require("../../adapters/outbound/postgres/poolingRepositoryPrisma");
// HTTP routers (Inbound adapters)
const routesRouter_1 = __importDefault(require("../../adapters/inbound/http/routesRouter"));
const complianceController_1 = __importDefault(require("../../adapters/inbound/http/complianceController"));
const bankingController_1 = __importDefault(require("../../adapters/inbound/http/bankingController"));
const poolingController_1 = __importDefault(require("../../adapters/inbound/http/poolingController"));
const routesCompareRouter_1 = require("../../adapters/inbound/http/routesCompareRouter");
// createApp only composes the application: middleware, repository instantiation,
// and wiring repositories into HTTP adapters (controllers). No use-case logic
// or Prisma queries are executed here.
function createApp() {
    const app = (0, express_1.default)();
    // Middlewares
    app.use(express_1.default.json());
    app.use((0, cors_1.default)());
    // Instantiate repository adapters (Prisma implementations of ports)
    const routeRepo = new routeRepositoryPrisma_1.RouteRepositoryPrisma();
    const complianceRepo = new complianceRepositoryPrisma_1.ComplianceRepositoryPrisma();
    const bankingRepo = new bankingRepositoryPrisma_1.BankingRepositoryPrisma();
    const poolRepo = new poolingRepositoryPrisma_1.PoolingRepositoryPrisma();
    // Wire inbound HTTP adapters by injecting repository ports.
    // Controllers will create their own use-case instances from the ports.
    app.use("/routes", (0, routesRouter_1.default)(routeRepo));
    app.use("/compliance", (0, complianceController_1.default)(complianceRepo));
    app.use("/banking", (0, bankingController_1.default)(bankingRepo, complianceRepo));
    app.use("/pools", (0, poolingController_1.default)(poolRepo, complianceRepo));
    app.use("/compare", (0, routesCompareRouter_1.createCompareRouter)());
    // Health check
    app.get("/", (_req, res) => res.send("FuelEU Backend Running ✔"));
    return app;
}
