/* Same-origin public content API adapter. Published content only. */
(function () {
  const request = async (path) => {
    try {
      const response = await fetch(path, { credentials: 'include' });
      const body = await response.json().catch(() => ({}));
      if (response.ok) return { ok: true, state: 'success', data: body.data || null };
      const message = body?.error?.message || 'Content service is unavailable.';
      if (response.status === 404) return { ok: false, state: 'not_found', message, data: null };
      if (response.status === 503 || response.status >= 500) return { ok: false, state: 'unavailable', message, data: null };
      return { ok: false, state: 'error', message, data: null };
    } catch {
      return { ok: false, state: 'unavailable', message: 'Content service is unavailable.', data: null };
    }
  };
  window.NibrexoPublicApi = Object.freeze({
    services: () => request('/api/services'),
    service: (slug) => request(`/api/services/${encodeURIComponent(slug)}`),
    documentation: () => request('/api/docs'),
    documentationDetail: (slug) => request(`/api/docs/${encodeURIComponent(slug)}`),
    blog: () => request('/api/blog'),
    blogDetail: (slug) => request(`/api/blog/${encodeURIComponent(slug)}`),
    socialLinks: () => request('/api/settings/social-links'),
  });
})();
