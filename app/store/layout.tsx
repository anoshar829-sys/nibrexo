import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreSkipLink } from "@/components/store/StoreSkipLink";
import { getCurrentProfile } from "@/lib/auth/profile";
import { routes } from "@/lib/site";
import "@/css/store.css";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profile = await getCurrentProfile();

  return (
    <>
      <StoreSkipLink />
      <StoreHeader accountHref={profile ? routes.account : routes.login} signedIn={Boolean(profile)} profile={profile ?? undefined} />
      {children}
      <StoreFooter />
    </>
  );
}
