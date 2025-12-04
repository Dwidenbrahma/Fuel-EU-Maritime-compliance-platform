"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUPPORTED_FUELS = exports.EMISSION_FACTORS = exports.ENERGY_DENSITY = void 0;
exports.ENERGY_DENSITY = {
    HFO: 40000,
    MGO: 43000,
    LNG: 50000,
    METHANOL: 20000,
};
exports.EMISSION_FACTORS = {
    HFO: 3200000,
    MGO: 3180000,
    LNG: 2750000,
    METHANOL: 1400000,
};
exports.SUPPORTED_FUELS = Object.keys(exports.ENERGY_DENSITY);
