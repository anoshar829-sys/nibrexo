"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { publicAuthError } from "@/lib/auth/errors";
import {
  isOwnedProfilePhotoPath,
  isProfileRowPersisted,
  PROFILE_PHOTO_BUCKET,
  profilePhotoObjectPath,
  shouldRollbackUploadedPhoto,
  validateProfilePhotoFile,
} from "@/lib/auth/profile-photo";
import { resolveAvatar } from "@/lib/auth/profile";
import { getCurrentUser } from "@/lib/auth/session";
import { signupUserMetadata, validateDisplayName, validateSignInInput, validateSignUpInput } from "@/lib/auth/validation";
import { routes } from "@/lib/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export type ProfileUpdateResult =
  | { ok: true; displayName: string; avatarPath: string | null; avatarUrl: string | null }
  | { ok: false; error: string };

export type AuthActionResult =
  | { ok: true; state: "signed_in" }
  | { ok: true; state: "confirm_email" }
  | { ok: false; error: string };

function readField(formData: FormData, name: string) {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

async function requestOrigin() {
  const headerStore = await headers();
  return headerStore.get("origin") ?? "";
}

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");

  const input = validateSignInInput(email, password);
  if (!input.ok) {
    return { ok: false, error: input.error };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Authentication is not configured yet. No sign-in occurred." };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { ok: false, error: publicAuthError(error) };
  }

  if (!data.user || !data.session) {
    return { ok: false, error: "Sign-in did not establish a session." };
  }

  redirect(routes.account);
}

export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const name = readField(formData, "name").trim();
  const email = readField(formData, "email").trim();
  const password = readField(formData, "password");
  const confirm = readField(formData, "confirm-password");
  const terms = formData.get("terms");

  const input = validateSignUpInput({ name, email, password, confirm, terms });
  if (!input.ok) {
    return { ok: false, error: input.error };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, error: "Account registration is not configured yet. No account was created." };
  }

  const origin = await requestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: signupUserMetadata(name),
      emailRedirectTo: origin ? `${origin}/auth/callback` : undefined,
    },
  });

  if (error) {
    return { ok: false, error: publicAuthError(error) };
  }

  if (data.session && data.user) {
    redirect(routes.account);
  }

  if (data.user && !data.session) {
    return { ok: true, state: "confirm_email" };
  }

  return { ok: false, error: "Account registration did not complete. No sign-in occurred." };
}

export async function updateProfile(formData: FormData): Promise<ProfileUpdateResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Your session has expired. Sign in again." };

  const displayName = readField(formData, "display_name").trim();
  const removePhoto = readField(formData, "remove_photo") === "1";
  const photoEntry = formData.get("photo");
  const photoFile = photoEntry instanceof File && photoEntry.size > 0 ? photoEntry : null;

  const nameCheck = validateDisplayName(displayName);
  if (!nameCheck.ok) return nameCheck;

  const supabase = await createServerSupabaseClient();
  if (!supabase) return { ok: false, error: "Profile updates are not configured yet." };

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("avatar_path")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) {
    return { ok: false, error: "We could not load your profile. Try again." };
  }

  // Profile rows are provisioned by the auth bootstrap trigger — clients cannot insert.
  // A missing row would make .update() appear to succeed while writing nothing.
  if (!existing) {
    return {
      ok: false,
      error: "Your profile record is not ready yet. Sign out, sign back in, and try again.",
    };
  }

  const previousPath = isOwnedProfilePhotoPath(user.id, existing.avatar_path) ? existing.avatar_path : null;
  let nextPath: string | null = previousPath;
  let uploadedPath: string | null = null;
  const stalePaths = new Set<string>();

  if (photoFile) {
    const validated = await validateProfilePhotoFile(photoFile);
    if (!validated.ok) return validated;

    const objectPath = profilePhotoObjectPath(user.id, validated.ext);
    const { error: uploadError } = await supabase.storage.from(PROFILE_PHOTO_BUCKET).upload(objectPath, validated.bytes, {
      contentType: validated.mime,
      upsert: true,
      cacheControl: "3600",
    });

    if (uploadError) {
      return { ok: false, error: "We could not upload your profile photo. Try again." };
    }

    uploadedPath = objectPath;
    nextPath = objectPath;

    if (previousPath && previousPath !== objectPath) {
      stalePaths.add(previousPath);
    }
  } else if (removePhoto) {
    nextPath = null;
    if (previousPath) {
      stalePaths.add(previousPath);
    }
  }

  const updatedAt = new Date().toISOString();
  const { data: saved, error } = await supabase
    .from("profiles")
    .update({
      display_name: displayName,
      avatar_path: nextPath,
      updated_at: updatedAt,
    })
    .eq("id", user.id)
    .select("display_name, avatar_path, updated_at")
    .maybeSingle();

  if (error || !saved || !isProfileRowPersisted({ error, data: saved })) {
    if (shouldRollbackUploadedPhoto(uploadedPath, previousPath)) {
      await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([uploadedPath]);
    }
    return { ok: false, error: "We could not save your profile. Try again." };
  }

  if (stalePaths.size > 0) {
    await supabase.storage.from(PROFILE_PHOTO_BUCKET).remove([...stalePaths]);
  }

  const avatar = resolveAvatar(user.id, saved.avatar_path, saved.updated_at ?? updatedAt);
  const savedName =
    typeof saved.display_name === "string" && saved.display_name.trim() ? saved.display_name.trim() : displayName;

  return {
    ok: true,
    displayName: savedName,
    avatarPath: avatar.avatarPath,
    avatarUrl: avatar.avatarUrl,
  };
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect(routes.home);
}
