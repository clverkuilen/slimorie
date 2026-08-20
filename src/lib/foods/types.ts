// A food record normalized into our internal representation, not yet
// persisted. See section 43 of SPEC.md — external sources must be
// normalized into a common shape before touching the database.
export interface NormalizedServing {
  unit: string;
  label: string | null;
  quantity: number;
  gramsEquivalent: number;
  isDefault: boolean;
}

export interface NormalizedFood {
  name: string;
  brand: string | null;
  description: string | null;
  barcode: string | null;
  basisUnit: "g" | "ml";
  ingredientsText: string | null;
  sourceType: "USDA" | "OPEN_FOOD_FACTS" | "USER" | "MANUFACTURER" | "OTHER";
  sourceId: string;
  sourceUrl: string | null;
  sourceLastUpdated: string | null;
  // nutrient_key -> amount per 100 (basisUnit). Absent key = unknown, never 0.
  nutrientsPer100: Record<string, number>;
  servings: NormalizedServing[];
}

// A lightweight search hit — enough to render a result row and let the user
// pick it, without the cost of a full detail fetch for every row.
export interface FoodSearchHit {
  source: "local" | "usda";
  // For source "local": our foods.id. For source "usda": the fdcId (string).
  id: string;
  name: string;
  brand: string | null;
  sourceType: NormalizedFood["sourceType"];
  caloriesPer100: number | null;
}
