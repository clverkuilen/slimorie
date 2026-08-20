import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/layout/logo";

export function MarketingHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between px-5 py-5 md:px-10">
      <Logo iconSize={22} textClassName="text-xl text-primary" />
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
