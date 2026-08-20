import "server-only";
import { createServiceRoleClient } from "@/lib/supabase/service";
import type { NormalizedFood } from "@/lib/foods/types";

// Upserts a normalized external food into foods/food_sources/food_servings/
// food_nutrients, keyed on (source_type, source_id) so re-importing the same
// USDA/OFF item is idempotent rather than creating duplicates (spec section
// 44 — dedupe on source id). Returns our internal foods.id.
//
// System-owned foods (owner_user_id = null) can't be written by a regular
// user session — Phase 1's RLS policy only allows a user to insert foods
// they own themselves, deliberately, so a client can't inject data that
// masquerades as verified USDA/OFF data. This is the one narrow path that's
// allowed to bypass that, and it must only ever be called with data this
// server code fetched itself from the actual external API — never with
// caller-supplied fields.
export async function upsertNormalizedFood(food: NormalizedFood): Promise<string> {
  const supabase = createServiceRoleClient();
  const { data: existingSource } = await supabase
    .from("food_sources")
    .select("food_id")
    .eq("source_type", food.sourceType)
    .eq("source_id", food.sourceId)
    .maybeSingle();

  if (existingSource) {
    return existingSource.food_id;
  }

  const { data: insertedFood, error: foodError } = await supabase
    .from("foods")
    .insert({
      owner_user_id: null,
      name: food.name,
      brand: food.brand,
      description: food.description,
      barcode: food.barcode,
      basis_unit: food.basisUnit,
      ingredients_text: food.ingredientsText,
    })
    .select("id")
    .single();

  if (foodError || !insertedFood) {
    throw new Error(`Failed to insert food: ${foodError?.message}`);
  }

  const foodId = insertedFood.id;

  const { error: sourceError } = await supabase.from("food_sources").insert({
    food_id: foodId,
    source_type: food.sourceType,
    source_id: food.sourceId,
    source_url: food.sourceUrl,
    source_last_updated: food.sourceLastUpdated,
  });
  if (sourceError) throw new Error(`Failed to insert food_source: ${sourceError.message}`);

  const nutrientRows = Object.entries(food.nutrientsPer100).map(([nutrientKey, amount]) => ({
    food_id: foodId,
    nutrient_key: nutrientKey,
    amount_per_100: amount,
  }));
  if (nutrientRows.length > 0) {
    const { error: nutrientError } = await supabase.from("food_nutrients").insert(nutrientRows);
    if (nutrientError) throw new Error(`Failed to insert food_nutrients: ${nutrientError.message}`);
  }

  if (food.servings.length > 0) {
    const { error: servingError } = await supabase.from("food_servings").insert(
      food.servings.map((serving) => ({
        food_id: foodId,
        unit: serving.unit,
        label: serving.label,
        quantity: serving.quantity,
        grams_equivalent: serving.gramsEquivalent,
        is_default: serving.isDefault,
      })),
    );
    if (servingError) throw new Error(`Failed to insert food_servings: ${servingError.message}`);
  }

  return foodId;
}
