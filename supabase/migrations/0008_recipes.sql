-- Schema only for now; recipe UI is a post-MVP feature per the product spec.
create table public.recipes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  servings numeric not null default 1 check (servings > 0),
  instructions text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.recipe_items (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references public.recipes(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete cascade,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  sort_order int not null default 0
);

create index recipe_items_recipe_id_idx on public.recipe_items (recipe_id);

alter table public.recipes enable row level security;
alter table public.recipe_items enable row level security;

create policy "users can manage their own recipes"
  on public.recipes for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "recipe_items follow parent recipe ownership"
  on public.recipe_items for all
  to authenticated
  using (exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = auth.uid()))
  with check (exists (select 1 from public.recipes r where r.id = recipe_id and r.user_id = auth.uid()));
