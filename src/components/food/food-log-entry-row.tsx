"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteFoodLogEntry } from "@/lib/actions/food";

export function FoodLogEntryRow({
  id,
  name,
  brand,
  quantity,
  unit,
  calories,
}: {
  id: string;
  name: string;
  brand: string | null;
  quantity: number;
  unit: string;
  calories: number;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteFoodLogEntry(id);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
    });
  };

  return (
    <li className="flex items-center justify-between gap-3 py-2 text-sm">
      <span className="min-w-0">
        <span className="block truncate font-medium">{name}</span>
        <span className="block truncate text-xs text-muted-foreground">
          {brand && `${brand} · `}
          {quantity} {unit}
        </span>
      </span>
      <span className="flex shrink-0 items-center gap-2">
        <span className="tabular-nums text-muted-foreground">{Math.round(calories)} kcal</span>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={handleDelete}
          disabled={pending}
          aria-label={`Delete ${name}`}
        >
          <X className="size-4" />
        </Button>
      </span>
    </li>
  );
}
