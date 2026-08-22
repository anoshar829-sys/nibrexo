import Link from "next/link";
import { redirect } from "next/navigation";
import { signOut } from "@/app/account/actions";
import { canOpenAccount } from "@/lib/auth/access";
import { getCurrentProfile } from "@/lib/auth/profile";
import { isStaffRole } from "@/lib/auth/roles";
import { routes } from "@/lib/site";

export const metadata = {
  title: "Account — Nibrexo",
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  if (!profile || !canOpenAccount(profile)) {
    redirect(routes.login);
  }

  return (
    <main className="auth-page" id="main-content">
      <div className="account-container">
        <section className="account-guard">
          <p className="eyebrow">
            <span className="eyebrow-line" />
            Nibrexo Account
          </p>
          <h1>Account</h1>
          <p>Signed in as {profile.email ?? "your account"}.</p>
          <div className="account-guard__actions">
            {isStaffRole(profile.role) ? (
              <Link className="button button--primary" href={routes.admin}>
                Admin
              </Link>
            ) : null}
            <form action={signOut}>
              <button className="button button--outline" type="submit">
                Log Out
              </button>
            </form>
          </div>
        </section>
      </div>
    </main>
  );
}
