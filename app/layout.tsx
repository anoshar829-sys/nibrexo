import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "@/styles/globals.css";

export const dynamic = "force-dynamic";

const siteUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Nibrexo — Visual Understanding",
  description:
    "Nibrexo communicates understanding through visual communication and purposeful visual systems.",
  applicationName: "Nibrexo",
  icons: {
    icon: "/assets/favicon.png",
  },
  openGraph: {
    type: "website",
    title: "Nibrexo — Visual Understanding",
    description:
      "Nibrexo communicates understanding through visual communication and purposeful visual systems.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nibrexo — Visual Understanding",
    description:
      "Nibrexo communicates understanding through visual communication and purposeful visual systems.",
    images: ["/assets/nibrexo-primary-header.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await headers();

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
