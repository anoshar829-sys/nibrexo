import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCurrentProfile } from "@/lib/auth/profile";
import { routes } from "@/lib/site";
import "@/styles/globals.css";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header accountHref={profile ? routes.account : routes.login} signedIn={Boolean(profile)} profile={profile ?? undefined} />
      {children}
      <Footer />
    </>
  );
}
