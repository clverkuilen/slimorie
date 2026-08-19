"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { saveGoals } from "@/lib/actions/goals";
import type { ActionState } from "@/lib/actions/auth";
import type { Database } from "@/types/database";

const initialState: ActionState = { error: null };

export function GoalsForm({ goal }: { goal: Database["public"]["Tables"]["goals"]["Row"] | null }) {
  const [state, formAction, pending] = useActionState(saveGoals, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="calorie_goal">Daily calorie goal</Label>
        <Input
          id="calorie_goal"
          name="calorie_goal"
          type="number"
          min={0}
          step={1}
          defaultValue={goal?.calorie_goal ?? ""}
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="protein_g_goal">Protein (g)</Label>
          <Input
            id="protein_g_goal"
            name="protein_g_goal"
            type="number"
            min={0}
            step={1}
            defaultValue={goal?.protein_g_goal ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="carbs_g_goal">Carbs (g)</Label>
          <Input
            id="carbs_g_goal"
            name="carbs_g_goal"
            type="number"
            min={0}
            step={1}
            defaultValue={goal?.carbs_g_goal ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fat_g_goal">Fat (g)</Label>
          <Input
            id="fat_g_goal"
            name="fat_g_goal"
            type="number"
            min={0}
            step={1}
            defaultValue={goal?.fat_g_goal ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="fiber_g_goal">Fiber (g)</Label>
          <Input
            id="fiber_g_goal"
            name="fiber_g_goal"
            type="number"
            min={0}
            step={1}
            defaultValue={goal?.fiber_g_goal ?? ""}
          />
        </div>
      </div>
      {state.error ? (
        <p role="alert" className="text-sm text-destructive">
          {state.error}
        </p>
      ) : null}
      {state.success ? <p className="text-sm text-muted-foreground">{state.success}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save goals"}
      </Button>
    </form>
  );
}
