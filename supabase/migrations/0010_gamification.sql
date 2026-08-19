-- XP values live in config (this table), never hardcoded in application logic.
create table public.xp_rules (
  action_key text primary key,
  xp_amount int not null,
  description text,
  updated_at timestamptz not null default now()
);

alter table public.xp_rules enable row level security;

create policy "xp_rules are readable by authenticated users"
  on public.xp_rules for select
  to authenticated
  using (true);

insert into public.xp_rules (action_key, xp_amount, description) values
  ('log_meal', 10, 'Log a meal'),
  ('log_full_day', 25, 'Log a full day'),
  ('log_weight', 10, 'Log weight'),
  ('hit_calorie_target', 25, 'Hit calorie target'),
  ('hit_protein_target', 20, 'Hit protein target'),
  ('hit_all_macro_targets', 30, 'Hit all primary macro targets'),
  ('maintain_streak', 10, 'Maintain logging streak'),
  ('complete_weekly_goal', 100, 'Complete weekly goal');

-- Append-only ledger. The two partial unique indexes below are the
-- anti-farming guard from the spec: an entity-scoped action (e.g. logging one
-- meal) can only ever grant XP once for that entity, and a day-scoped action
-- (e.g. hitting today's calorie target) can only ever grant XP once per day.
create table public.xp_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_key text not null references public.xp_rules(action_key),
  xp_amount int not null,
  related_entity_type text,
  related_entity_id uuid,
  occurred_on date not null default current_date,
  created_at timestamptz not null default now()
);

create unique index xp_events_entity_dedup_idx on public.xp_events (user_id, action_key, related_entity_id)
  where related_entity_id is not null;
create unique index xp_events_daily_dedup_idx on public.xp_events (user_id, action_key, occurred_on)
  where related_entity_id is null;
create index xp_events_user_id_idx on public.xp_events (user_id);

alter table public.xp_events enable row level security;

create policy "users can read their own xp events"
  on public.xp_events for select
  to authenticated
  using (user_id = auth.uid());

create policy "users can insert their own xp events"
  on public.xp_events for insert
  to authenticated
  with check (user_id = auth.uid());

create function public.apply_xp_event()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
  set xp_total = xp_total + new.xp_amount,
      level = greatest(1, floor(sqrt((xp_total + new.xp_amount) / 100.0))::int + 1),
      updated_at = now()
  where id = new.user_id;
  return new;
end;
$$;

create trigger xp_events_apply
  after insert on public.xp_events
  for each row execute function public.apply_xp_event();

-- Data-driven achievements: new achievements are inserted here, never
-- hardcoded into application logic. `condition` is a small rule descriptor
-- the achievement-evaluation service interprets.
create table public.achievements (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  name text not null,
  description text not null,
  icon text,
  condition jsonb not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

alter table public.achievements enable row level security;

create policy "achievements are readable by authenticated users"
  on public.achievements for select
  to authenticated
  using (true);

insert into public.achievements (key, name, description, condition, sort_order) values
  ('first_steps', 'First Steps', 'Log your first food.', '{"type": "log_count", "target": 1}', 10),
  ('getting_started', 'Getting Started', 'Log food for 7 days.', '{"type": "logging_streak", "target": 7}', 20),
  ('consistent', 'Consistent', 'Log food for 30 days.', '{"type": "logging_streak", "target": 30}', 30),
  ('data_hoarder', 'Data Hoarder', 'Log 100 meals.', '{"type": "log_count", "target": 100}', 40),
  ('weight_tracker', 'Weight Tracker', 'Log weight 30 times.', '{"type": "weight_log_count", "target": 30}', 50),
  ('protein_machine', 'Protein Machine', 'Hit your protein goal 7 times.', '{"type": "protein_goal_hits", "target": 7}', 60),
  ('on_target', 'On Target', 'Meet your calorie target 7 times.', '{"type": "calorie_goal_hits", "target": 7}', 70),
  ('balanced', 'Balanced', 'Meet all primary macro targets in a day.', '{"type": "all_macro_goals_day", "target": 1}', 80),
  ('week_strong', 'Week Strong', 'Log every day for one week.', '{"type": "complete_day_streak", "target": 7}', 90),
  ('month_strong', 'Month Strong', 'Log every day for 30 days.', '{"type": "complete_day_streak", "target": 30}', 100);

create table public.user_achievements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  achievement_id uuid not null references public.achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "users can manage their own achievement unlocks"
  on public.user_achievements for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Cached streak counters. Always recomputable from food_log_entries /
-- weight_entries / daily_summaries, so client-side writes here are low risk.
create table public.user_streaks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  streak_type text not null check (streak_type in ('logging', 'complete_day', 'goal')),
  current_count int not null default 0,
  longest_count int not null default 0,
  last_active_date date,
  updated_at timestamptz not null default now(),
  unique (user_id, streak_type)
);

alter table public.user_streaks enable row level security;

create policy "users can manage their own streaks"
  on public.user_streaks for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
