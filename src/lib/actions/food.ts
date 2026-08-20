"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUsdaFoodDetails } from "@/lib/foods/usda";
import { upsertNormalizedFood } from "@/lib/foods/ingest";
import { convertToBasisUnit } from "@/lib/nutrition/units";
import { scaleNutrients } from "@/lib/nutrition/calculate";
import { userLocalDateString } from "@/lib/utils/date";
import { logFoodSchema, quickAddSchema, toggleFavoriteSchema } from "@/lib/validation/food";
import type { ActionState } from "@/lib/actions/auth";

export interface FoodForLogging {
  foodId: string;
  name: string;
  brand: string | null;
  basisUnit: "g" | "ml";
  sourceType: string;
  nutrientsPer100: Record<string, number>;
  servings: {
    id: string;
    unit: string;
    label: string | null;
    quantity: number;
    gramsEquivalent: number;
    isDefault: boolean;
  }[];
}

// Resolves a search hit into a food that's guaranteed to exist in our DB —
// importing it from USDA first if this is the first time anyone's logged
// it. Called when the user taps a search result, not on every keystroke.
export async function getFoodForLogging(
  source: "local" | "usda",
  id: string,
): Promise<FoodForLogging | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  let foodId = id;

  if (source === "usda") {
    try {
      const normalized = await getUsdaFoodDetails(id);
      foodId = await upsertNormalizedFood(normalized);
    } catch (error) {
      console.error("Failed to import USDA food:", error);
      return { error: "Couldn't load that food's details. Try again." };
    }
  }

  const { data: food, error: foodError } = await supabase
    .from("foods")
    .select(
      "id, name, brand, basis_unit, food_sources(source_type), food_nutrients(nutrient_key, amount_per_100), food_servings(id, unit, label, quantity, grams_equivalent, is_default)",
    )
    .eq("id", foodId)
    .maybeSingle();

  if (foodError || !food) return { error: "Couldn't load that food." };

  const nutrientsPer100: Record<string, number> = {};
  for (const n of food.food_nutrients ?? []) {
    nutrientsPer100[n.nutrient_key] = n.amount_per_100;
  }

  return {
    foodId: food.id,
    name: food.name,
    brand: food.brand,
    basisUnit: food.basis_unit as "g" | "ml",
    sourceType: food.food_sources?.source_type ?? "USER",
    nutrientsPer100,
    servings: (food.food_servings ?? []).map((s) => ({
      id: s.id,
      unit: s.unit,
      label: s.label,
      quantity: s.quantity,
      gramsEquivalent: s.grams_equivalent,
      isDefault: s.is_default,
    })),
  };
}

export async function logFood(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = logFoodSchema.safeParse({
    source: formData.get("source"),
    sourceId: formData.get("sourceId"),
    mealCategory: formData.get("mealCategory"),
    quantity: formData.get("quantity"),
    unit: formData.get("unit"),
    servingId: formData.get("servingId") || undefined,
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const food = await getFoodForLogging(parsed.data.source, parsed.data.sourceId);
  if ("error" in food) return { error: food.error };

  let gramsEquivalent: number | null = null;
  if (parsed.data.servingId) {
    const serving = food.servings.find((s) => s.id === parsed.data.servingId);
    if (!serving) return { error: "That serving is no longer available." };
    gramsEquivalent = serving.gramsEquivalent * parsed.data.quantity;
  } else {
    gramsEquivalent = convertToBasisUnit(parsed.data.quantity, parsed.data.unit, food.basisUnit);
  }
  if (!gramsEquivalent || gramsEquivalent <= 0) {
    return { error: "Couldn't figure out that quantity. Try a different unit." };
  }

  const nutritionSnapshot = scaleNutrients(food.nutrientsPer100, gramsEquivalent);
  const logDate = userLocalDateString(profile?.timezone ?? "UTC");

  const { data: entry, error: insertError } = await supabase
    .from("food_log_entries")
    .insert({
      user_id: user.id,
      food_id: food.foodId,
      meal_category: parsed.data.mealCategory,
      log_date: logDate,
      food_name_snapshot: food.name,
      brand_snapshot: food.brand,
      source_type_snapshot: food.sourceType,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      grams_equivalent: gramsEquivalent,
      nutrition_snapshot: nutritionSnapshot,
      note: parsed.data.note ?? null,
    })
    .select("id")
    .single();

  if (insertError || !entry) return { error: "Couldn't save that entry. Try again." };

  const { data: rule } = await supabase
    .from("xp_rules")
    .select("xp_amount")
    .eq("action_key", "log_meal")
    .single();
  if (rule) {
    await supabase.from("xp_events").insert({
      user_id: user.id,
      action_key: "log_meal",
      xp_amount: rule.xp_amount,
      related_entity_type: "food_log_entries",
      related_entity_id: entry.id,
    });
  }

  revalidatePath("/today");
  revalidatePath("/food");
  return { error: null, success: "Logged." };
}

export async function quickAdd(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = quickAddSchema.safeParse({
    mealCategory: formData.get("mealCategory"),
    description: formData.get("description"),
    calories: formData.get("calories"),
    proteinG: formData.get("proteinG"),
    carbsG: formData.get("carbsG"),
    fatG: formData.get("fatG"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();
  const logDate = userLocalDateString(profile?.timezone ?? "UTC");

  const nutritionSnapshot: Record<string, number> = { energy_kcal: parsed.data.calories };
  if (parsed.data.proteinG !== null) nutritionSnapshot.protein_g = parsed.data.proteinG;
  if (parsed.data.carbsG !== null) nutritionSnapshot.carbohydrate_g = parsed.data.carbsG;
  if (parsed.data.fatG !== null) nutritionSnapshot.fat_g = parsed.data.fatG;

  const { data: entry, error } = await supabase
    .from("food_log_entries")
    .insert({
      user_id: user.id,
      food_id: null,
      meal_category: parsed.data.mealCategory,
      log_date: logDate,
      food_name_snapshot: parsed.data.description,
      brand_snapshot: null,
      source_type_snapshot: null,
      // Quick-add has no meaningful serving/unit — 1 "entry" is a fixed
      // convention so the not-null/positive schema constraints still hold.
      quantity: 1,
      unit: "entry",
      grams_equivalent: 1,
      nutrition_snapshot: nutritionSnapshot,
    })
    .select("id")
    .single();

  if (error || !entry) return { error: "Couldn't save that entry. Try again." };

  const { data: rule } = await supabase
    .from("xp_rules")
    .select("xp_amount")
    .eq("action_key", "log_meal")
    .single();
  if (rule) {
    await supabase.from("xp_events").insert({
      user_id: user.id,
      action_key: "log_meal",
      xp_amount: rule.xp_amount,
      related_entity_type: "food_log_entries",
      related_entity_id: entry.id,
    });
  }

  revalidatePath("/today");
  return { error: null, success: "Logged." };
}

export async function toggleFavorite(foodId: string): Promise<{ favorited: boolean; error?: string }> {
  const parsed = toggleFavoriteSchema.safeParse({ foodId });
  if (!parsed.success) return { favorited: false, error: "Invalid food." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { favorited: false, error: "You must be signed in." };

  const { data: existing } = await supabase
    .from("favorite_foods")
    .select("id")
    .eq("user_id", user.id)
    .eq("food_id", foodId)
    .maybeSingle();

  if (existing) {
    await supabase.from("favorite_foods").delete().eq("id", existing.id);
    revalidatePath("/food");
    return { favorited: false };
  }

  await supabase.from("favorite_foods").insert({ user_id: user.id, food_id: foodId });
  revalidatePath("/food");
  return { favorited: true };
}
