import { BusinessFooter } from "@/components/business/BusinessFooter";
import { BusinessHeader } from "@/components/business/BusinessHeader";
import { getCurrentProfile } from "@/lib/auth/profile";
import { routes } from "@/lib/site";
import "@/css/business.css";

export default async function AboutLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to about Nibrexo
      </a>
      <BusinessHeader accountHref={profile ? routes.account : routes.login} signedIn={Boolean(profile)} profile={profile ?? undefined} />
      {children}
      <BusinessFooter />
    </>
  );
}
