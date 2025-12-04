"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RouteRepositoryPrisma = void 0;
const prismaClient_1 = require("../../../infrastructure/prisma/prismaClient");
/**
 * Route Repository Adapter (Prisma implementation)
 * Handles all database operations for maritime routes.
 */
class RouteRepositoryPrisma {
    /**
     * Retrieve all routes from the database.
     */
    async findAll() {
        const rows = await prismaClient_1.prisma.route.findMany();
        return rows;
    }
    /**
     * Find a specific route by its UUID ID.
     */
    async findById(id) {
        return prismaClient_1.prisma.route.findUnique({
            where: { id: String(id) },
        });
    }
    /**
     * Find a specific route by route_id (legacy compatibility — map to id lookup).
     */
    async findByRouteId(routeId) {
        return prismaClient_1.prisma.route.findUnique({
            where: { id: routeId },
        });
    }
    /**
     * Set a route as baseline for its year.
     * Clears baseline_intensity from all other routes in the same year.
     */
    async setBaseline(routeId) {
        const route = await prismaClient_1.prisma.route.findUnique({
            where: { id: routeId },
        });
        if (!route)
            throw new Error(`Route with ID ${routeId} not found`);
        await prismaClient_1.prisma.route.updateMany({
            where: { year: route.year },
            data: { baseline_intensity: null },
        });
        await prismaClient_1.prisma.route.update({
            where: { id: routeId },
            data: { baseline_intensity: route.intensity_gco2_per_mj },
        });
    }
    /**
     * Find the baseline route for a given year (most recent with baseline_intensity set).
     */
    async findBaselineByYear(year) {
        return prismaClient_1.prisma.route.findFirst({
            where: { year, baseline_intensity: { not: null } },
            orderBy: { created_at: "desc" },
        });
    }
    /**
     * Find routes for comparison (optionally filtered by year).
     */
    async findComparison(year) {
        const routes = await prismaClient_1.prisma.route.findMany({
            where: year ? { year } : undefined,
            orderBy: { year: "desc" },
        });
        return routes;
    }
    /**
     * New API: listRoutes with dynamic filters
     */
    async listRoutes(filters) {
        const where = {};
        if (filters?.shipId)
            where.ship_id = filters.shipId;
        if (filters?.year)
            where.year = filters.year;
        if (filters?.vesselType)
            where.vessel_type = filters.vesselType;
        if (filters?.fuelType)
            where.fuel_type = filters.fuelType;
        if (filters?.minEmissions)
            where.emissions_gco2eq = { gte: filters.minEmissions };
        if (filters?.minIntensity)
            where.intensity_gco2_per_mj = { gte: filters.minIntensity };
        if (filters?.minFuel)
            where.fuel_tons = { gte: filters.minFuel };
        const rows = await prismaClient_1.prisma.route.findMany({ where });
        return rows.map((r) => ({
            id: r.id,
            ship_id: r.ship_id,
            route_name: r.route_name,
            vessel_type: r.vessel_type,
            fuel_type: r.fuel_type,
            fuel_tons: r.fuel_tons,
            year: r.year,
            distance_nm: r.distance_nm,
            energy_mj: r.energy_mj,
            emissions_gco2eq: r.emissions_gco2eq,
            intensity_gco2_per_mj: r.intensity_gco2_per_mj,
            baseline_intensity: r.baseline_intensity ?? null,
        }));
    }
    async getRoute(routeId) {
        const r = await prismaClient_1.prisma.route.findUnique({ where: { id: routeId } });
        if (!r)
            return null;
        return {
            id: r.id,
            ship_id: r.ship_id,
            route_name: r.route_name,
            vessel_type: r.vessel_type,
            fuel_type: r.fuel_type,
            fuel_tons: r.fuel_tons,
            year: r.year,
            distance_nm: r.distance_nm,
            energy_mj: r.energy_mj,
            emissions_gco2eq: r.emissions_gco2eq,
            intensity_gco2_per_mj: r.intensity_gco2_per_mj,
            baseline_intensity: r.baseline_intensity ?? null,
        };
    }
    async updateMetrics(routeId, metrics) {
        await prismaClient_1.prisma.route.update({
            where: { id: routeId },
            data: {
                energy_mj: metrics.energy_mj,
                emissions_gco2eq: metrics.emissions_gco2eq,
                intensity_gco2_per_mj: metrics.intensity_gco2_per_mj,
            },
        });
    }
    async setBaselineValue(routeId, baseline) {
        await prismaClient_1.prisma.route.update({
            where: { id: routeId },
            data: { baseline_intensity: baseline },
        });
    }
}
exports.RouteRepositoryPrisma = RouteRepositoryPrisma;
