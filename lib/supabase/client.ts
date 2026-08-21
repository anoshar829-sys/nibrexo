import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/env";

export function createBrowserSupabaseClient(): SupabaseClient | null {
  const { url, anonKey, configured } = getSupabasePublicEnv();

  if (!configured) {
    return null;
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
