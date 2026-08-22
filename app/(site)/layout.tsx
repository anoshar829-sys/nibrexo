import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { getCurrentUser } from "@/lib/auth/session";
import { routes } from "@/lib/site";
import "@/styles/globals.css";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <Header accountHref={user ? routes.account : routes.login} signedIn={Boolean(user)} />
      {children}
      <Footer />
    </>
  );
}
