import { Flame, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions/auth";

export function AppHeader({ xpTotal, level }: { xpTotal: number; level: number }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6">
      <span className="text-lg font-heading font-semibold tracking-tight text-primary md:hidden">
        Slimorie
      </span>
      <div className="hidden md:block" />
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          <Flame className="size-3.5" aria-hidden="true" />
          <span>
            Lv {level} · {xpTotal.toLocaleString()} XP
          </span>
        </div>
        <form action={signOut}>
          <Button variant="ghost" size="icon" type="submit" aria-label="Sign out">
            <LogOut className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
