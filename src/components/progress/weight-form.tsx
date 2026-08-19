"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logWeight } from "@/lib/actions/weight";
import type { ActionState } from "@/lib/actions/auth";

const initialState: ActionState = { error: null };

export function WeightForm({ defaultUnit }: { defaultUnit: "lb" | "kg" }) {
  const [state, formAction, pending] = useActionState(logWeight, initialState);

  return (
    <form action={formAction} className="flex items-end gap-3">
      <div className="space-y-2">
        <Label htmlFor="weight">Weight</Label>
        <div className="flex items-center gap-2">
          <Input id="weight" name="weight" type="number" min={0} step={0.1} className="w-24" required />
          <select
            name="unit"
            defaultValue={defaultUnit}
            className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
            aria-label="Unit"
          >
            <option value="lb">lb</option>
            <option value="kg">kg</option>
          </select>
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Log weight"}
      </Button>
      {state.error ? <p className="text-sm text-destructive">{state.error}</p> : null}
    </form>
  );
}
