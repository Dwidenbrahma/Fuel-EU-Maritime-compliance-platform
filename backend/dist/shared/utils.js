"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFloatOr = void 0;
const parseFloatOr = (v, fallback = 0) => {
    const n = Number(v);
    return isNaN(n) ? fallback : n;
};
exports.parseFloatOr = parseFloatOr;
