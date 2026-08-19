import { z } from "zod";

export const weightEntrySchema = z.object({
  weight: z.coerce.number().gt(0, "Weight must be greater than 0."),
  unit: z.enum(["lb", "kg"]),
  note: z.string().max(280).optional(),
});
