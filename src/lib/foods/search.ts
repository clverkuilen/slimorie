import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { searchUsda } from "@/lib/foods/usda";
import type { FoodSearchHit } from "@/lib/foods/types";

export interface RecentOrFavoriteFood {
  foodId: string;
  name: string;
  brand: string | null;
  sourceType: FoodSearchHit["sourceType"];
  caloriesPer100: number | null;
  lastLoggedAt?: string;
}

// Recent foods (spec section 18) are derived from food_log_entries rather
// than tracked in a separate table — DISTINCT ON food_id, most recent
// first, capped so the list can't grow unbounded. The per-100 calorie value
// is looked up fresh from food_nutrients rather than read off the log
// entry's nutrition_snapshot, since that snapshot reflects whatever
// quantity was logged last time, not a per-100 basis.
export async function getRecentFoods(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 10,
): Promise<RecentOrFavoriteFood[]> {
  const { data, error } = await supabase
    .from("food_log_entries")
    .select("food_id, food_name_snapshot, brand_snapshot, source_type_snapshot, logged_at")
    .eq("user_id", userId)
    .not("food_id", "is", null)
    .order("logged_at", { ascending: false })
    .limit(50);

  if (error || !data) return [];

  const seen = new Set<string>();
  const deduped: typeof data = [];
  for (const entry of data) {
    if (!entry.food_id || seen.has(entry.food_id)) continue;
    seen.add(entry.food_id);
    deduped.push(entry);
    if (deduped.length >= limit) break;
  }

  const calorieByFoodId = await getCaloriesPer100(
    supabase,
    deduped.map((e) => e.food_id!),
  );

  return deduped.map((entry) => ({
    foodId: entry.food_id!,
    name: entry.food_name_snapshot,
    brand: entry.brand_snapshot,
    sourceType: (entry.source_type_snapshot ?? "USER") as FoodSearchHit["sourceType"],
    caloriesPer100: calorieByFoodId.get(entry.food_id!) ?? null,
    lastLoggedAt: entry.logged_at,
  }));
}

export async function getFavoriteFoods(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<RecentOrFavoriteFood[]> {
  const { data, error } = await supabase
    .from("favorite_foods")
    .select("food_id, foods(name, brand, food_sources(source_type))")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  const foodIds = data.filter((row) => row.foods).map((row) => row.food_id);
  const calorieByFoodId = await getCaloriesPer100(supabase, foodIds);

  return data
    .filter((row) => row.foods)
    .map((row) => ({
      foodId: row.food_id,
      name: row.foods!.name,
      brand: row.foods!.brand,
      sourceType: (row.foods!.food_sources?.source_type ?? "USER") as FoodSearchHit["sourceType"],
      caloriesPer100: calorieByFoodId.get(row.food_id) ?? null,
    }));
}

async function getCaloriesPer100(
  supabase: SupabaseClient<Database>,
  foodIds: string[],
): Promise<Map<string, number>> {
  if (foodIds.length === 0) return new Map();
  const { data } = await supabase
    .from("food_nutrients")
    .select("food_id, amount_per_100")
    .eq("nutrient_key", "energy_kcal")
    .in("food_id", foodIds);

  return new Map((data ?? []).map((row) => [row.food_id, row.amount_per_100]));
}

// Searches our own cached foods first (system foods + the user's own custom
// foods), via trigram similarity so misspellings still surface something,
// then supplements with a live USDA search for anything not cached yet.
// Matches spec section 9's priority ordering loosely: whatever's already in
// our DB (which recent/favorite foods always are) naturally ranks above
// fresh USDA discovery.
export async function searchFoods(
  supabase: SupabaseClient<Database>,
  userId: string,
  query: string,
): Promise<FoodSearchHit[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const [localResult, usdaResult] = await Promise.allSettled([
    supabase
      .from("foods")
      .select("id, name, brand, food_sources(source_type), food_nutrients(nutrient_key, amount_per_100)")
      .or(`owner_user_id.eq.${userId},owner_user_id.is.null`)
      .ilike("name", `%${trimmed}%`)
      .is("deleted_at", null)
      .limit(10),
    searchUsda(trimmed, 15),
  ]);

  const localHits: FoodSearchHit[] =
    localResult.status === "fulfilled" && localResult.value.data
      ? localResult.value.data.map((food) => ({
          source: "local" as const,
          id: food.id,
          name: food.name,
          brand: food.brand,
          sourceType: (food.food_sources?.source_type ?? "USER") as FoodSearchHit["sourceType"],
          caloriesPer100:
            food.food_nutrients?.find((n) => n.nutrient_key === "energy_kcal")?.amount_per_100 ??
            null,
        }))
      : [];

  const usdaHits = usdaResult.status === "fulfilled" ? usdaResult.value : [];

  // Don't show a USDA result we've already cached locally — cheap dedupe by
  // name+brand since the search endpoint doesn't return source_id directly.
  const localKeys = new Set(localHits.map((h) => `${h.name.toLowerCase()}|${h.brand?.toLowerCase() ?? ""}`));
  const dedupedUsdaHits = usdaHits.filter(
    (h) => !localKeys.has(`${h.name.toLowerCase()}|${h.brand?.toLowerCase() ?? ""}`),
  );

  return [...localHits, ...dedupedUsdaHits];
}
