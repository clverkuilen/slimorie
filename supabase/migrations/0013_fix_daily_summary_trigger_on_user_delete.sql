-- Deleting a user cascades to food_log_entries, which fires
-- food_log_entries_summary_trigger (AFTER DELETE), which calls
-- recompute_daily_summary — but by then daily_summaries' own FK to
-- auth.users may already be unsatisfiable mid-cascade, so the upsert
-- inside it throws a foreign_key_violation and the whole user deletion
-- fails. Since an orphaned daily_summaries row is about to cascade-delete
-- anyway in this scenario, it's safe to just skip the write.
create or replace function public.recompute_daily_summary(p_user_id uuid, p_log_date date)
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

  delete from public.daily_summaries
  where user_id = p_user_id and log_date = p_log_date and entry_count = 0;
exception
  when foreign_key_violation then
    null;
end;
$$;

revoke execute on function public.recompute_daily_summary(uuid, date) from public, anon, authenticated;
