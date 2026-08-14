/* Same-origin public Store API adapter. Payment remains unconfigured until a provider is connected. */
(function () {
  const request = async (path, options = {}) => {
    try {
      const response = await fetch(path, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        ...options,
      });
      const body = await response.json().catch(() => ({}));
      if (response.ok) return { ok: true, state: 'success', data: body.data || null };
      const message = body?.error?.message || 'Store service is unavailable.';
      if (response.status === 401) return { ok: false, state: 'guest', category: 'unauthorized', message, data: null };
      if (response.status === 403) return { ok: false, state: 'forbidden', message, data: null };
      if (response.status === 404) return { ok: false, state: 'not_found', message, data: null };
      if (response.status === 503) return { ok: false, state: 'not_configured', message, data: null };
      if (response.status >= 500) return { ok: false, state: 'unavailable', message, data: null };
      return { ok: false, state: 'error', message, data: null };
    } catch {
      return { ok: false, state: 'unavailable', message: 'Store service is unavailable.', data: null };
    }
  };
  window.NibrexoStoreApi = Object.freeze({
    listProducts: () => request('/api/products'),
    listCategories: () => request('/api/categories'),
    getProduct: (slug) => request(`/api/products/${encodeURIComponent(slug)}`),
    createCheckout: (items, idempotencyKey) => request('/api/checkout', { method: 'POST', headers: { 'Idempotency-Key': idempotencyKey }, body: JSON.stringify({ items, idempotencyKey }) }),
  });
})();
