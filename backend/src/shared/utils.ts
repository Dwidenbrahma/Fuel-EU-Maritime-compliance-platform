export const parseFloatOr = (v: any, fallback = 0) => {
  const n = Number(v);
  return isNaN(n) ? fallback : n;
};
