import type { Metadata } from "next";
import { getFavoriteFoods, getRecentFoods } from "@/lib/foods/search";
import { createClient } from "@/lib/supabase/server";
import { FoodSearchClient } from "@/components/food/food-search-client";

export const metadata: Metadata = { title: "Food — Slimorie" };

export default async function FoodPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [recent, favorites] = await Promise.all([
    getRecentFoods(supabase, user.id),
    getFavoriteFoods(supabase, user.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <FoodSearchClient recent={recent} favorites={favorites} />
    </div>
  );
}
