"use client";

import Link from "next/link";
import { FormEvent, useRef, useState } from "react";
import { routes } from "@/lib/site";

type LoginStatus = "idle" | "error" | "not_configured";

const NOT_CONFIGURED_MESSAGE = "Authentication is not configured yet. No sign-in occurred.";

export function LoginForm() {
  const passwordRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<LoginStatus>("idle");
  const [statusText, setStatusText] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [emailInvalid, setEmailInvalid] = useState(false);
  const [passwordInvalid, setPasswordInvalid] = useState(false);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const emailInput = form.elements.namedItem("email");
    const passwordInput = form.elements.namedItem("password");

    if (!(emailInput instanceof HTMLInputElement) || !(passwordInput instanceof HTMLInputElement)) {
      return;
    }

    if (!emailInput.value.trim() || !emailInput.validity.valid) {
      setStatus("error");
      setStatusText("Enter a valid email address.");
      setEmailInvalid(true);
      setPasswordInvalid(false);
      emailInput.focus();
      return;
    }

    if (!passwordInput.value) {
      setStatus("error");
      setStatusText("Enter your password.");
      setEmailInvalid(false);
      setPasswordInvalid(true);
      passwordInput.focus();
      return;
    }

    setEmailInvalid(false);
    setPasswordInvalid(false);
    setStatus("not_configured");
    setStatusText(NOT_CONFIGURED_MESSAGE);
  };

  const clearFieldError = () => {
    if (status === "error") {
      setStatus("idle");
      setStatusText("");
      setEmailInvalid(false);
      setPasswordInvalid(false);
    }
  };

  const togglePasswordVisibility = () => {
    const input = passwordRef.current;
    if (!input) {
      return;
    }
    const nextVisible = input.type === "password";
    input.type = nextVisible ? "text" : "password";
    setPasswordVisible(nextVisible);
  };

  return (
    <form className="account-form" id="login-form" noValidate onSubmit={onSubmit}>
      <div className="form-field">
        <label htmlFor="login-email">Email address</label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          required
          aria-invalid={emailInvalid}
          aria-describedby="login-status"
          onChange={clearFieldError}
        />
      </div>
      <div className="form-field password-field">
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          ref={passwordRef}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          aria-invalid={passwordInvalid}
          aria-describedby="login-status"
          onChange={clearFieldError}
        />
        <button
          className="password-toggle"
          type="button"
          aria-controls="login-password"
          aria-label={passwordVisible ? "Hide password" : "Show password"}
          aria-pressed={passwordVisible}
          onClick={togglePasswordVisibility}
        >
          {passwordVisible ? "Hide" : "Show"}
        </button>
      </div>
      <div className="form-row">
        <label className="checkbox-row">
          <input type="checkbox" name="remember" />
          <span>Remember me</span>
        </label>
        <Link className="button--text" href={routes.forgotPassword}>
          Forgot password?
        </Link>
      </div>
      <button className="button button--primary" type="submit">
        Log In
      </button>
      <p
        className={status === "idle" ? "form-status" : `form-status is-visible is-${status}`}
        data-form-status=""
        id="login-status"
        aria-live="polite"
      >
        {statusText}
      </p>
    </form>
  );
}
