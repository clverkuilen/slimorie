create table public.weight_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  weight numeric not null check (weight > 0),
  unit text not null check (unit in ('lb', 'kg')),
  logged_at timestamptz not null default now(),
  note text,
  created_at timestamptz not null default now()
);

create index weight_entries_user_logged_at_idx on public.weight_entries (user_id, logged_at desc);

alter table public.weight_entries enable row level security;

create policy "users can manage their own weight entries"
  on public.weight_entries for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
