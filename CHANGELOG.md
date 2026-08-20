# Changelog

## Unreleased

### Added — Phase 1: Foundation

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + shadcn/ui project scaffold.
- Supabase project with full initial schema: `profiles`, `goals`, `foods` +
  `food_sources` + `food_servings` + `food_nutrients` (extensible EAV nutrition model),
  `food_log_entries` (nutrition-snapshotting) + `daily_summaries` (trigger-maintained cache),
  `saved_meals`/`saved_meal_items`, `recipes`/`recipe_items` (schema only), `weight_entries`,
  and the gamification tables (`xp_rules`, `xp_events`, `achievements`, `user_achievements`,
  `user_streaks`), seeded with the spec's initial nutrients, XP values, and achievements.
- Row Level Security on all 19 tables; internal trigger functions locked down against direct
  RPC invocation (found and fixed via the Supabase security advisor).
- Auth: sign up, sign in, sign out, password reset, protected routes via `proxy.ts`
  (Next.js 16's renamed `middleware.ts`), auto-created profile on signup via DB trigger.
- App shell: responsive nav (bottom bar on mobile, side rail on desktop), Today dashboard
  reading live goals/summary/streak/XP data, Goals settings form, weight logging, and a
  real Achievements grid (locked/unlocked from seeded data).
- Accent color palette (warm coral/orange) layered onto shadcn's neutral base.

### Fixed

- Signup silently failed to give feedback when Supabase's email-confirmation requirement
  left the user session-less after `signUp()` — now shows a "check your email" message
  instead of redirecting into a protected route the proxy would just bounce back out of.
- `Button` instances using `render={<Link .../>}` were missing `nativeButton={false}`,
  triggering a Base UI accessibility warning (expects a real `<button>` unless told otherwise).

### Added — Phase 3: Food Data (core loop)

- USDA FoodData Central search (`/api/foods/search`, combining a local-DB query with a live
  USDA search) and detail-fetch-and-import (`src/lib/foods/usda.ts`) — normalizes Branded,
  Foundation/SR Legacy, and Survey (FNDDS) foods, which all structure nutrients/servings
  differently, into the common schema from Phase 1.
- Logging: serving/quantity/meal picker (`LogFoodDialog`), deterministic nutrition scaling
  (`src/lib/nutrition/calculate.ts`), universal mass-unit conversion (g/kg/oz/lb, independent
  of any specific food's servings), quick calorie entry, favoriting.
- Recent foods, derived from `food_log_entries` history rather than a new table; favorites,
  which needed one (`favorite_foods` migration).
- Full loop verified live end to end against the real USDA API: search → import → log →
  daily-summary recompute → XP grant → recent-foods list.

### Renamed — Macroloom → Slimorie, and a full color system redo

- Product renamed twice mid-build (Macroloom → Slimorie); one color palette swap, then a
  second full palette replacement after user feedback that the first felt "too heavy." Both
  passes verified every text/background pairing against the actual WCAG contrast formula via
  a one-off script rather than eyeballing — several raw brand-swatch values were too light or
  too close to their pairing to pass AA and needed working (darkened/lightened) variants.
- Public marketing landing page (previously `/` just bounced everyone to `/login`).

### Fixed (round 2)

- `success` foreground color was tuned for text on a *solid* fill, but its only real usage is
  a `bg-success/10` light tint — the near-white text was nearly invisible on it.
- Auth email links (confirmation, password reset) pointed at `localhost:3000` in production —
  `signUp()`/`resetPasswordForEmail()` never passed an explicit `emailRedirectTo`.
- `.gitignore`'s `.env*` pattern was swallowing `.env.example` too, so it was never actually
  committed despite existing on disk since Phase 1.
- Settings page: `Card`'s default flex `gap` wasn't cleared by `className="p-0"` (a different
  CSS property), bloating the space around each divider.
- `recompute_daily_summary` broke user deletion: cascading from `auth.users` fires the
  `food_log_entries` delete trigger, which tried to re-upsert `daily_summaries` for a user
  mid-deletion, violating the FK. Now catches `foreign_key_violation` and no-ops — an orphaned
  row in that scenario is about to cascade-delete anyway. Directly relevant to the not-yet-built
  account-deletion feature (spec §58).
- `LogFoodDialog`'s favorite button visually collided with `DialogContent`'s own
  absolutely-positioned close button, causing misclicks that closed the dialog instead of
  toggling the favorite.
- Recent/favorite food rows showed the *logged quantity's* calories mislabeled as "kcal/100g"
  (should be, and now is, the food's actual per-100 value), and always showed "YOUR FOOD" as
  the source badge regardless of the food's real source.
