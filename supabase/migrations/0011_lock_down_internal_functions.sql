-- These functions are internal helpers meant to run only as triggers (or, in
-- recompute_daily_summary's case, only from within another SECURITY DEFINER
-- trigger function). PostgREST exposes every function in the public schema
-- as an RPC endpoint by default, which would let any authenticated user call
-- recompute_daily_summary(p_user_id, p_log_date) with someone else's user_id.
-- Revoking EXECUTE from anon/authenticated closes that off; the trigger
-- machinery and the owning role still run these fine since privilege checks
-- use the function owner's rights under SECURITY DEFINER, not the caller's.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.food_log_entries_summary_trigger() from public, anon, authenticated;
revoke execute on function public.apply_xp_event() from public, anon, authenticated;
revoke execute on function public.recompute_daily_summary(uuid, date) from public, anon, authenticated;
