import type { Metadata } from "next";
import { CalendarDays } from "lucide-react";
import { ComingSoon } from "@/components/layout/coming-soon";

export const metadata: Metadata = { title: "History — Macroloom" };

export default function HistoryPage() {
  return (
    <ComingSoon
      icon={CalendarDays}
      title="History is on the way"
      description="A calendar view of your logging activity, with day-by-day diary detail, is coming in the next build."
    />
  );
}
