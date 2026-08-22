"use client";

import { FormEvent, useRef, useState } from "react";
import { signUp } from "@/app/account/actions";

type RegisterStatus = "idle" | "error" | "loading" | "confirm_email";

export function RegisterForm() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<RegisterStatus>("idle");
  const [statusText, setStatusText] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmVisible, setConfirmVisible] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const nameInput = form.elements.namedItem("name");
    const emailInput = form.elements.namedItem("email");
    const passwordInput = form.elements.namedItem("password");
    const confirmInput = form.elements.namedItem("confirm-password");
    const termsInput = form.elements.namedItem("terms");

    if (
      !(nameInput instanceof HTMLInputElement) ||
      !(emailInput instanceof HTMLInputElement) ||
      !(passwordInput instanceof HTMLInputElement) ||
      !(confirmInput instanceof HTMLInputElement) ||
      !(termsInput instanceof HTMLInputElement)
    ) {
      return;
    }

    if (!nameInput.value.trim()) {
      setStatus("error");
      setStatusText("Enter your name.");
      nameInput.focus();
      return;
    }

    if (!emailInput.value.trim() || !emailInput.validity.valid) {
      setStatus("error");
      setStatusText("Enter a valid email address.");
      emailInput.focus();
      return;
    }

    if (!passwordInput.value || passwordInput.value.length < 8) {
      setStatus("error");
      setStatusText("Use a password with at least 8 characters.");
      passwordInput.focus();
      return;
    }

    if (passwordInput.value !== confirmInput.value) {
      setStatus("error");
      setStatusText("Passwords do not match.");
      confirmInput.focus();
      return;
    }

    if (!termsInput.checked) {
      setStatus("error");
      setStatusText("Accept the Terms & Conditions and Privacy Policy to continue.");
      termsInput.focus();
      return;
    }

    setStatus("loading");
    setStatusText("Creating account…");

    const result = await signUp(new FormData(form));

    if (!result) {
      return;
    }

    if (!result.ok) {
      setStatus("error");
      setStatusText(result.error);
      return;
    }

    if (result.state === "confirm_email") {
      setStatus("confirm_email");
      setStatusText("Check your email to confirm your account. You are not signed in yet.");
    }
  };

  const clearError = () => {
    if (status === "error") {
      setStatus("idle");
      setStatusText("");
    }
  };

  const toggleVisibility = (input: HTMLInputElement | null, setVisible: (value: boolean) => void) => {
    if (!input) {
      return;
    }
    const nextVisible = input.type === "password";
    input.type = nextVisible ? "text" : "password";
    setVisible(nextVisible);
  };

  return (
    <form
      className={status === "loading" ? "account-form is-loading" : "account-form"}
      id="register-form"
      noValidate
      onSubmit={onSubmit}
    >
      <div className="form-field">
        <label htmlFor="register-name">Name</label>
        <input
          id="register-name"
          name="name"
          type="text"
          autoComplete="name"
          placeholder="Your name"
          required
          onChange={clearError}
        />
      </div>
      <div className="form-field">
        <label htmlFor="register-email">Email address</label>
        <input
          id="register-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          required
          onChange={clearError}
        />
      </div>
      <div className="form-field password-field">
        <label htmlFor="register-password">Password</label>
        <input
          id="register-password"
          ref={passwordRef}
          name="password"
          type="password"
          autoComplete="new-password"
          required
          onChange={clearError}
        />
        <button
          className="password-toggle"
          type="button"
          aria-controls="register-password"
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
          onClick={() => toggleVisibility(passwordRef.current, setPasswordVisible)}
        >
          {passwordVisible ? "Hide" : "Show"}
        </button>
        <p className="password-requirement">Use at least 8 characters.</p>
      </div>
      <div className="form-field password-field">
        <label htmlFor="register-confirm">Confirm password</label>
        <input
          id="register-confirm"
          ref={confirmRef}
          name="confirm-password"
          type="password"
          autoComplete="new-password"
          required
          onChange={clearError}
        />
        <button
          className="password-toggle"
          type="button"
          aria-controls="register-confirm"
          aria-label={confirmVisible ? "Hide password" : "Show password"}
          aria-pressed={confirmVisible}
          onClick={() => toggleVisibility(confirmRef.current, setConfirmVisible)}
        >
          {confirmVisible ? "Hide" : "Show"}
        </button>
      </div>
      <label className="checkbox-row form-row">
        <input type="checkbox" name="terms" onChange={clearError} />
        <span>
          I accept the <a href="/legal/terms-and-conditions">Terms &amp; Conditions</a> and{" "}
          <a href="/legal/privacy-policy">Privacy Policy</a>.
        </span>
      </label>
      <button className="button button--primary" type="submit" disabled={status === "loading"}>
        {status === "loading" ? "Creating account…" : "Create Account"}
      </button>
      <p
        className={
          status === "idle"
            ? "form-status"
            : `form-status is-visible is-${status === "confirm_email" ? "not_configured" : status === "loading" ? "loading" : "error"}`
        }
        data-form-status=""
        aria-live="polite"
      >
        {statusText}
      </p>
    </form>
  );
}
