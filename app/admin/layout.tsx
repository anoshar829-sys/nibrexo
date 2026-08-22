import { AccountAuthFooter } from "@/components/account/AccountAuthFooter";
import { AccountPublicHeader } from "@/components/account/AccountPublicHeader";
import "@/css/account.css";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to admin
      </a>
      <AccountPublicHeader />
      {children}
      <AccountAuthFooter />
    </>
  );
}
