import "server-only";
import { USDA_NUTRIENT_MAP } from "@/lib/foods/nutrient-map";
import type { FoodSearchHit, NormalizedFood, NormalizedServing } from "@/lib/foods/types";

const USDA_BASE = "https://api.nal.usda.gov/fdc/v1";

function apiKey(): string {
  const key = process.env.USDA_API_KEY;
  if (!key) throw new Error("USDA_API_KEY is not configured.");
  return key;
}

interface UsdaSearchFood {
  fdcId: number;
  description: string;
  dataType: string;
  brandName?: string;
  brandOwner?: string;
  foodNutrients?: { nutrientId: number; value: number }[];
}

interface UsdaSearchResponse {
  foods: UsdaSearchFood[];
}

export async function searchUsda(query: string, pageSize = 15): Promise<FoodSearchHit[]> {
  const url = new URL(`${USDA_BASE}/foods/search`);
  url.searchParams.set("query", query);
  url.searchParams.set("pageSize", String(pageSize));
  url.searchParams.set("api_key", apiKey());

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`USDA search failed: ${res.status}`);

  const data = (await res.json()) as UsdaSearchResponse;
  return (data.foods ?? []).map((food) => {
    // The search endpoint's inline foodNutrients aren't reliably per-100g
    // (branded items can report per-serving here) — good enough for a
    // "roughly N kcal" hint in the results list, but getUsdaFoodDetails is
    // the source of truth once a food is actually selected.
    const energy = food.foodNutrients?.find((n) => n.nutrientId === 1008)?.value ?? null;
    return {
      source: "usda" as const,
      id: String(food.fdcId),
      name: food.description,
      brand: food.brandName || food.brandOwner || null,
      sourceType: "USDA" as const,
      caloriesPer100: energy,
    };
  });
}

interface UsdaFoodNutrient {
  nutrient: { id: number; name: string; unitName: string };
  amount?: number;
}

interface UsdaFoodPortion {
  gramWeight: number;
  amount?: number;
  modifier?: string;
  // Only present on Survey (FNDDS) entries. When present it's the actual
  // human-readable label ("1 cup, mashed") — `modifier` on those same
  // entries is an internal numeric portion code, not text, despite reading
  // like a label on SR Legacy/Foundation entries (e.g. "medium (7\" long)").
  portionDescription?: string;
  measureUnit?: { name: string };
}

interface UsdaFoodDetail {
  fdcId: number;
  description: string;
  dataType: string;
  brandName?: string;
  brandOwner?: string;
  ingredients?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  householdServingFullText?: string;
  foodPortions?: UsdaFoodPortion[];
  foodNutrients?: UsdaFoodNutrient[];
  publishedDate?: string;
}

export async function getUsdaFoodDetails(fdcId: string): Promise<NormalizedFood> {
  const url = new URL(`${USDA_BASE}/food/${fdcId}`);
  url.searchParams.set("api_key", apiKey());

  const res = await fetch(url, { next: { revalidate: 0 } });
  if (!res.ok) throw new Error(`USDA food detail failed: ${res.status}`);

  const food = (await res.json()) as UsdaFoodDetail;
  return normalizeUsdaFood(food);
}

function normalizeUsdaFood(food: UsdaFoodDetail): NormalizedFood {
  const basisUnit: "g" | "ml" = food.servingSizeUnit === "ml" ? "ml" : "g";

  const nutrientsPer100: Record<string, number> = {};
  for (const n of food.foodNutrients ?? []) {
    const key = USDA_NUTRIENT_MAP[n.nutrient.id];
    if (!key || n.amount == null) continue;
    // A few nutrient ids alias the same key across USDA data-type eras
    // (e.g. 1063 vs 2000 for sugar) — first one present wins.
    if (!(key in nutrientsPer100)) nutrientsPer100[key] = n.amount;
  }

  const servings: NormalizedServing[] = [];

  // Branded foods carry a single label serving size, not foodPortions.
  if (food.servingSize && food.servingSizeUnit) {
    servings.push({
      unit: "serving",
      label: food.householdServingFullText ?? `${food.servingSize}${food.servingSizeUnit}`,
      quantity: 1,
      gramsEquivalent: food.servingSize,
      isDefault: true,
    });
  }

  for (const portion of food.foodPortions ?? []) {
    if (!portion.gramWeight) continue;
    // portionDescription (FNDDS) is always real text when present. modifier
    // is real text on SR Legacy/Foundation entries, but on FNDDS entries
    // it's a numeric portion code — guard against passing that through.
    const modifierIsText = portion.modifier && !/^\d+$/.test(portion.modifier);
    servings.push({
      unit: "serving",
      label: portion.portionDescription ?? (modifierIsText ? portion.modifier! : null) ?? portion.measureUnit?.name ?? null,
      quantity: portion.amount ?? 1,
      gramsEquivalent: portion.gramWeight,
      isDefault: servings.length === 0,
    });
  }

  return {
    name: food.description,
    brand: food.brandName || food.brandOwner || null,
    description: null,
    barcode: null,
    basisUnit,
    ingredientsText: food.ingredients ?? null,
    sourceType: "USDA",
    sourceId: String(food.fdcId),
    sourceUrl: `https://fdc.nal.usda.gov/food-details/${food.fdcId}/nutrients`,
    sourceLastUpdated: food.publishedDate ?? null,
    nutrientsPer100,
    servings,
  };
}
