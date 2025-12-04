import { RouteRepository } from "../../ports/routeRepository";

export function makeFetchRoutes(routeRepo: RouteRepository) {
  return async function fetchRoutes() {
    const routes = await routeRepo.findAll();
    return routes;
  };
}
