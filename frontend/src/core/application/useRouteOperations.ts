// src/core/application/useRouteOperations.ts

import type { RoutesPort, RouteFilters } from "../ports/routesPort";

export const makeUseListRoutes = (routesPort: RoutesPort) => {
  return async (filters?: RouteFilters) => {
    return routesPort.listRoutes(filters);
  };
};

export const makeUseSetBaseline = (routesPort: RoutesPort) => {
  return async (routeId: string, intensity: number) => {
    if (intensity <= 0) {
      throw new Error("Baseline intensity must be positive");
    }
    await routesPort.setBaseline(routeId, intensity);
  };
};

export const makeUseCompareRoutes = (routesPort: RoutesPort) => {
  return async (filters?: RouteFilters) => {
    return routesPort.compareRoutes(filters);
  };
};
