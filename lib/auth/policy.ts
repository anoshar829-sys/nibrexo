export const APP_ROLES = ["customer", "owner", "admin"] as const;
export type AppRole = (typeof APP_ROLES)[number];

export type AccessProfile = {
  id: string;
  email: string | null;
  role: AppRole;
};

export type AccessDecision =
  | { status: "guest" }
  | { status: "customer"; profile: AccessProfile }
  | { status: "staff"; profile: AccessProfile };

export type FieldValidation = { ok: true } | { ok: false; error: string };

export function isAppRole(value: unknown): value is AppRole {
  return typeof value === "string" && (APP_ROLES as readonly string[]).includes(value);
}

export function isStaffRole(role: AppRole | null | undefined): boolean {
  return role === "owner" || role === "admin";
}

export function roleFromProfile(value: unknown): AppRole {
  return isAppRole(value) ? value : "customer";
}

export function classifyAccess(profile: AccessProfile | null): AccessDecision {
  if (!profile) {
    return { status: "guest" };
  }
  if (isStaffRole(profile.role)) {
    return { status: "staff", profile };
  }
  return { status: "customer", profile };
}

export function canOpenAdmin(profile: AccessProfile | null): boolean {
  return classifyAccess(profile).status === "staff";
}

export function canOpenAccount(profile: AccessProfile | null): boolean {
  return classifyAccess(profile).status !== "guest";
}

export function validateSignInInput(email: string, password: string): FieldValidation {
  if (!email.trim() || !email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!password) {
    return { ok: false, error: "Enter your password." };
  }
  return { ok: true };
}

export function validateSignUpInput(input: {
  name: string;
  email: string;
  password: string;
  confirm: string;
  terms: unknown;
}): FieldValidation {
  if (!input.name.trim()) {
    return { ok: false, error: "Enter your name." };
  }
  if (!input.email.trim() || !input.email.includes("@")) {
    return { ok: false, error: "Enter a valid email address." };
  }
  if (!input.password || input.password.length < 8) {
    return { ok: false, error: "Use a password with at least 8 characters." };
  }
  if (input.password !== input.confirm) {
    return { ok: false, error: "Passwords do not match." };
  }
  if (input.terms !== "on" && input.terms !== "true") {
    return { ok: false, error: "Accept the Terms & Conditions and Privacy Policy to continue." };
  }
  return { ok: true };
}

export function signupUserMetadata(name: string) {
  return { name };
}

export function publicAuthError(error: { code?: string; message?: string } | null | undefined): string {
  const code = error?.code ?? "";
  const message = (error?.message ?? "").toLowerCase();

  if (code === "invalid_credentials" || message.includes("invalid login")) {
    return "Invalid email or password.";
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "Confirm your email before signing in.";
  }
  if (code === "user_already_exists" || message.includes("already registered")) {
    return "An account with this email already exists.";
  }
  if (code === "weak_password" || message.includes("password should be")) {
    return "Use a password with at least 8 characters.";
  }
  return "Authentication is unavailable. No account change occurred.";
}
