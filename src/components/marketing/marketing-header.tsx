import Link from "next/link";
import { Button } from "@/components/ui/button";

export function MarketingHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
      <span className="font-heading text-xl font-semibold tracking-tight text-primary">
        Slimorie
      </span>
      <div className="flex items-center gap-2">
        <Button render={<Link href="/login" />} nativeButton={false} variant="ghost" size="sm">
          Sign in
        </Button>
        <Button render={<Link href="/signup" />} nativeButton={false} size="sm">
          Get started
        </Button>
      </div>
    </header>
  );
}
