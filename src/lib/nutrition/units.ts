// Universal mass/volume unit -> grams (or ml) conversion constants. These
// are physical constants, not per-food data, so they live in code rather
// than a food_servings row — every food supports g/kg/oz/lb (or ml/l for
// liquid-basis foods) without needing a database row for it.
const MASS_TO_GRAMS: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: 28.3495,
  lb: 453.592,
};

const VOLUME_TO_ML: Record<string, number> = {
  ml: 1,
  l: 1000,
};

export const UNIVERSAL_MASS_UNITS = Object.keys(MASS_TO_GRAMS);
export const UNIVERSAL_VOLUME_UNITS = Object.keys(VOLUME_TO_ML);

// Resolves a quantity of a universal unit to the food's basis unit (g or
// ml). Returns null if the unit isn't a universal one (i.e. it must be a
// food_servings row instead).
export function convertToBasisUnit(
  quantity: number,
  unit: string,
  basisUnit: "g" | "ml",
): number | null {
  const table = basisUnit === "g" ? MASS_TO_GRAMS : VOLUME_TO_ML;
  const factor = table[unit];
  return factor ? quantity * factor : null;
}
