"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getFoodForLogging,
  logFood,
  toggleFavorite,
  type FoodForLogging,
} from "@/lib/actions/food";
import type { ActionState } from "@/lib/actions/auth";
import { scaleNutrients } from "@/lib/nutrition/calculate";
import { convertToBasisUnit, UNIVERSAL_MASS_UNITS, UNIVERSAL_VOLUME_UNITS } from "@/lib/nutrition/units";
import type { FoodSearchHit } from "@/lib/foods/types";

const MEAL_OPTIONS = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
  { value: "snack", label: "Snack" },
] as const;

const initialState: ActionState = { error: null };

export function LogFoodDialog({ hit, onClose }: { hit: FoodSearchHit; onClose: () => void }) {
  const [food, setFood] = useState<FoodForLogging | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [favorited, setFavorited] = useState(false);
  const [selection, setSelection] = useState<string>(""); // "serving:<id>" or "unit:<unit>"
  const [quantity, setQuantity] = useState("1");
  const [mealCategory, setMealCategory] = useState<string>("snack");

  const [state, formAction, pending] = useActionState(logFood, initialState);

  useEffect(() => {
    if (state.success) {
      toast.success(`${food?.name ?? "Food"} logged`);
      onClose();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  useEffect(() => {
    let cancelled = false;
    getFoodForLogging(hit.source, hit.id).then((result) => {
      if (cancelled) return;
      if ("error" in result) {
        setLoadError(result.error);
        return;
      }
      setFood(result);
      const defaultServing = result.servings.find((s) => s.isDefault) ?? result.servings[0];
      setSelection(defaultServing ? `serving:${defaultServing.id}` : `unit:${result.basisUnit}`);
    });
    return () => {
      cancelled = true;
    };
  }, [hit]);

  const universalUnits = food?.basisUnit === "ml" ? UNIVERSAL_VOLUME_UNITS : UNIVERSAL_MASS_UNITS;

  const preview = useMemo(() => {
    if (!food) return null;
    const qty = Number(quantity);
    if (!qty || qty <= 0) return null;

    let grams: number | null = null;
    if (selection.startsWith("serving:")) {
      const servingId = selection.slice("serving:".length);
      const serving = food.servings.find((s) => s.id === servingId);
      grams = serving ? serving.gramsEquivalent * qty : null;
    } else if (selection.startsWith("unit:")) {
      const unit = selection.slice("unit:".length);
      grams = convertToBasisUnit(qty, unit, food.basisUnit);
    }
    if (!grams) return null;
    return scaleNutrients(food.nutrientsPer100, grams);
  }, [food, quantity, selection]);

  const handleFavorite = async () => {
    if (!food) return;
    const result = await toggleFavorite(food.foodId);
    if (!result.error) setFavorited(result.favorited);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          {/* pr-8 clears the DialogContent close button, which is
              absolutely positioned at top-2 right-2 and would otherwise
              overlap this row's own trailing button. */}
          <div className="flex items-start justify-between gap-2 pr-8">
            <DialogTitle>{food?.name ?? hit.name}</DialogTitle>
            {food && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleFavorite}
                aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={favorited ? "size-4 fill-primary text-primary" : "size-4"} />
              </Button>
            )}
          </div>
          {food?.brand && <p className="text-sm text-muted-foreground">{food.brand}</p>}
        </DialogHeader>

        {loadError ? (
          <p className="py-6 text-center text-sm text-destructive">{loadError}</p>
        ) : !food ? (
          <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading nutrition details…
          </div>
        ) : (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="source" value="local" />
            <input type="hidden" name="sourceId" value={food.foodId} />
            {selection.startsWith("serving:") && (
              <input type="hidden" name="servingId" value={selection.slice("serving:".length)} />
            )}
            <input
              type="hidden"
              name="unit"
              value={
                selection.startsWith("unit:")
                  ? selection.slice("unit:".length)
                  : (food.servings.find((s) => `serving:${s.id}` === selection)?.unit ?? "serving")
              }
            />

            <div className="grid grid-cols-[1fr_auto] gap-2">
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min={0}
                  step={0.1}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="serving">Serving</Label>
                <select
                  id="serving"
                  value={selection}
                  onChange={(e) => setSelection(e.target.value)}
                  className="h-9 rounded-md border border-input bg-transparent px-2 text-sm"
                >
                  {food.servings.map((s) => (
                    <option key={s.id} value={`serving:${s.id}`}>
                      {s.label ?? `${s.quantity} ${s.unit}`}
                    </option>
                  ))}
                  {universalUnits.map((u) => (
                    <option key={u} value={`unit:${u}`}>
                      {u}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mealCategory">Meal</Label>
              <select
                id="mealCategory"
                name="mealCategory"
                value={mealCategory}
                onChange={(e) => setMealCategory(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-transparent px-2 text-sm"
              >
                {MEAL_OPTIONS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            {preview && (
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium tabular-nums">
                  {Math.round(preview.energy_kcal ?? 0)} kcal
                </p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {preview.protein_g != null && `${Math.round(preview.protein_g)}g protein`}
                  {preview.carbohydrate_g != null && ` · ${Math.round(preview.carbohydrate_g)}g carbs`}
                  {preview.fat_g != null && ` · ${Math.round(preview.fat_g)}g fat`}
                </p>
              </div>
            )}

            {state.error && (
              <p role="alert" className="text-sm text-destructive">
                {state.error}
              </p>
            )}

            <DialogFooter>
              <Button type="submit" disabled={pending || !preview}>
                {pending ? "Logging…" : "Log food"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
