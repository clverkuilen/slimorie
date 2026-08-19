# Changelog

## Unreleased

### Added — Phase 1: Foundation

- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4 + shadcn/ui project scaffold.
- Supabase project (`macroloom`) with full initial schema: `profiles`, `goals`, `foods` +
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
