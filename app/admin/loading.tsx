import { AdminOverviewSkeleton } from "@/components/admin/overview/AdminOverviewSkeleton";

export default function AdminOverviewLoading() {
  return (
    <main className="admin-page" id="main-content">
      <div className="admin-page__inner">
        <AdminOverviewSkeleton />
      </div>
    </main>
  );
}
