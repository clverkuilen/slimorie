// USDA FoodData Central nutrient.id -> our nutrients.key. Verified against
// live API responses (both Branded and SR Legacy/Foundation food types),
// not guessed from memory — see food/{fdcId} responses for 2187885 and
// 174608 during development.
export const USDA_NUTRIENT_MAP: Record<number, string> = {
  1008: "energy_kcal",
  1003: "protein_g",
  1005: "carbohydrate_g",
  1004: "fat_g",
  1079: "fiber_g",
  2000: "sugar_g", // "Total Sugars" — current USDA convention
  1063: "sugar_g", // "Sugars, total" — older records use this id instead
  1235: "added_sugar_g",
  1258: "saturated_fat_g",
  1257: "trans_fat_g",
  1093: "sodium_mg",
  1253: "cholesterol_mg",
  1092: "potassium_mg",
  1087: "calcium_mg",
  1089: "iron_mg",
  1114: "vitamin_d_mcg",
};
