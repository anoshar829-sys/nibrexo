import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Forgot Password — Nibrexo",
  description: "Enter your email to begin a password reset when the reset service is configured.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ForgotPasswordPendingPage() {
  return (
    <main className="auth-page" id="main-content">
      <div className="account-container">
        <section className="account-guard">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Nibrexo Account
          </p>
          <h1>Forgot Password</h1>
          <p>Password reset is not configured yet. No reset email is sent.</p>
          <div className="account-guard__actions">
            <Link className="button button--primary" href={routes.login}>
              Return to login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
