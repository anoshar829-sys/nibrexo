import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "@/components/account/LoginForm";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Log In — Nibrexo",
  description: "Access your Nibrexo customer account.",
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Log In",
    description: "Access your Nibrexo customer account.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Log In",
    description: "Access your Nibrexo customer account.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
};

export default function LoginPage() {
  return (
    <main className="auth-page" id="main-content">
      <div className="account-container">
        <div className="auth-layout">
          <section className="auth-form-panel">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Nibrexo Account
            </p>
            <h1>Log In</h1>
            <p>Access your Nibrexo customer account.</p>
            <LoginForm />
            <p className="auth-switch">
              New to Nibrexo? <Link href={routes.register}>Create an account</Link>
            </p>
          </section>
          <aside className="auth-context">
            <h2>Your account, in one place.</h2>
            <p>Orders, downloads, licenses, saved items, and support remain connected to your customer account.</p>
            <div className="auth-context__visual" aria-hidden="true" />
          </aside>
        </div>
      </div>
    </main>
  );
}
