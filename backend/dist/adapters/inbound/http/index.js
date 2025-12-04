"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRouters = registerRouters;
const routeController_1 = __importDefault(require("./routeController"));
const complianceController_1 = __importDefault(require("./complianceController"));
const bankingController_1 = __importDefault(require("./bankingController"));
const poolingController_1 = __importDefault(require("./poolingController"));
const routeRepositoryPrisma_1 = require("../../outbound/postgres/routeRepositoryPrisma");
const complianceRepositoryPrisma_1 = require("../../outbound/postgres/complianceRepositoryPrisma");
const bankingRepositoryPrisma_1 = require("../../outbound/postgres/bankingRepositoryPrisma");
const poolRepositoryPrisma_1 = require("../../outbound/postgres/poolRepositoryPrisma");
function registerRouters(app) {
    const routeRepo = new routeRepositoryPrisma_1.RouteRepositoryPrisma();
    const complianceRepo = new complianceRepositoryPrisma_1.ComplianceRepositoryPrisma();
    const bankingRepo = new bankingRepositoryPrisma_1.BankingRepositoryPrisma();
    const poolRepo = new poolRepositoryPrisma_1.PoolRepositoryPrisma();
    app.use("/routes", (0, routeController_1.default)(routeRepo));
    app.use("/compliance", (0, complianceController_1.default)(complianceRepo));
    app.use("/banking", (0, bankingController_1.default)(bankingRepo));
    app.use("/pools", (0, poolingController_1.default)(poolRepo));
}
