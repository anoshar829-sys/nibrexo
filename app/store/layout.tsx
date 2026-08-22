import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreSkipLink } from "@/components/store/StoreSkipLink";
import { getCurrentUser } from "@/lib/auth/session";
import { routes } from "@/lib/site";
import "@/css/store.css";

export default async function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();

  return (
    <>
      <StoreSkipLink />
      <StoreHeader accountHref={user ? routes.account : routes.login} signedIn={Boolean(user)} />
      {children}
      <StoreFooter />
    </>
  );
}
