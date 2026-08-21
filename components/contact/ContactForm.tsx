"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { routes } from "@/lib/site";

type ContactState = "idle" | "error" | "unavailable";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<ContactState>("idle");
  const [errorText, setErrorText] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const nameInput = form.elements.namedItem("name");
    const emailInput = form.elements.namedItem("email");
    const messageInput = form.elements.namedItem("message");

    if (!(nameInput instanceof HTMLInputElement) || !(emailInput instanceof HTMLInputElement) || !(messageInput instanceof HTMLTextAreaElement)) {
      return;
    }

    if (!name.trim()) {
      setState("error");
      setErrorText("Enter your name.");
      nameInput.focus();
      return;
    }

    if (!email.trim() || !emailInput.validity.valid) {
      setState("error");
      setErrorText("Enter a valid email address.");
      emailInput.focus();
      return;
    }

    if (!message.trim()) {
      setState("error");
      setErrorText("Enter a message.");
      messageInput.focus();
      return;
    }

    setState("unavailable");
    setErrorText("");
  };

  const clearError = () => {
    if (state === "error") {
      setState("idle");
      setErrorText("");
    }
  };

  return (
    <form
      className={state === "error" ? "contact-form is-error" : "contact-form"}
      noValidate
      onSubmit={onSubmit}
    >
      <label htmlFor="contact-name">Name</label>
      <input
        id="contact-name"
        name="name"
        type="text"
        autoComplete="name"
        required
        aria-invalid={state === "error" && !name.trim()}
        aria-describedby="contact-note contact-status"
        value={name}
        onChange={(event) => {
          setName(event.target.value);
          clearError();
        }}
      />
      <label htmlFor="contact-email">Email address</label>
      <input
        id="contact-email"
        name="email"
        type="email"
        autoComplete="email"
        inputMode="email"
        required
        aria-invalid={state === "error" && (!email.trim() || errorText.includes("email"))}
        aria-describedby="contact-note contact-status"
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          clearError();
        }}
      />
      <label htmlFor="contact-message">Message</label>
      <textarea
        id="contact-message"
        name="message"
        required
        aria-invalid={state === "error" && !message.trim()}
        aria-describedby="contact-note contact-status"
        value={message}
        onChange={(event) => {
          setMessage(event.target.value);
          clearError();
        }}
      />
      <button className="button button--primary" type="submit">
        Send Message
      </button>
      <p className="contact-note" id="contact-note">
        Contact backend is not configured. No message is submitted or stored. See our{" "}
        <Link href={routes.privacy}>Privacy Policy</Link>.
      </p>
      <p
        className={
          state === "idle" ? "contact-status" : `contact-status is-visible is-${state}`
        }
        id="contact-status"
        aria-live="polite"
      >
        {state === "error"
          ? errorText
          : state === "unavailable"
            ? "Contact backend is not configured. Your message has not been sent or stored."
            : ""}
      </p>
    </form>
  );
}
