import { getCurrentUser } from "@/lib/auth/session";
import { roleFromProfile, type AppRole } from "@/lib/auth/roles";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DEFAULT_AVATAR_ID, isAvatarId, type AvatarId } from "@/lib/auth/avatars";

export type AuthProfile = {
  id: string;
  email: string | null;
  role: AppRole;
  displayName: string;
  avatarId: AvatarId;
};

function fallbackName(user: { user_metadata?: Record<string, unknown> }) {
  const name = user.user_metadata?.name;
  return typeof name === "string" && name.trim() ? name.trim() : "Nibrexo member";
}

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { id: user.id, email: user.email ?? null, role: "customer", displayName: fallbackName(user), avatarId: DEFAULT_AVATAR_ID };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role, email, display_name, avatar_id")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return { id: user.id, email: user.email ?? null, role: "customer", displayName: fallbackName(user), avatarId: DEFAULT_AVATAR_ID };
  }

  return {
    id: user.id,
    email: user.email ?? data.email ?? null,
    role: roleFromProfile(data.role),
    displayName: typeof data.display_name === "string" && data.display_name.trim() ? data.display_name : fallbackName(user),
    avatarId: isAvatarId(data.avatar_id) ? data.avatar_id : DEFAULT_AVATAR_ID,
  };
}
