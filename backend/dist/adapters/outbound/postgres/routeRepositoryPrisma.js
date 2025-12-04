"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteRepositoryPrisma = void 0;
const prismaClient_1 = require("./prismaClient");
class RouteRepositoryPrisma {
    async findAll() {
        const rows = await prismaClient_1.prisma.route.findMany();
        return rows;
    }
    async findById(id) {
        return prismaClient_1.prisma.route.findUnique({
            where: { id },
        });
    }
    async findByRouteId(routeId) {
        return prismaClient_1.prisma.route.findUnique({
            where: { route_id: routeId },
        });
    }
    async setBaseline(routeId) {
        // first unset other baselines in same year (optional)
        const r = await prismaClient_1.prisma.route.findUnique({ where: { route_id: routeId } });
        if (!r)
            throw new Error("Route not found");
        await prismaClient_1.prisma.route.updateMany({
            where: { year: r.year },
            data: { is_baseline: false },
        });
        await prismaClient_1.prisma.route.update({
            where: { route_id: routeId },
            data: { is_baseline: true },
        });
    }
    async findBaselineByYear(year) {
        return prismaClient_1.prisma.route.findFirst({
            where: { year, is_baseline: true },
        });
    }
    async findComparison() {
        return prismaClient_1.prisma.route.findMany();
    }
}
exports.RouteRepositoryPrisma = RouteRepositoryPrisma;
