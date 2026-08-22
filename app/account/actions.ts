"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { publicAuthError } from "@/lib/auth/errors";
import { signupUserMetadata, validateSignInInput, validateSignUpInput } from "@/lib/auth/validation";
import { routes } from "@/lib/site";
import { createServerSupabaseClient } from "@/lib/supabase/server";

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

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect(routes.home);
}
