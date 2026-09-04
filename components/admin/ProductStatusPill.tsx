import { ADMIN_PRODUCT_STATUS_LABELS, type AdminProductStatus } from "@/lib/admin/products";

export function ProductStatusPill({ status }: Readonly<{ status: AdminProductStatus }>) {
  return <span className={`admin-status admin-status--${status}`}>{ADMIN_PRODUCT_STATUS_LABELS[status]}</span>;
}
