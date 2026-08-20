"use client";

import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FoodResultRow } from "@/components/food/food-result-row";
import { LogFoodDialog } from "@/components/food/log-food-dialog";
import { QuickAddDialog } from "@/components/food/quick-add-dialog";
import type { FoodSearchHit } from "@/lib/foods/types";
import type { RecentOrFavoriteFood } from "@/lib/foods/search";

export function FoodSearchClient({
  recent,
  favorites,
}: {
  recent: RecentOrFavoriteFood[];
  favorites: RecentOrFavoriteFood[];
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodSearchHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedHit, setSelectedHit] = useState<FoodSearchHit | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const trimmedQuery = query.trim();

  useEffect(() => {
    // Below the 2-char threshold the results section isn't rendered at all
    // (see showingSearch below), so stale results/error just sit unused —
    // no need to clear them here.
    if (trimmedQuery.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      fetch(`/api/foods/search?q=${encodeURIComponent(trimmedQuery)}`, {
        signal: controller.signal,
      })
        .then((res) => res.json())
        .then((data) => {
          setResults(data.hits ?? []);
          setError(data.error ?? null);
        })
        .catch((err) => {
          if (err.name !== "AbortError") {
            setError("We couldn't load food results right now.");
          }
        })
        .finally(() => setLoading(false));
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  const recentHits: FoodSearchHit[] = useMemo(
    () =>
      recent.map((f) => ({
        source: "local" as const,
        id: f.foodId,
        name: f.name,
        brand: f.brand,
        sourceType: f.sourceType,
        caloriesPer100: f.caloriesPer100,
      })),
    [recent],
  );
  const favoriteHits: FoodSearchHit[] = useMemo(
    () =>
      favorites.map((f) => ({
        source: "local" as const,
        id: f.foodId,
        name: f.name,
        brand: f.brand,
        sourceType: f.sourceType,
        caloriesPer100: f.caloriesPer100,
      })),
    [favorites],
  );

  const showingSearch = trimmedQuery.length >= 2;

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods…"
          className="pl-9"
          aria-label="Search foods"
        />
      </div>

      <Button variant="outline" className="w-full" onClick={() => setQuickAddOpen(true)}>
        <Plus className="size-4" /> Quick calorie entry
      </Button>

      {showingSearch ? (
        <section className="space-y-2">
          <h2 className="font-heading text-sm font-medium text-muted-foreground">
            Search results
          </h2>
          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              Searching…
            </div>
          ) : error ? (
            <p className="py-8 text-center text-sm text-muted-foreground">{error}</p>
          ) : results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No foods found for &ldquo;{trimmedQuery}&rdquo;.
            </p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {results.map((hit) => (
                <FoodResultRow key={`${hit.source}-${hit.id}`} hit={hit} onSelect={setSelectedHit} />
              ))}
            </ul>
          )}
        </section>
      ) : (
        <>
          {favoriteHits.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-heading text-sm font-medium text-muted-foreground">Favorites</h2>
              <ul className="divide-y rounded-lg border">
                {favoriteHits.map((hit) => (
                  <FoodResultRow key={`fav-${hit.id}`} hit={hit} onSelect={setSelectedHit} />
                ))}
              </ul>
            </section>
          )}
          <section className="space-y-2">
            <h2 className="font-heading text-sm font-medium text-muted-foreground">Recent</h2>
            {recentHits.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Foods you log will show up here for quick re-logging.
              </p>
            ) : (
              <ul className="divide-y rounded-lg border">
                {recentHits.map((hit) => (
                  <FoodResultRow key={`recent-${hit.id}`} hit={hit} onSelect={setSelectedHit} />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {selectedHit && (
        <LogFoodDialog
          key={`${selectedHit.source}-${selectedHit.id}`}
          hit={selectedHit}
          onClose={() => setSelectedHit(null)}
        />
      )}
      <QuickAddDialog open={quickAddOpen} onOpenChange={setQuickAddOpen} />
    </div>
  );
}
