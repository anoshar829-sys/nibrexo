"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { routes } from "@/lib/site";

type NewsletterState = "idle" | "error" | "unavailable";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<NewsletterState>("idle");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const input = event.currentTarget.elements.namedItem("email");
    const valid = input instanceof HTMLInputElement && input.validity.valid && email.trim().length > 0;

    if (!valid) {
      setState("error");
      return;
    }

    setState("unavailable");
  };

  return (
    <section className="newsletter-section" id="newsletter" aria-labelledby="newsletter-title">
      <div className="container newsletter-inner">
        <div className="newsletter-copy">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            06 / Keep In Touch
          </p>
          <h2 id="newsletter-title">Stay in the loop</h2>
          <p>Get new products, design resources, and the occasional deep-dive — straight to your inbox. Nothing else.</p>
        </div>
        <form
          className={state === "error" ? "newsletter-form is-error" : "newsletter-form"}
          noValidate
          onSubmit={onSubmit}
        >
          <label htmlFor="newsletter-email">Email address</label>
          <div className="newsletter-form__row">
            <input
              id="newsletter-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              aria-describedby="newsletter-privacy newsletter-status"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                if (state === "error") {
                  setState("idle");
                }
              }}
            />
            <button className="button button--primary" type="submit">
              Get Updates
            </button>
          </div>
          <p className="newsletter-privacy" id="newsletter-privacy">
            Email service is not configured. No email is submitted from this site. See our{" "}
            <Link href={routes.privacy}>Privacy Policy</Link>.
          </p>
          <p
            className={
              state === "idle"
                ? "newsletter-status"
                : `newsletter-status is-visible is-${state}`
            }
            id="newsletter-status"
            aria-live="polite"
          >
            {state === "error"
              ? "Enter a valid email address."
              : state === "unavailable"
                ? "Email service is not configured. Your email has not been sent or stored."
                : ""}
          </p>
        </form>
      </div>
    </section>
  );
}
