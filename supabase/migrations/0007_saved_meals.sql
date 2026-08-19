create table public.saved_meals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.saved_meal_items (
  id uuid primary key default gen_random_uuid(),
  saved_meal_id uuid not null references public.saved_meals(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete cascade,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  sort_order int not null default 0
);

create index saved_meal_items_saved_meal_id_idx on public.saved_meal_items (saved_meal_id);

alter table public.saved_meals enable row level security;
alter table public.saved_meal_items enable row level security;

create policy "users can manage their own saved meals"
  on public.saved_meals for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "saved_meal_items follow parent saved meal ownership"
  on public.saved_meal_items for all
  to authenticated
  using (exists (select 1 from public.saved_meals sm where sm.id = saved_meal_id and sm.user_id = auth.uid()))
  with check (exists (select 1 from public.saved_meals sm where sm.id = saved_meal_id and sm.user_id = auth.uid()));
