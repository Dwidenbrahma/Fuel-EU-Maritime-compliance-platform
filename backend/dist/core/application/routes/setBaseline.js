"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeSetBaseline = makeSetBaseline;
function makeSetBaseline(routeRepo) {
    return async function setBaseline(routeId) {
        // Domain rule: set only one baseline per year ideally — kept simple
        await routeRepo.setBaseline(routeId);
        return;
    };
}
