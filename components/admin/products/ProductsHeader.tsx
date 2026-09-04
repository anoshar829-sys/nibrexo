export function ProductsHeader() {
  return (
    <header className="admin-page-header">
      <div>
        <h1>Products</h1>
        <p>
          The Nibrexo catalog — publishing status, pricing, and lifetime performance for every digital product.
        </p>
      </div>
      <div className="admin-actions">
        <button
          className="button button--primary"
          type="button"
          disabled
          title="Product creation arrives with the products backend — nothing is wired yet."
        >
          Add Product <span className="admin-planned-action__tag" aria-hidden="true">Soon</span>
        </button>
        <p className="admin-header-hint">
          Editing, publishing, and storefront links connect once the products backend is live.
        </p>
      </div>
    </header>
  );
}
