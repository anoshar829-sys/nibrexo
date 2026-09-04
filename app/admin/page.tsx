import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AdminAccessDenied } from "@/components/admin/AdminAccessDenied";
import { DemoDataNotice } from "@/components/admin/overview/DemoDataNotice";
import { OverviewHeader } from "@/components/admin/overview/OverviewHeader";
import { OverviewKpis } from "@/components/admin/overview/OverviewKpis";
import { RecentOrdersCard } from "@/components/admin/overview/RecentOrdersCard";
import { RevenueOverviewCard } from "@/components/admin/overview/RevenueOverviewCard";
import { TopProductsCard } from "@/components/admin/overview/TopProductsCard";
import { canOpenAdmin } from "@/lib/auth/access";
import { getCurrentProfile } from "@/lib/auth/profile";
import { getAdminOverview, parseAdminOverviewRange } from "@/lib/admin/overview";
import { routes } from "@/lib/site";

export const metadata: Metadata = {
  title: "Admin Overview — Nibrexo",
  robots: { index: false, follow: false },
};

type AdminOverviewPageProps = {
  searchParams: Promise<{ range?: string | string[] }>;
};

export default async function AdminOverviewPage({ searchParams }: AdminOverviewPageProps) {
  // Defense in depth: the layout gates the shell, the page gates the data.
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect(routes.login);
  }

  if (!canOpenAdmin(profile)) {
    return <AdminAccessDenied />;
  }

  const params = await searchParams;
  const range = parseAdminOverviewRange(Array.isArray(params.range) ? params.range[0] : params.range);
  const snapshot = await getAdminOverview(range);

  return (
    <main className="admin-page" id="main-content">
      <div className="admin-page__inner">
        <OverviewHeader range={snapshot.range} />
        {snapshot.source === "demo" ? <DemoDataNotice /> : null}
        <div className="dashboard-content">
          <OverviewKpis kpis={snapshot.kpis} range={snapshot.range} currency={snapshot.currency} />
          <RevenueOverviewCard series={snapshot.revenue} range={snapshot.range} />
          <div className="dashboard-two-column">
            <RecentOrdersCard
              orders={snapshot.recentOrders}
              statusTotals={snapshot.orderStatusTotals}
              range={snapshot.range}
              currency={snapshot.currency}
            />
            <TopProductsCard
              products={snapshot.topProducts}
              range={snapshot.range}
              currency={snapshot.currency}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
