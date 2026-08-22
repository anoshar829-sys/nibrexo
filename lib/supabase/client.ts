import { createBrowserClient } from "@supabase/ssr";
import { getSupabasePublicEnv } from "@/lib/env";

export function createBrowserSupabaseClient() {
  const { url, anonKey, configured } = getSupabasePublicEnv();

  if (!configured) {
    return null;
  }

  return createBrowserClient(url, anonKey);
}
