import { ProductsSkeleton } from "@/components/admin/products/ProductsSkeleton";

export default function AdminProductsLoading() {
  return (
    <main className="admin-page" id="main-content">
      <div className="admin-page__inner">
        <ProductsSkeleton />
      </div>
    </main>
  );
}
