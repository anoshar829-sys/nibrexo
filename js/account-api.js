/* Same-origin account API adapter. It contains no provider credentials or secrets. */
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
      const message = body?.error?.message || 'This account service is unavailable.';
      if (response.status === 401) return { ok: false, state: 'guest', category: 'unauthorized', message, data: null };
      if (response.status === 403) return { ok: false, state: 'forbidden', message, data: null };
      if (response.status === 404) return { ok: false, state: 'not_found', message, data: null };
      if (response.status === 503) return { ok: false, state: 'not_configured', message, data: null };
      if (response.status >= 500) return { ok: false, state: 'unavailable', message, data: null };
      return { ok: false, state: 'error', message, data: null };
    } catch {
      return { ok: false, state: 'unavailable', message: 'Account service is unavailable.', data: null };
    }
  };

  const json = (method, path, data) => request(path, { method, body: JSON.stringify(data || {}) });
  const api = {
    auth: {
      getSession: () => request('/api/auth/me'),
      login: (data) => json('POST', '/api/auth/login', data),
      register: (data) => json('POST', '/api/auth/register', data),
      requestPasswordReset: (data) => json('POST', '/api/auth/forgot-password', data),
      resetPassword: (data) => json('POST', '/api/auth/reset-password', data),
      logout: () => json('POST', '/api/auth/logout'),
    },
    customer: {
      dashboard: () => request('/api/customer/dashboard'),
      profile: () => request('/api/auth/me'),
      orders: () => request('/api/customer/orders'),
      order: (id) => request(`/api/customer/orders/${encodeURIComponent(id)}`),
      downloads: () => request('/api/customer/downloads'),
      licenses: () => request('/api/customer/licenses'),
      savedItems: () => request('/api/customer/saved-items'),
      billing: () => request('/api/customer/billing'),
      tickets: () => request('/api/customer/tickets'),
      ticket: (id) => request(`/api/customer/tickets/${encodeURIComponent(id)}`),
      messages: () => request('/api/customer/messages'),
      message: (id) => request(`/api/customer/messages/${encodeURIComponent(id)}`),
      notifications: () => request('/api/customer/notifications'),
      updateProfile: (data) => json('PATCH', '/api/customer/profile', data),
      updateSettings: (data) => json('PATCH', '/api/customer/settings', data),
      createTicket: (data) => json('POST', '/api/customer/tickets', data),
    },
  };
  window.NibrexoCustomerApi = Object.freeze(api);
})();
