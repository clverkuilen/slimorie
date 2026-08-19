import type { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GoalsForm } from "@/components/settings/goals-form";
import { createClient } from "@/lib/supabase/server";
import { userLocalDateString } from "@/lib/utils/date";

export const metadata: Metadata = { title: "Goals — Slimorie" };

export default async function GoalsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", user.id)
    .single();

  const { data: goal } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .lte("effective_date", userLocalDateString(profile?.timezone ?? "UTC"))
    .order("effective_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>Daily goals</CardTitle>
          <CardDescription>
            Only calories are required. Leave a macro blank to track it without a target.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoalsForm goal={goal} />
        </CardContent>
      </Card>
    </div>
  );
}
