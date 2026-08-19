import type { Metadata } from "next";
import { LineChart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WeightForm } from "@/components/progress/weight-form";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Progress — Macroloom" };

export default async function ProgressPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("weight_unit_pref")
    .eq("id", user.id)
    .single();

  const { data: entries } = await supabase
    .from("weight_entries")
    .select("*")
    .eq("user_id", user.id)
    .order("logged_at", { ascending: false })
    .limit(20);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">Progress</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Log weight</CardTitle>
        </CardHeader>
        <CardContent>
          <WeightForm defaultUnit={(profile?.weight_unit_pref as "lb" | "kg") ?? "lb"} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent weigh-ins</CardTitle>
        </CardHeader>
        <CardContent>
          {!entries || entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No weight logged yet. Add your first entry above.
            </p>
          ) : (
            <ul className="divide-y">
              {entries.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between py-2 text-sm">
                  <span>{new Date(entry.logged_at).toLocaleDateString()}</span>
                  <span className="tabular-nums font-medium">
                    {entry.weight} {entry.unit}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center gap-2 py-8 text-center">
          <LineChart className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Weight and calorie trend charts are coming in the next build.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
