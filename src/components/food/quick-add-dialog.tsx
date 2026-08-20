"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { quickAdd } from "@/lib/actions/food";
import type { ActionState } from "@/lib/actions/auth";

const MEAL_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
] as const;

const initialState: ActionState = { error: null };

export function QuickAddDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(quickAdd, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success("Logged.");
      onOpenChange(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Quick calorie entry</DialogTitle>
          <DialogDescription>
            For when you know the calories but don&apos;t have food-level data.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">What did you eat?</Label>
            <Input id="description" name="description" required maxLength={100} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="calories">Calories</Label>
            <Input id="calories" name="calories" type="number" min={0} step={1} required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="proteinG">Protein (g)</Label>
              <Input id="proteinG" name="proteinG" type="number" min={0} step={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carbsG">Carbs (g)</Label>
              <Input id="carbsG" name="carbsG" type="number" min={0} step={1} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fatG">Fat (g)</Label>
              <Input id="fatG" name="fatG" type="number" min={0} step={1} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mealCategory">Meal</Label>
            <select
              id="mealCategory"
              name="mealCategory"
              defaultValue="snack"
              className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
            >
              {MEAL_OPTIONS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>
          {state.error && (
            <p role="alert" className="text-sm text-destructive">
              {state.error}
            </p>
          )}
          <DialogFooter>
            <Button type="submit" disabled={pending}>
              {pending ? "Adding…" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
