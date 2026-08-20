// Deterministic nutrition scaling (spec section 45): full floating-point
// precision through the calculation, rounding deferred to display only.
// A nutrient absent from nutrientsPer100 stays absent in the result — never
// coerced to 0 — so "unknown" stays distinguishable from "zero" downstream.
export function scaleNutrients(
  nutrientsPer100: Record<string, number>,
  gramsEquivalent: number,
): Record<string, number> {
  const factor = gramsEquivalent / 100;
  const scaled: Record<string, number> = {};
  for (const [key, amount] of Object.entries(nutrientsPer100)) {
    scaled[key] = amount * factor;
  }
  return scaled;
}
