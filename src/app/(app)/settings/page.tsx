import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, Download, Target, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signOut } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings — Slimorie" };

function SettingsLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Target;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between px-4 py-3 text-sm hover:bg-accent/50"
    >
      <span className="flex items-center gap-3">
        <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
        {label}
      </span>
      <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
    </Link>
  );
}

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground">Signed in as</p>
          <p className="font-medium">{user?.email}</p>
        </CardContent>
      </Card>

      <Card className="gap-0 p-0">
        <SettingsLink href="/settings/goals" icon={Target} label="Daily goals" />
        <Separator />
        <SettingsLink href="/settings/update-password" icon={Target} label="Change password" />
      </Card>

      <Card className="gap-0 p-0">
        <div className="flex items-center justify-between px-4 py-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-3">
            <Download className="size-4" aria-hidden="true" />
            Export your data (JSON / CSV)
          </span>
          <span className="text-xs">Coming soon</span>
        </div>
        <Separator />
        <div className="flex items-center justify-between px-4 py-3 text-sm text-destructive/80">
          <span className="flex items-center gap-3">
            <Trash2 className="size-4" aria-hidden="true" />
            Delete account
          </span>
          <span className="text-xs text-muted-foreground">Coming soon</span>
        </div>
      </Card>

      <form action={signOut}>
        <Button type="submit" variant="outline" className="w-full">
          Sign out
        </Button>
      </form>
    </div>
  );
}
