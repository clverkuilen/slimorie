"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { weightEntrySchema } from "@/lib/validation/weight";
import type { ActionState } from "@/lib/actions/auth";

export async function logWeight(_prevState: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = weightEntrySchema.safeParse({
    weight: formData.get("weight"),
    unit: formData.get("unit"),
    note: formData.get("note") || undefined,
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Invalid input." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { data: rule } = await supabase
    .from("xp_rules")
    .select("xp_amount")
    .eq("action_key", "log_weight")
    .single();

  const { data: entry, error } = await supabase
    .from("weight_entries")
    .insert({
      user_id: user.id,
      weight: parsed.data.weight,
      unit: parsed.data.unit,
      note: parsed.data.note ?? null,
    })
    .select("id")
    .single();
  if (error || !entry) return { error: "Couldn't save your weight. Try again." };

  // Keyed on the new row's own id, so re-editing this same entry later can't
  // re-trigger XP (the entity-scoped dedup index in migration 0010 enforces this).
  if (rule) {
    const { error: xpError } = await supabase.from("xp_events").insert({
      user_id: user.id,
      action_key: "log_weight",
      xp_amount: rule.xp_amount,
      related_entity_type: "weight_entries",
      related_entity_id: entry.id,
    });
    void xpError; // weight XP is best-effort; a failed insert just means no XP this time
  }

  revalidatePath("/progress");
  revalidatePath("/today");
  return { error: null, success: "Weight logged." };
}
