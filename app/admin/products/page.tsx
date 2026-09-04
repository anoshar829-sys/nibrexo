import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { DemoDataNotice } from "@/components/admin/DemoDataNotice";
import { ProductsEmptyState } from "@/components/admin/products/ProductsEmptyState";
import { ProductsExplorer } from "@/components/admin/products/ProductsExplorer";
import { ProductsHeader } from "@/components/admin/products/ProductsHeader";
import { ProductsKpis } from "@/components/admin/products/ProductsKpis";
import { getAdminProducts } from "@/lib/admin/products";
import { canOpenAdmin } from "@/lib/auth/access";
import { getCurrentProfile } from "@/lib/auth/profile";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin Products — Nibrexo",
  robots: { index: false, follow: false },
};

export default async function AdminProductsPage() {
  // Defense in depth: the layout gates the shell, the page gates the data.
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(routes.login);
  }

  if (!canOpenAdmin(profile)) {
    return <AdminAccessDenied />;
  }

  const snapshot = await getAdminProducts();

  return (
    <main className="admin-page" id="main-content">
      <div className="admin-page__inner">
        <ProductsHeader />
        {snapshot.source === "demo" ? <DemoDataNotice /> : null}
        <div className="dashboard-content">
          <ProductsKpis stats={snapshot.stats} currency={snapshot.currency} />
          {snapshot.products.length > 0 ? (
            <ProductsExplorer products={snapshot.products} currency={snapshot.currency} />
          ) : (
            <ProductsEmptyState />
          )}
        </div>
      </div>
    </main>
  );
}
