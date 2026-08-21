import { LegalFooter } from "@/components/legal/LegalFooter";
import { LegalHeader } from "@/components/legal/LegalHeader";
import "@/css/legal.css";

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div id="top">
      <LegalHeader />
      {children}
      <LegalFooter />
    </div>
  );
}
