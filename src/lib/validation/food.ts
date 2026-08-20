import { z } from "zod";

export const mealCategorySchema = z.enum(["breakfast", "lunch", "dinner", "snack"]);

export const foodHitSchema = z.object({
  source: z.enum(["local", "usda"]),
  id: z.string().min(1),
});

export const logFoodSchema = z.object({
  source: z.enum(["local", "usda"]),
  sourceId: z.string().min(1),
  mealCategory: mealCategorySchema,
  quantity: z.coerce.number().gt(0),
  unit: z.string().min(1),
  servingId: z.string().optional(),
  note: z.string().max(280).optional(),
});

export const quickAddSchema = z.object({
  mealCategory: mealCategorySchema,
  description: z.string().min(1).max(100),
  calories: z.coerce.number().min(0),
  proteinG: z.union([z.literal(""), z.coerce.number().min(0)]).transform((v) => (v === "" ? null : v)),
  carbsG: z.union([z.literal(""), z.coerce.number().min(0)]).transform((v) => (v === "" ? null : v)),
  fatG: z.union([z.literal(""), z.coerce.number().min(0)]).transform((v) => (v === "" ? null : v)),
});

export const toggleFavoriteSchema = z.object({
  foodId: z.string().uuid(),
});
