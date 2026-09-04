import { PackageIcon } from "@/components/ui/Icons";

export function ProductsEmptyState() {
  return (
    <section className="admin-empty" aria-label="No products yet">
      <div className="admin-empty__inner">
        <span className="admin-empty__icon" aria-hidden="true">
          <PackageIcon />
        </span>
        <h2>No products yet</h2>
        <p>
          The Nibrexo catalog is empty. Once the products backend is connected, you will be able to create your first
          digital product here — it will appear in this list with its status, price, and performance.
        </p>
        <button
          className="button button--primary"
          type="button"
          disabled
          title="Product creation arrives with the products backend — nothing is wired yet."
        >
          Add Product <span className="admin-planned-action__tag" aria-hidden="true">Soon</span>
        </button>
      </div>
    </section>
  );
}
