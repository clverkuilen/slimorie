import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CtaBand } from "@/components/marketing/cta-band";
import { FeatureGrid } from "@/components/marketing/feature-grid";
import { Hero } from "@/components/marketing/hero";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Slimorie — Fast, honest calorie tracking",
  description:
    "Open the app, log food, get on with your day. A fast calorie and nutrition tracker with real nutrition data and streaks that don't punish you.",
};

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/today");

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingHeader />
      <main className="flex-1">
        <Hero />
        <FeatureGrid />
        <CtaBand />
      </main>
      <MarketingFooter />
    </div>
  );
}
