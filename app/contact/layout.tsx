import { BusinessFooter } from "@/components/business/BusinessFooter";
import { BusinessHeader } from "@/components/business/BusinessHeader";
import { getCurrentUser } from "@/lib/auth/session";
import { routes } from "@/lib/site";
import "@/css/business.css";

export default async function ContactLayout({
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
      <BusinessHeader accountHref={user ? routes.account : routes.login} signedIn={Boolean(user)} />
      {children}
      <BusinessFooter />
    </>
  );
}
