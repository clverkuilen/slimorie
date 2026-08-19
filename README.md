# Slimorie

> Open the app → log food → get on with your day.

A modern, mobile-first calorie and nutrition tracking PWA. Open-source, cloud-backed via
Supabase, built with Next.js.

The full product and technical spec is in [SPEC.md](./SPEC.md). This README covers what's
actually built and how to run it.

## Status

**Phase 1 (Foundation) is complete:** project scaffold, database schema with RLS, auth
(sign up / sign in / sign out / password reset), app shell with responsive navigation, and a
live dashboard. Food search/logging, barcode scanning, history calendar, and charts are not
built yet — see [Roadmap](#roadmap).

## Stack

- Next.js 16 (App Router, Turbopack) + TypeScript + React 19
- Tailwind CSS v4 + shadcn/ui (built on Base UI, **not** Radix — see [Notable decisions](#notable-decisions))
- Supabase (Postgres, Auth, Row Level Security)
- Zod for validation
- Recharts (installed, not yet used — charts land in the Progress phase)

## Getting started

```bash
npm install
npm run dev
```

Requires a `.env.local` with Supabase credentials — see `.env.example`. A Supabase project
is already provisioned for this app; ask for the project's env values, or run
`npx supabase login` and point a new project at the migrations in `supabase/migrations/`.

## Database

All schema changes are versioned migrations in `supabase/migrations/`, applied in order.
Regenerate `src/types/database.ts` after any schema change:

```bash
supabase gen types typescript --project-id <project-ref> > src/types/database.ts
```

Every user-owned table has Row Level Security enabled with an `auth.uid() = user_id`-style
policy. `foods` (and its child tables) are readable by everyone when system-owned
(`owner_user_id is null`) and otherwise scoped to the owner. Two internal trigger functions
(`recompute_daily_summary`, `apply_xp_event`) are `SECURITY DEFINER` but have `EXECUTE`
revoked from `anon`/`authenticated` so they can't be called directly via the PostgREST RPC
endpoint — only their triggers can invoke them.

## Notable decisions

- **Nutrition is an EAV table** (`food_nutrients`, keyed against a `nutrients` lookup), not
  fixed columns, so adding a new nutrient (e.g. potassium) is a data insert, not a migration.
  A missing row means "unknown," never zero.
- **Food log entries snapshot nutrition** (`nutrition_snapshot` jsonb) at log time, so editing
  or deleting a `Food` later never rewrites historical diary data.
- **Daily summaries are a cache**, recomputed by a trigger on every `food_log_entries` write.
  `food_log_entries` remains the source of truth.
- **XP values live in `xp_rules`** (config table), never hardcoded in application code.
  `xp_events` is an append-only ledger with partial unique indexes that prevent farming XP
  from re-editing the same entity or re-triggering the same day-scoped action.
- **Goals support future scheduling** via `(user_id, effective_date)` — MVP only ever writes
  one row per day, but the "current goal" query (`latest effective_date <= today`) already
  supports scheduled goal changes without a schema change.
- **shadcn/ui now ships on Base UI, not Radix.** `asChild` doesn't exist — use `render={<Link ... />}`
  instead, and pass `nativeButton={false}` on `Button` whenever `render` points at something
  that isn't a real `<button>` (e.g. a `Link`), or Base UI logs an accessibility warning.
- **Next.js 16 renamed `middleware.ts` → `proxy.ts`** (`middleware()` → `proxy()`). Session
  refresh and route protection live in `src/proxy.ts` / `src/lib/supabase/middleware.ts`.
- **Daily boundaries use the user's timezone**, not UTC — `profiles.timezone` (defaulted from
  the browser at signup) drives `log_date` everywhere.

## Roadmap

See `SPEC.md` §75 for the full phase breakdown. Next up: USDA/Open Food Facts ingestion,
food search, barcode scanning, and the actual Add Food flow (Phase 3).

## Testing

Not yet set up. `SPEC.md` §63–64 define the required unit/integration/E2E/RLS test coverage;
this is tracked for a later phase.
