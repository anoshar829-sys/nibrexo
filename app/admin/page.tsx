import Link from "next/link";
import { redirect } from "next/navigation";
import { canOpenAdmin } from "@/lib/auth/access";
import { getCurrentProfile } from "@/lib/auth/profile";
import { routes } from "@/lib/site";

export const metadata = {
  title: "Admin — Nibrexo",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(routes.login);
  }

  if (!canOpenAdmin(profile)) {
    return (
      <main className="auth-page" id="main-content">
        <div className="account-container">
          <section className="account-guard">
            <p className="eyebrow">
              <span className="eyebrow-line" />
              Nibrexo Admin
            </p>
            <h1>Access denied</h1>
            <p>This area is limited to the Nibrexo owner. Your customer account cannot open admin routes.</p>
            <div className="account-guard__actions">
              <Link className="button button--primary" href={routes.account}>
                Return to account
              </Link>
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-page" id="main-content">
      <div className="account-container">
        <section className="account-guard">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Nibrexo Admin
          </p>
          <h1>Admin</h1>
          <p>
            Signed in as {profile.email ?? "the owner"}. The full admin dashboard is not built yet. This route is the
            protected owner foundation.
          </p>
          <div className="account-guard__actions">
            <Link className="button button--outline" href={routes.account}>
              Customer account
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
