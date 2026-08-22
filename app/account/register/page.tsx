import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/account/RegisterForm";
import { getCurrentUser } from "@/lib/auth/session";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Create Account — Nibrexo",
  description: "Create an account when authentication is available.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) {
    redirect(routes.account);
  }

  return (
    <main className="auth-page" id="main-content">
      <div className="account-container">
        <div className="auth-layout">
          <section className="auth-form-panel">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Nibrexo Account
            </p>
            <h1>Create Account</h1>
            <p>Create an account when authentication is available.</p>
            <RegisterForm />
            <p className="auth-switch">
              Already have an account? <Link href={routes.login}>Log in</Link>
            </p>
          </section>
          <aside className="auth-context">
            <h2>A clear customer experience.</h2>
            <p>Your account is designed to keep purchases, downloads, licenses, and account details organized.</p>
            <div className="auth-context__visual" aria-hidden="true" />
          </aside>
        </div>
      </div>
    </main>
  );
}
