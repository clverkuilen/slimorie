import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Bypasses RLS entirely — use only for operations that genuinely need to
// write system-owned data (e.g. caching a normalized USDA/Open Food Facts
// food as owner_user_id = null). Every call site must construct the data
// itself from a source it trusts (a real external-API response), never pass
// through unvalidated client input, since this client has no ownership
// checks to fall back on.
export function createServiceRoleClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY is not configured.");

  return createSupabaseClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
