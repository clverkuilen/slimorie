-- One row per (user, effective_date). The "current" goal is the row with the
-- latest effective_date <= today, which lets us support scheduled/future
-- goals later without a schema change; MVP just keeps a single row per user.
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  calorie_goal numeric not null check (calorie_goal >= 0),
  protein_g_goal numeric check (protein_g_goal >= 0),
  carbs_g_goal numeric check (carbs_g_goal >= 0),
  fat_g_goal numeric check (fat_g_goal >= 0),
  fiber_g_goal numeric check (fiber_g_goal >= 0),
  effective_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, effective_date)
);

create index goals_user_id_effective_date_idx on public.goals (user_id, effective_date desc);

alter table public.goals enable row level security;

create policy "users can manage their own goals"
  on public.goals for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
