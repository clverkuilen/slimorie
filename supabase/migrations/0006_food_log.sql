-- Food log entries snapshot nutrition + name/brand at log time (in
-- nutrition_snapshot, a nutrient_key -> amount map), so editing or deleting a
-- Food later never rewrites historical diary data. food_id uses ON DELETE SET
-- NULL rather than CASCADE for the same reason: deleting a food must not
-- delete the log entries that reference it.
create table public.food_log_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  food_id uuid references public.foods(id) on delete set null,
  meal_category text not null check (meal_category in ('breakfast', 'lunch', 'dinner', 'snack')),
  logged_at timestamptz not null default now(),
  log_date date not null,
  food_name_snapshot text not null,
  brand_snapshot text,
  source_type_snapshot text,
  quantity numeric not null check (quantity > 0),
  unit text not null,
  grams_equivalent numeric not null check (grams_equivalent > 0),
  nutrition_snapshot jsonb not null,
  note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index food_log_entries_user_date_idx on public.food_log_entries (user_id, log_date);
create index food_log_entries_user_food_idx on public.food_log_entries (user_id, food_id);

alter table public.food_log_entries enable row level security;

create policy "users can manage their own food log entries"
  on public.food_log_entries for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Cached per-day nutrition totals, recomputed from food_log_entries by
-- trigger on every write. food_log_entries remains the source of truth;
-- this table exists purely so the dashboard doesn't re-sum on every load.
create table public.daily_summaries (
  user_id uuid not null references auth.users(id) on delete cascade,
  log_date date not null,
  calories numeric not null default 0,
  protein_g numeric not null default 0,
  carbs_g numeric not null default 0,
  fat_g numeric not null default 0,
  fiber_g numeric not null default 0,
  sugar_g numeric not null default 0,
  entry_count int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, log_date)
);

alter table public.daily_summaries enable row level security;

create policy "users can read their own daily summaries"
  on public.daily_summaries for select
  to authenticated
  using (user_id = auth.uid());

create function public.recompute_daily_summary(p_user_id uuid, p_log_date date)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.daily_summaries as ds (user_id, log_date, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, entry_count, updated_at)
  select
    p_user_id,
    p_log_date,
    coalesce(sum((nutrition_snapshot ->> 'energy_kcal')::numeric), 0),
    coalesce(sum((nutrition_snapshot ->> 'protein_g')::numeric), 0),
    coalesce(sum((nutrition_snapshot ->> 'carbohydrate_g')::numeric), 0),
    coalesce(sum((nutrition_snapshot ->> 'fat_g')::numeric), 0),
    coalesce(sum((nutrition_snapshot ->> 'fiber_g')::numeric), 0),
    coalesce(sum((nutrition_snapshot ->> 'sugar_g')::numeric), 0),
    count(*),
    now()
  from public.food_log_entries
  where user_id = p_user_id and log_date = p_log_date
  on conflict (user_id, log_date) do update set
    calories = excluded.calories,
    protein_g = excluded.protein_g,
    carbs_g = excluded.carbs_g,
    fat_g = excluded.fat_g,
    fiber_g = excluded.fiber_g,
    sugar_g = excluded.sugar_g,
    entry_count = excluded.entry_count,
    updated_at = now();

  -- Nothing left logged for that day: drop the row instead of leaving a zeroed one.
  delete from public.daily_summaries
  where user_id = p_user_id and log_date = p_log_date and entry_count = 0;
end;
$$;

create function public.food_log_entries_summary_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.recompute_daily_summary(old.user_id, old.log_date);
    return old;
  end if;

  perform public.recompute_daily_summary(new.user_id, new.log_date);

  if tg_op = 'UPDATE' and old.log_date <> new.log_date then
    perform public.recompute_daily_summary(old.user_id, old.log_date);
  end if;

  return new;
end;
$$;

create trigger food_log_entries_summary
  after insert or update or delete on public.food_log_entries
  for each row execute function public.food_log_entries_summary_trigger();
