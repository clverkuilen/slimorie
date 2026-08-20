# Slimorie

> Open the app → log food → get on with your day.

A modern, mobile-first calorie and nutrition tracking PWA. Open-source, cloud-backed via
Supabase, built with Next.js.

The full product and technical spec is in [SPEC.md](./SPEC.md). This README covers what's
actually built and how to run it.

## Status

**Phase 1 (Foundation) is complete:** project scaffold, database schema with RLS, auth
(sign up / sign in / sign out / password reset), app shell with responsive navigation, and a
live dashboard.

**Phase 3 (Food Data) core loop is in:** USDA FoodData Central search + import, favorites,
recent foods (derived from log history), quick calorie entry, and logging to a meal — all
live-tested end to end. Barcode scanning, Open Food Facts, custom foods, history calendar,
and charts are not built yet — see [Roadmap](#roadmap).

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

Importing a food from USDA writes a system-owned row (`owner_user_id = null`), which a normal
user session can't do under the RLS policy above — deliberately, so a client can't inject data
that masquerades as verified USDA data. That write goes through `SUPABASE_SERVICE_ROLE_KEY`,
used only in `src/lib/foods/ingest.ts`, called only with data the server fetched itself from
the real USDA API — never with client-supplied fields.

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
- **Recent foods are derived from `food_log_entries`**, not a separate table — `DISTINCT`
  most-recent-first, capped. Favorites needed their own table (`favorite_foods`) since there's
  no equivalent source of truth to derive it from.
- **Search hits the local DB and USDA live in parallel**, deduped by name+brand. Nothing gets
  written to our DB until the user actually selects a result — search itself never writes.
- **USDA's food data isn't uniform across data types.** Branded foods carry a single label
  serving (`servingSize`/`servingSizeUnit`); Foundation/SR Legacy foods carry multiple
  `foodPortions` with a real label in `modifier`; Survey (FNDDS) foods also carry
  `foodPortions`, but `modifier` there is an internal numeric code — the real label is
  `portionDescription`. Confirmed against live API responses during development, not
  assumed from memory. See `src/lib/foods/usda.ts`.

## Brand assets

The flame mark (`assets/brand/logo-source.png`) is the source of truth for every derived
icon — `src/app/icon.png`, `apple-icon.png`, `favicon.ico`, and everything in `public/icons/`
(PWA manifest icons, including a maskable variant with safe-zone padding, plus the small
wordmark icon used next to the "Slimorie" text in `src/components/layout/logo.tsx`). To
regenerate all of them after swapping in new artwork:

```bash
npm install --no-save sharp png-to-ico
node scripts/generate-icons.js
```

The "Slimorie" wordmark is always real text, never baked into an image — `Logo` just places
the icon next to it.

## Roadmap

See `SPEC.md` §75 for the full phase breakdown. Next up: barcode scanning, Open Food Facts,
custom foods, and search ranking beyond USDA's own relevance order.

## Testing

Not yet set up. `SPEC.md` §63–64 define the required unit/integration/E2E/RLS test coverage;
this is tracked for a later phase.
