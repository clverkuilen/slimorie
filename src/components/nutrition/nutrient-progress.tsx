import { Progress } from "@/components/ui/progress";

export function NutrientProgress({
  label,
  consumed,
  goal,
  unit,
}: {
  label: string;
  consumed: number;
  goal: number | null;
  unit: string;
}) {
  const percent = goal ? Math.min(100, Math.round((consumed / goal) * 100)) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">
          {Math.round(consumed)}
          {goal ? ` / ${Math.round(goal)}` : ""} {unit}
        </span>
      </div>
      <Progress value={percent} />
    </div>
  );
}
