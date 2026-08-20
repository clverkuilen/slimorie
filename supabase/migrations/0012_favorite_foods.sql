-- "Recent foods" (spec section 18) is derived from food_log_entries directly
-- (DISTINCT food_id ordered by most recent logged_at) rather than stored
-- separately. Favorites has no equivalent source of truth, so it needs its
-- own table.
create table public.favorite_foods (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid not null references public.foods(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, food_id)
);

create index favorite_foods_user_id_idx on public.favorite_foods (user_id);

alter table public.favorite_foods enable row level security;

create policy "users can manage their own favorite foods"
  on public.favorite_foods for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
