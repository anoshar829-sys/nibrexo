/* Same-origin automation API adapter. No provider credentials are stored in browser code. */
(function () {
  const request = async (path, options = {}) => {
    try {
      const response = await fetch(path, { credentials: 'include', headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }, ...options });
      const body = await response.json().catch(() => ({}));
      if (response.ok) return { ok: true, state: 'success', data: body.data || null };
      const message = body?.error?.message || 'Automation service is unavailable.';
      if (response.status === 401) return { ok: false, state: 'guest', category: 'unauthorized', message, data: null };
      if (response.status === 403) return { ok: false, state: 'forbidden', message, data: null };
      if (response.status === 404) return { ok: false, state: 'not_found', message, data: null };
      if (response.status === 503) return { ok: false, state: 'not_configured', message, data: null };
      if (response.status >= 500) return { ok: false, state: 'unavailable', message, data: null };
      return { ok: false, state: 'error', message, data: null };
    } catch {
      return { ok: false, state: 'unavailable', message: 'Automation service is unavailable.', data: null };
    }
  };
  const json = (method, path, data) => request(path, { method, body: JSON.stringify(data || {}) });
  window.NibrexoAutomationApi = Object.freeze({
    emailAutomation: { list: () => request('/api/admin/automations') },
    aiAgent: { load: () => request('/api/admin/ai/settings'), save: (data) => json('PATCH', '/api/admin/ai/settings', data) },
    crm: { contacts: () => request('/api/admin/crm/contacts'), contact: (id) => request(`/api/admin/crm/contacts/${encodeURIComponent(id)}`) },
    workflows: { list: () => request('/api/admin/workflows'), save: (data) => json('POST', '/api/admin/workflows', data) },
    forms: { list: () => request('/api/admin/forms'), save: (data) => json('POST', '/api/admin/forms', data), submissions: () => request('/api/admin/forms/submissions') },
    newsletter: { subscribers: () => request('/api/admin/newsletter/subscribers'), save: (data) => json('PATCH', '/api/admin/newsletter/settings', data) },
    integrations: { status: () => request('/api/admin/integrations/status'), configure: (data) => json('POST', '/api/admin/integrations/configure', data) },
  });
})();
