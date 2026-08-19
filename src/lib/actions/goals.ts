"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { userLocalDateString } from "@/lib/utils/date";
import { goalsSchema } from "@/lib/validation/goals";
import type { ActionState } from "@/lib/actions/auth";

export async function saveGoals(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = goalsSchema.safeParse({
    calorie_goal: formData.get("calorie_goal"),
    protein_g_goal: formData.get("protein_g_goal"),
    carbs_g_goal: formData.get("carbs_g_goal"),
    fat_g_goal: formData.get("fat_g_goal"),
    fiber_g_goal: formData.get("fiber_g_goal"),
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

  const effectiveDate = userLocalDateString(profile?.timezone ?? "UTC");

  const { error } = await supabase
    .from("goals")
    .upsert(
      { user_id: user.id, effective_date: effectiveDate, ...parsed.data },
      { onConflict: "user_id,effective_date" },
    );
  if (error) return { error: "Couldn't save your goals. Try again." };

  revalidatePath("/today");
  revalidatePath("/settings/goals");
  return { error: null, success: "Goals saved." };
}
