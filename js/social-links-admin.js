/* Authorized Admin/Owner editor for server-persisted social and contact links. */
(() => {
  const form = document.getElementById('social-links-form');
  const editor = document.getElementById('social-links-editor');
  const status = document.getElementById('social-links-status');
  const api = window.NibrexoAdminApi?.settings;
  const auth = window.NibrexoAdminAuth;
  if (!form || !editor || !status || !api || !auth) return;

  const setStatus = (type, message) => {
    status.className = `admin-form-status is-visible${type === 'error' ? ' is-error' : type === 'success' ? ' is-success' : ''}`;
    status.textContent = message;
  };

  const render = (links) => {
    const list = Array.isArray(links) ? links : [];
    editor.replaceChildren();
    list.forEach((link) => {
      const row = document.createElement('section');
      row.className = 'social-links-editor__row';
      row.dataset.platform = link.platform;

      const label = document.createElement('div');
      label.className = 'social-links-editor__platform';
      const heading = document.createElement('h3');
      heading.textContent = link.label;
      const hint = document.createElement('p');
      hint.textContent = link.platform === 'email'
        ? 'Enter an email address. The public footer will use a mailto link.'
        : link.platform === 'whatsapp'
          ? 'Use a valid wa.me or api.whatsapp.com contact URL.'
          : 'Use a valid HTTPS URL.';
      label.append(heading, hint);

      const valueField = document.createElement('label');
      valueField.className = 'social-links-editor__value';
      valueField.textContent = link.platform === 'email' ? 'Email' : 'URL / Contact';
      const value = document.createElement('input');
      value.type = link.platform === 'email' ? 'email' : 'url';
      value.value = link.value || '';
      value.placeholder = link.platform === 'email' ? 'name@example.com' : 'https://';
      value.autocomplete = 'off';
      value.dataset.socialValue = '';
      valueField.appendChild(value);

      const enabledField = document.createElement('label');
      enabledField.className = 'social-links-editor__toggle';
      const enabled = document.createElement('input');
      enabled.type = 'checkbox';
      enabled.checked = Boolean(link.enabled);
      enabled.dataset.socialEnabled = '';
      enabledField.append(enabled, document.createTextNode(' Enabled'));

      const orderField = document.createElement('label');
      orderField.className = 'social-links-editor__order';
      orderField.textContent = 'Order';
      const order = document.createElement('input');
      order.type = 'number';
      order.min = '0';
      order.max = '999';
      order.step = '1';
      order.value = String(link.displayOrder);
      order.dataset.socialOrder = '';
      orderField.appendChild(order);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'button button--outline social-links-editor__remove';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        value.value = '';
        enabled.checked = false;
        value.focus();
      });

      row.append(label, valueField, enabledField, orderField, remove);
      editor.appendChild(row);
    });
  };

  const collect = () => [...editor.querySelectorAll('[data-platform]')].map((row) => ({
    platform: row.dataset.platform,
    value: row.querySelector('[data-social-value]')?.value.trim() || '',
    enabled: Boolean(row.querySelector('[data-social-enabled]')?.checked),
    displayOrder: Number(row.querySelector('[data-social-order]')?.value),
  }));

  const load = async () => {
    setStatus('loading', 'Loading social and contact links…');
    const result = await api.socialLinks();
    if (!result?.ok) {
      setStatus('error', result?.message || 'Unable to load social and contact links.');
      return;
    }
    render(result.data?.links || []);
    status.className = 'admin-form-status';
    status.textContent = '';
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const links = collect();
    if (links.some((link) => !Number.isInteger(link.displayOrder) || link.displayOrder < 0 || link.displayOrder > 999)) {
      setStatus('error', 'Display order must be a whole number between 0 and 999.');
      return;
    }
    setStatus('loading', 'Saving social and contact links…');
    const result = await api.updateSocialLinks({ links });
    if (!result?.ok) {
      setStatus('error', result?.message || 'Social and contact links were not saved.');
      return;
    }
    render(result.data?.links || []);
    setStatus('success', 'Social and contact links saved successfully.');
  });

  let loaded = false;
  auth.subscribe((state) => {
    if (state.status === 'authorized' && !loaded) {
      loaded = true;
      load();
    }
  });
})();
