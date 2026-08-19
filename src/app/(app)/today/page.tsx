import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Plus, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NutrientProgress } from "@/components/nutrition/nutrient-progress";
import { getTodayDashboardData } from "@/lib/data/today";
import { createClient } from "@/lib/supabase/server";
import { formatLongDate } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Today — Slimorie" };

const MEAL_LABELS = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
  snack: "Snacks",
} as const;

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone, weight_unit_pref")
    .eq("id", user.id)
    .single();

  const timezone = profile?.timezone ?? "UTC";
  const { logDate, goal, summary, mealTotals, entries, loggingStreak, weightEntry } =
    await getTodayDashboardData(supabase, user.id, timezone);

  const calories = summary?.calories ?? 0;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">{formatLongDate(logDate, timezone)}</h1>

      {!goal ? (
        <Card className="border-primary/30 bg-accent/40">
          <CardContent className="flex flex-col items-start gap-3 py-6">
            <p className="text-sm text-accent-foreground">
              Set a calorie and macro goal to start tracking your progress toward it.
            </p>
            <Button render={<Link href="/settings/goals" />} nativeButton={false} size="sm">
              Set your goals
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium text-muted-foreground">
              Today&apos;s Calories
            </CardTitle>
            <p className="text-3xl font-semibold tabular-nums">
              {Math.round(calories).toLocaleString()}{" "}
              <span className="text-lg font-normal text-muted-foreground">
                / {Math.round(goal.calorie_goal).toLocaleString()} kcal
              </span>
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <NutrientProgress label="Calories" consumed={calories} goal={goal.calorie_goal} unit="kcal" />
            <NutrientProgress
              label="Protein"
              consumed={summary?.protein_g ?? 0}
              goal={goal.protein_g_goal}
              unit="g"
            />
            <NutrientProgress
              label="Carbohydrates"
              consumed={summary?.carbs_g ?? 0}
              goal={goal.carbs_g_goal}
              unit="g"
            />
            <NutrientProgress label="Fat" consumed={summary?.fat_g ?? 0} goal={goal.fat_g_goal} unit="g" />
            <NutrientProgress
              label="Fiber"
              consumed={summary?.fiber_g ?? 0}
              goal={goal.fiber_g_goal}
              unit="g"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3 py-6">
          {entries.length === 0 ? (
            <div className="space-y-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">No foods logged yet today.</p>
              <p className="text-xs text-muted-foreground">
                Start by adding your first meal below.
              </p>
            </div>
          ) : (
            (Object.keys(MEAL_LABELS) as (keyof typeof MEAL_LABELS)[]).map((category) => (
              <div key={category} className="flex items-center justify-between text-sm">
                <span className="font-medium">{MEAL_LABELS[category]}</span>
                <span className="tabular-nums text-muted-foreground">
                  {Math.round(mealTotals[category])} kcal
                </span>
              </div>
            ))
          )}
          <Button
            render={<Link href="/food" />}
            nativeButton={false}
            className="w-full"
            size="lg"
          >
            <Plus className="size-4" /> Log Food
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Flame className="size-6 text-primary" aria-hidden="true" />
            <div>
              <p className="text-lg font-semibold leading-none">{loggingStreak}</p>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 py-5">
            <Scale className="size-6 text-primary" aria-hidden="true" />
            <div>
              <p className="text-lg font-semibold leading-none">
                {weightEntry ? `${weightEntry.weight} ${weightEntry.unit}` : "—"}
              </p>
              <p className="text-xs text-muted-foreground">
                {weightEntry ? "latest weight" : "no weight logged"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
