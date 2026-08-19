import { redirect } from "next/navigation";
import { AppHeader } from "@/components/layout/app-header";
import { BottomNav } from "@/components/layout/bottom-nav";
import { SidebarNav } from "@/components/layout/sidebar-nav";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("xp_total, level")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex min-h-screen">
      <SidebarNav />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader xpTotal={profile?.xp_total ?? 0} level={profile?.level ?? 1} />
        <main className="flex-1 px-4 pt-4 pb-20 md:px-6 md:pb-6">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
