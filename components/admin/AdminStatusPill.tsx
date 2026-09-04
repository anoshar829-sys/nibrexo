import type { AdminOrderStatus } from "@/lib/admin/overview";

const STATUS_LABELS: Record<AdminOrderStatus, string> = {
  pending: "Pending",
  processing: "Processing",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function AdminStatusPill({ status }: Readonly<{ status: AdminOrderStatus }>) {
  return <span className={`admin-status admin-status--${status}`}>{STATUS_LABELS[status]}</span>;
}
