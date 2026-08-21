import type { Metadata } from "next";
import Link from "next/link";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Create Account — Nibrexo",
  description: "Create an account when authentication is available.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RegisterPendingPage() {
  return (
    <main className="auth-page" id="main-content">
      <div className="account-container">
        <section className="account-guard">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Nibrexo Account
          </p>
          <h1>Create Account</h1>
          <p>Account registration is not configured yet. No account can be created.</p>
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
