type AuthLikeError = {
  code?: string;
  message?: string;
};

export function publicAuthError(error: AuthLikeError | null | undefined): string {
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
