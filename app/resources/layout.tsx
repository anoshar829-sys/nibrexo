import { BusinessFooter } from "@/components/business/BusinessFooter";
import { BusinessHeader } from "@/components/business/BusinessHeader";
import "@/css/business.css";

export default function ResourcesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to resources
      </a>
      <BusinessHeader />
      {children}
      <BusinessFooter />
    </>
  );
}
