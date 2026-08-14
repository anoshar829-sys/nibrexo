/* Same-origin Admin API adapter. It contains no credentials or provider secrets. */
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
      const message = body?.error?.message || 'Admin service is unavailable.';
      if (response.status === 401) return { ok: false, state: 'guest', category: 'unauthorized', message, data: null };
      if (response.status === 403) return { ok: false, state: 'forbidden', message, data: null };
      if (response.status === 404) return { ok: false, state: 'not_found', message, data: null };
      if (response.status === 503) return { ok: false, state: 'not_configured', message, data: null };
      if (response.status >= 500) return { ok: false, state: 'unavailable', message, data: null };
      return { ok: false, state: 'error', message, data: null };
    } catch {
      return { ok: false, state: 'unavailable', message: 'Admin service is unavailable.', data: null };
    }
  };
  const json = (method, path, data) => request(path, { method, body: JSON.stringify(data || {}) });
  const api = {
    auth: {
      getAdminSession: () => request('/api/auth/me'),
      logout: () => json('POST', '/api/auth/logout'),
    },
    analytics: { overview: (period = '30d') => request(`/api/admin/dashboard?period=${encodeURIComponent(period)}`) },
    products: { list: () => request('/api/admin/products'), create: (data) => json('POST', '/api/admin/products', data), update: (id, data) => json('PATCH', `/api/admin/products/${encodeURIComponent(id)}`, data), archive: (id) => request(`/api/admin/products/${encodeURIComponent(id)}`, { method: 'DELETE' }), files: (id) => request(`/api/admin/products/${encodeURIComponent(id)}/files`) },
    categories: { list: () => request('/api/admin/categories'), create: (data) => json('POST', '/api/admin/categories', data), update: (id, data) => json('PATCH', `/api/admin/categories/${encodeURIComponent(id)}`, data), archive: (id) => request(`/api/admin/categories/${encodeURIComponent(id)}`, { method: 'DELETE' }) },
    orders: { list: () => request('/api/admin/orders'), detail: (id) => request(`/api/admin/orders/${encodeURIComponent(id)}`) },
    customers: { list: () => request('/api/admin/customers'), detail: (id) => request(`/api/admin/customers/${encodeURIComponent(id)}`) },
    services: { list: () => request('/api/admin/services'), create: (data) => json('POST', '/api/admin/services', data), update: (id, data) => json('PATCH', `/api/admin/services/${encodeURIComponent(id)}`, data), archive: (id) => request(`/api/admin/services/${encodeURIComponent(id)}`, { method: 'DELETE' }) },
    tickets: { list: () => request('/api/admin/tickets'), detail: (id) => request(`/api/admin/tickets/${encodeURIComponent(id)}`), reply: (id, data) => json('POST', `/api/admin/tickets/${encodeURIComponent(id)}/messages`, data) },
    documentation: { list: () => request('/api/admin/documentation'), create: (data) => json('POST', '/api/admin/documentation', data), update: (id, data) => json('PATCH', `/api/admin/documentation/${encodeURIComponent(id)}`, data) },
    blog: { list: () => request('/api/admin/blog'), create: (data) => json('POST', '/api/admin/blog', data), update: (id, data) => json('PATCH', `/api/admin/blog/${encodeURIComponent(id)}`, data) },
    media: { list: () => request('/api/admin/media'), upload: (data) => json('POST', '/api/admin/media', data) },
    payments: { list: () => request('/api/admin/payments') },
    settings: {
      socialLinks: () => request('/api/admin/settings/social-links'),
      updateSocialLinks: (data) => json('PATCH', '/api/admin/settings/social-links', data),
    },
    activity: { list: () => request('/api/admin/activity') },
  };
  window.NibrexoAdminApi = Object.freeze(api);
})();
