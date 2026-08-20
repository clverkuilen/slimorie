import Image from "next/image";
import { cn } from "@/lib/utils";

// The "Slimorie" text always stays real text (never baked into the icon
// image) — this just places the flame mark next to it at a size that scales
// with the surrounding text.
export function Logo({
  iconSize = 24,
  className,
  textClassName,
}: {
  iconSize?: number;
  className?: string;
  textClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <Image
        src="/icons/wordmark-icon.png"
        alt=""
        width={iconSize}
        height={iconSize}
        className="shrink-0"
      />
      <span className={cn("font-heading font-semibold tracking-tight", textClassName)}>
        Slimorie
      </span>
    </span>
  );
}
