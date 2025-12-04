import { RouteRepository } from "../../../core/ports/routeRepository";
import { prisma } from "./prismaClient";
import type { Route } from "../../../core/domain/route";

/**
 * Route Repository Adapter (Prisma implementation)
 * Handles all database operations for maritime routes.
 */
export class RouteRepositoryPrisma implements RouteRepository {
  /**
   * Retrieve all routes from the database.
   */
  async findAll(): Promise<Route[]> {
    const rows = await prisma.route.findMany();
    return rows as unknown as Route[];
  }

  /**
   * Find a specific route by its numeric ID.
   */
  async findById(id: number): Promise<Route | null> {
    return prisma.route.findUnique({
      where: { id },
    }) as unknown as Route | null;
  }

  /**
   * Find a specific route by its unique route_id (string).
   */
  async findByRouteId(routeId: string): Promise<Route | null> {
    return prisma.route.findUnique({
      where: { route_id: routeId },
    }) as unknown as Route | null;
  }

  /**
   * Set a route as baseline for its year.
   * Clears baseline from all other routes in the same year.
   */
  async setBaseline(routeId: string): Promise<void> {
    const route = await prisma.route.findUnique({
      where: { route_id: routeId },
    });
    if (!route) throw new Error(`Route with ID ${routeId} not found`);
    await prisma.route.updateMany({
      where: { year: route.year },
      data: { is_baseline: false },
    });
    await prisma.route.update({
      where: { route_id: routeId },
      data: { is_baseline: true },
    });
  }

  /**
   * Find the baseline route for a given year.
   */
  async findBaselineByYear(year: number): Promise<Route | null> {
    return prisma.route.findFirst({
      where: { year, is_baseline: true },
    }) as unknown as Route | null;
  }

  /**
   * Find routes for comparison (optionally filtered by year).
   */
  async findComparison(year?: number): Promise<Route[]> {
    const routes = await prisma.route.findMany({
      where: year ? { year } : undefined,
      orderBy: { year: "desc" },
    });
    return routes as unknown as Route[];
  }
}
