import type { Metadata } from "next";
import { UtensilsCrossed } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "Food — Slimorie" };

export default function FoodPage() {
  return (
    <ComingSoon
      icon={UtensilsCrossed}
      title="Food search is on the way"
      description="Searching USDA and Open Food Facts, scanning barcodes, and logging to a meal are coming in the next build."
    />
  );
}
