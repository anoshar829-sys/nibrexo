import { redirect } from "next/navigation";
import { updateProfile } from "@/app/account/actions";
import ProfileForm from "@/components/account/ProfileForm";
import { getCurrentProfile } from "@/lib/auth/profile";
import { routes } from "@/lib/site";

export const metadata = { title: "Profile — Nibrexo", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect(routes.login);
  return (
    <main className="auth-page" id="main-content">
      <div className="account-container">
        <section className="account-guard profile-card">
          <p className="eyebrow">
            <span className="eyebrow-line" /> Profile identity
          </p>
          <h1>Your profile</h1>
          <p>Choose how your identity appears across Nibrexo.</p>
          <ProfileForm action={updateProfile} displayName={profile.displayName} avatarUrl={profile.avatarUrl} />
        </section>
      </div>
    </main>
  );
}
