import { getCurrentUser } from "@/lib/auth/session";
import { roleFromProfile, type AppRole } from "@/lib/auth/roles";
import { isOwnedProfilePhotoPath, profilePhotoPublicUrl } from "@/lib/auth/profile-photo";
import { getSupabasePublicEnv } from "@/lib/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type AuthProfile = {
  id: string;
  email: string | null;
  role: AppRole;
  displayName: string;
  avatarPath: string | null;
  avatarUrl: string | null;
};

export type PublicProfileIdentity = {
  displayName: string;
  avatarUrl: string | null;
};

function fallbackName(user: { user_metadata?: Record<string, unknown> }) {
  const name = user.user_metadata?.name;
  return typeof name === "string" && name.trim() ? name.trim() : "Nibrexo member";
}

function resolveAvatar(
  userId: string,
  rawPath: unknown,
  updatedAt?: unknown,
): { avatarPath: string | null; avatarUrl: string | null } {
  const path = typeof rawPath === "string" ? rawPath : null;
  if (!isOwnedProfilePhotoPath(userId, path)) {
    return { avatarPath: null, avatarUrl: null };
  }
  const { url } = getSupabasePublicEnv();
  const baseUrl = profilePhotoPublicUrl(url, path);
  if (!baseUrl) {
    return { avatarPath: path, avatarUrl: null };
  }
  const stamp =
    typeof updatedAt === "string" && updatedAt
      ? `?v=${encodeURIComponent(updatedAt)}`
      : "";
  return { avatarPath: path, avatarUrl: `${baseUrl}${stamp}` };
}

export async function getCurrentProfile(): Promise<AuthProfile | null> {
  const user = await getCurrentUser();
  if (!user) {
    return null;
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return {
      id: user.id,
      email: user.email ?? null,
      role: "customer",
      displayName: fallbackName(user),
      avatarPath: null,
      avatarUrl: null,
    };
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role, email, display_name, avatar_path, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  if (error || !data) {
    return {
      id: user.id,
      email: user.email ?? null,
      role: "customer",
      displayName: fallbackName(user),
      avatarPath: null,
      avatarUrl: null,
    };
  }

  const avatar = resolveAvatar(user.id, data.avatar_path, data.updated_at);

  return {
    id: user.id,
    email: user.email ?? data.email ?? null,
    role: roleFromProfile(data.role),
    displayName: typeof data.display_name === "string" && data.display_name.trim() ? data.display_name : fallbackName(user),
    avatarPath: avatar.avatarPath,
    avatarUrl: avatar.avatarUrl,
  };
}
