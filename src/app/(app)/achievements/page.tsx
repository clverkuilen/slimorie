import type { Metadata } from "next";
import { Award, Lock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Achievements — Macroloom" };

export default async function AchievementsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [{ data: achievements }, { data: unlocked }] = await Promise.all([
    supabase.from("achievements").select("*").order("sort_order"),
    supabase.from("user_achievements").select("achievement_id").eq("user_id", user.id),
  ]);

  const unlockedIds = new Set((unlocked ?? []).map((row) => row.achievement_id));

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-xl font-semibold tracking-tight">Achievements</h1>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {(achievements ?? []).map((achievement) => {
          const isUnlocked = unlockedIds.has(achievement.id);
          return (
            <Card key={achievement.id} className={cn(!isUnlocked && "opacity-60")}>
              <CardContent className="flex flex-col items-center gap-2 py-6 text-center">
                {isUnlocked ? (
                  <Award className="size-8 text-primary" aria-hidden="true" />
                ) : (
                  <Lock className="size-8 text-muted-foreground" aria-hidden="true" />
                )}
                <p className="text-sm font-medium">{achievement.name}</p>
                <p className="text-xs text-muted-foreground">{achievement.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
