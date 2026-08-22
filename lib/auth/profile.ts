import { getCurrentUser } from "@/lib/auth/session";
import { roleFromProfile, type AppRole } from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthProfile = {
  id: string;
  email: string | null;
  role: AppRole;
};

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { id: user.id, email: user.email ?? null, role: "customer" };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role, email")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return { id: user.id, email: user.email ?? null, role: "customer" };
  }

  return {
    id: user.id,
    email: user.email ?? data.email ?? null,
    role: roleFromProfile(data.role),
  };
}
