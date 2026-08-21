import { AccountAuthFooter } from "@/components/account/AccountAuthFooter";
import { AccountPublicHeader } from "@/components/account/AccountPublicHeader";
import "@/css/account.css";

export default function AccountLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to log in
      </a>
      <AccountPublicHeader />
      {children}
      <AccountAuthFooter />
    </>
  );
}
