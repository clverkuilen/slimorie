import { z } from "zod";

const optionalPositive = z
  .union([z.literal(""), z.coerce.number().min(0)])
  .transform((value) => (value === "" ? null : value));

export const goalsSchema = z.object({
  calorie_goal: z.coerce.number().min(0),
  protein_g_goal: optionalPositive,
  carbs_g_goal: optionalPositive,
  fat_g_goal: optionalPositive,
  fiber_g_goal: optionalPositive,
});
