-- Canonical food representation. Nutrition is stored per 100g (or per 100ml for
-- liquid-basis foods) and food_nutrients is an EAV table keyed against
-- public.nutrients, so an absent row means "unknown", never zero.
create table public.foods (
  id uuid primary key default gen_random_uuid(),
  owner_user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  brand text,
  description text,
  barcode text,
  basis_unit text not null default 'g' check (basis_unit in ('g', 'ml')),
  ingredients_text text,
  dietary_flags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index foods_owner_user_id_idx on public.foods (owner_user_id);
create index foods_barcode_idx on public.foods (barcode) where barcode is not null;
create index foods_name_trgm_idx on public.foods using gin (name gin_trgm_ops);

create extension if not exists pg_trgm with schema extensions;

-- One source record per food: where it came from, so the UI can always
-- communicate provenance and never imply all data is equally authoritative.
create table public.food_sources (
  food_id uuid primary key references public.foods(id) on delete cascade,
  source_type text not null check (source_type in ('USDA', 'OPEN_FOOD_FACTS', 'USER', 'MANUFACTURER', 'OTHER')),
  source_id text,
  source_url text,
  source_last_updated timestamptz
);

-- Named servings for a food (e.g. "1 slice", "1 breast"), each resolving to a
-- gram equivalent. Universal mass units (g/kg/oz/lb) are converted in the
-- application layer via fixed physical constants and don't need a row here.
create table public.food_servings (
  id uuid primary key default gen_random_uuid(),
  food_id uuid not null references public.foods(id) on delete cascade,
  unit text not null check (unit in ('g', 'kg', 'oz', 'lb', 'ml', 'l', 'cup', 'tbsp', 'tsp', 'piece', 'slice', 'serving', 'custom')),
  label text,
  quantity numeric not null default 1 check (quantity > 0),
  grams_equivalent numeric not null check (grams_equivalent > 0),
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create index food_servings_food_id_idx on public.food_servings (food_id);

create table public.food_nutrients (
  food_id uuid not null references public.foods(id) on delete cascade,
  nutrient_key text not null references public.nutrients(key),
  amount_per_100 numeric not null,
  primary key (food_id, nutrient_key)
);

alter table public.foods enable row level security;
alter table public.food_sources enable row level security;
alter table public.food_servings enable row level security;
alter table public.food_nutrients enable row level security;

-- System foods (owner_user_id is null) are readable by everyone; a user's own
-- custom foods are readable only by them. Nobody can read another user's foods.
create policy "foods are readable when system-owned or self-owned"
  on public.foods for select
  to authenticated
  using (owner_user_id is null or owner_user_id = auth.uid());

create policy "users can create their own foods"
  on public.foods for insert
  to authenticated
  with check (owner_user_id = auth.uid());

create policy "users can update their own foods"
  on public.foods for update
  to authenticated
  using (owner_user_id = auth.uid())
  with check (owner_user_id = auth.uid());

create policy "users can delete their own foods"
  on public.foods for delete
  to authenticated
  using (owner_user_id = auth.uid());

create policy "food_sources follow parent food visibility"
  on public.food_sources for select
  to authenticated
  using (exists (
    select 1 from public.foods f
    where f.id = food_id and (f.owner_user_id is null or f.owner_user_id = auth.uid())
  ));

create policy "food_sources are writable by the owning user"
  on public.food_sources for all
  to authenticated
  using (exists (select 1 from public.foods f where f.id = food_id and f.owner_user_id = auth.uid()))
  with check (exists (select 1 from public.foods f where f.id = food_id and f.owner_user_id = auth.uid()));

create policy "food_servings follow parent food visibility"
  on public.food_servings for select
  to authenticated
  using (exists (
    select 1 from public.foods f
    where f.id = food_id and (f.owner_user_id is null or f.owner_user_id = auth.uid())
  ));

create policy "food_servings are writable by the owning user"
  on public.food_servings for all
  to authenticated
  using (exists (select 1 from public.foods f where f.id = food_id and f.owner_user_id = auth.uid()))
  with check (exists (select 1 from public.foods f where f.id = food_id and f.owner_user_id = auth.uid()));

create policy "food_nutrients follow parent food visibility"
  on public.food_nutrients for select
  to authenticated
  using (exists (
    select 1 from public.foods f
    where f.id = food_id and (f.owner_user_id is null or f.owner_user_id = auth.uid())
  ));

create policy "food_nutrients are writable by the owning user"
  on public.food_nutrients for all
  to authenticated
  using (exists (select 1 from public.foods f where f.id = food_id and f.owner_user_id = auth.uid()))
  with check (exists (select 1 from public.foods f where f.id = food_id and f.owner_user_id = auth.uid()));
