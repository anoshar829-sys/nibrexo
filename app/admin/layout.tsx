import { redirect } from "next/navigation";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { AdminShell } from "@/components/admin/AdminShell";
import { canOpenAdmin } from "@/lib/auth/access";
import { getCurrentProfile } from "@/lib/auth/profile";
import { routes } from "@/lib/site";
import "@/css/admin.css";

// Server-side authorization for the whole admin area: guests are sent to
// sign-in, customer accounts get an explicit denial, and only owner/admin
// profiles receive the admin shell. Pages re-check independently.
export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(routes.login);
  }

  if (!canOpenAdmin(profile)) {
    return <AdminAccessDenied />;
  }

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to admin
      </a>
      <AdminShell
        profile={{
          displayName: profile.displayName,
          email: profile.email,
          role: profile.role,
          avatarId: profile.avatarId,
        }}
      >
        {children}
      </AdminShell>
    </>
  );
}
