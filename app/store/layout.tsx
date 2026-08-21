import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreSkipLink } from "@/components/store/StoreSkipLink";
import "@/css/store.css";

export default function StoreLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <StoreSkipLink />
      <StoreHeader />
      {children}
      <StoreFooter />
    </>
  );
}
