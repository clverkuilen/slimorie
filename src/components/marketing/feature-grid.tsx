import { BadgeCheck, Flame, Scale, Zap } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const FEATURES = [
  {
    icon: Zap,
    title: "Log in seconds",
    description:
      "Your recent and favorite foods sit right at the top, so eating the same breakfast twice means logging it twice as fast.",
    tint: "bg-primary/10 text-primary",
  },
  {
    icon: BadgeCheck,
    title: "Nutrition you can trust",
    description:
      "Every food carries its source — USDA, Open Food Facts, or your own entry — so you always know how solid the numbers are.",
    tint: "bg-palette-light-sea-green/15 text-primary",
  },
  {
    icon: Scale,
    title: "The full picture",
    description:
      "Calories, macros, and weight trends together, not scattered across three different screens.",
    tint: "bg-palette-amber-glow/20 text-warning-foreground",
  },
  {
    icon: Flame,
    title: "Streaks that don't punish you",
    description:
      "Light XP and streaks for showing up consistently — encouraging, never guilt-trippy.",
    tint: "bg-primary/10 text-primary",
  },
] as const;

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 md:py-28">
      <div className="mx-auto max-w-xl text-center">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-balance md:text-4xl">
          Built for people who just want to log their food
        </h2>
        <p className="mt-4 text-muted-foreground text-balance">
          Not another app that turns eating lunch into a chore.
        </p>
      </div>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {FEATURES.map(({ icon: Icon, title, description, tint }) => (
          <Card key={title}>
            <CardContent className="flex items-start gap-4">
              <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${tint}`}>
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="font-heading font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
