import { redirect } from "next/navigation";
import { updateProfile } from "@/app/account/actions";
import { AVATAR_IDS, avatarSrc } from "@/lib/auth/avatars";
import { getCurrentProfile } from "@/lib/auth/profile";
import { routes } from "@/lib/site";
import ProfileForm from "@/components/account/ProfileForm";

export const metadata = { title: "Profile — Nibrexo", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const profile = await getCurrentProfile();
  if (!profile) redirect(routes.login);
  return (
    <main className="auth-page" id="main-content">
      <div className="account-container">
        <section className="account-guard profile-card">
          <p className="eyebrow"><span className="eyebrow-line" /> Profile identity</p>
          <h1>Your profile</h1>
          <p>Choose how your identity appears across Nibrexo.</p>
          <ProfileForm action={updateProfile} displayName={profile.displayName} avatarId={profile.avatarId} avatars={AVATAR_IDS.map((id) => ({ id, src: avatarSrc(id) }))} />
        </section>
      </div>
    </main>
  );
}
