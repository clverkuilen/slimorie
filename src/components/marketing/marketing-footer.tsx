import { Logo } from "@/components/layout/logo";

export function MarketingFooter() {
  return (
    <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
      <Logo iconSize={18} textClassName="text-foreground" />
      <p className="mt-1">© {new Date().getFullYear()} Slimorie. Open the app, log food, get on with your day.</p>
    </footer>
  );
}
