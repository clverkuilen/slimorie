import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import { userLocalDateString } from "@/lib/utils/date";

const MEAL_CATEGORIES = ["breakfast", "lunch", "dinner", "snack"] as const;
export type MealCategory = (typeof MEAL_CATEGORIES)[number];

export interface TodayDashboardData {
  logDate: string;
  goal: Database["public"]["Tables"]["goals"]["Row"] | null;
  summary: Database["public"]["Tables"]["daily_summaries"]["Row"] | null;
  mealTotals: Record<MealCategory, number>;
  entries: Database["public"]["Tables"]["food_log_entries"]["Row"][];
  loggingStreak: number;
  weightEntry: Database["public"]["Tables"]["weight_entries"]["Row"] | null;
}

export async function getTodayDashboardData(
  supabase: SupabaseClient<Database>,
  userId: string,
  timezone: string,
): Promise<TodayDashboardData> {
  const logDate = userLocalDateString(timezone);

  const [goalResult, summaryResult, entriesResult, streakResult, weightResult] =
    await Promise.all([
      supabase
        .from("goals")
        .select("*")
        .eq("user_id", userId)
        .lte("effective_date", logDate)
        .order("effective_date", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("daily_summaries")
        .select("*")
        .eq("user_id", userId)
        .eq("log_date", logDate)
        .maybeSingle(),
      supabase
        .from("food_log_entries")
        .select("*")
        .eq("user_id", userId)
        .eq("log_date", logDate)
        .order("logged_at", { ascending: true }),
      supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .eq("streak_type", "logging")
        .maybeSingle(),
      supabase
        .from("weight_entries")
        .select("*")
        .eq("user_id", userId)
        .order("logged_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

  const entries = entriesResult.data ?? [];
  const mealTotals = MEAL_CATEGORIES.reduce(
    (acc, category) => {
      acc[category] = entries
        .filter((entry) => entry.meal_category === category)
        .reduce((sum, entry) => {
          const snapshot = entry.nutrition_snapshot as Record<string, number> | null;
          return sum + (snapshot?.energy_kcal ?? 0);
        }, 0);
      return acc;
    },
    {} as Record<MealCategory, number>,
  );

  return {
    logDate,
    goal: goalResult.data,
    summary: summaryResult.data,
    mealTotals,
    entries,
    loggingStreak: streakResult.data?.current_count ?? 0,
    weightEntry: weightResult.data,
  };
}
