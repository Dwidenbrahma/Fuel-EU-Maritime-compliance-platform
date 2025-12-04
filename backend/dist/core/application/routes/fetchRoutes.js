"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFetchRoutes = makeFetchRoutes;
function makeFetchRoutes(routeRepo) {
    return async function fetchRoutes() {
        const routes = await routeRepo.findAll();
        return routes;
    };
}
