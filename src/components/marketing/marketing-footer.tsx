export function MarketingFooter() {
  return (
    <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
      <p className="font-heading font-semibold text-foreground">Slimorie</p>
      <p className="mt-1">© {new Date().getFullYear()} Slimorie. Open the app, log food, get on with your day.</p>
    </footer>
  );
}
