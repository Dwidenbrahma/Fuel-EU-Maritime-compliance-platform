import { RouteRepository } from "../../ports/routeRepository";

export function makeSetBaseline(routeRepo: RouteRepository) {
  return async function setBaseline(routeId: string) {
    // Domain rule: set only one baseline per year ideally — kept simple
    await routeRepo.setBaseline(routeId);
    return;
  };
}
