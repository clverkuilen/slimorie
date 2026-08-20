"use client";

import type { FoodSearchHit } from "@/lib/foods/types";

const SOURCE_LABELS: Record<FoodSearchHit["sourceType"], string> = {
  USDA: "USDA",
  OPEN_FOOD_FACTS: "Open Food Facts",
  USER: "Your food",
  MANUFACTURER: "Manufacturer",
  OTHER: "Other",
};

export function FoodResultRow({
  hit,
  onSelect,
}: {
  hit: FoodSearchHit;
  onSelect: (hit: FoodSearchHit) => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(hit)}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm hover:bg-accent/50"
      >
        <span className="min-w-0">
          <span className="block truncate font-medium">{hit.name}</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {hit.brand && <span className="truncate">{hit.brand}</span>}
            <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium tracking-wide uppercase">
              {SOURCE_LABELS[hit.sourceType]}
            </span>
          </span>
        </span>
        {hit.caloriesPer100 != null && (
          <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
            {Math.round(hit.caloriesPer100)} kcal/100g
          </span>
        )}
      </button>
    </li>
  );
}
