(() => {
  const body = document.body;
  const auth = window.NibrexoAdminAuth;
  const api = window.NibrexoAdminApi;
  const contracts = window.NibrexoAdminContracts;
  const ADMIN_ROLES = new Set(['owner', 'admin', 'manager', 'support', 'editor']);

  const renderAdminState = (state = auth?.getState?.() || { status: 'guest' }) => {
    const authorized = state.status === 'authorized' && ADMIN_ROLES.has(state.user?.role);
    document.querySelectorAll('[data-admin-guard]').forEach((guard) => {
      const title = guard.querySelector('h1');
      const copy = guard.querySelector('p:not(.eyebrow)');
      const actions = guard.querySelector('.admin-guard__actions');
      const originalTitle = guard.dataset.guardTitle || title?.textContent || 'Admin access required';
      const originalCopy = guard.dataset.guardCopy || copy?.textContent || 'Authenticate with an administrator account to access this area.';
      guard.dataset.guardTitle = originalTitle;
      guard.dataset.guardCopy = originalCopy;
      guard.hidden = authorized;
      if (authorized) return;
      if (state.status === 'loading') {
        if (title) title.textContent = 'Checking administrator access';
        if (copy) copy.textContent = 'Administrator authorization is being checked.';
        if (actions) actions.hidden = true;
      } else if (state.status === 'error') {
        if (title) title.textContent = 'Administrator access required';
        if (copy) copy.textContent = state.error || originalCopy;
        if (actions) actions.hidden = false;
      } else if (state.status === 'unavailable') {
        if (title) title.textContent = originalTitle;
        if (copy) copy.textContent = state.error || contracts?.states.unavailable || originalCopy;
        if (actions) actions.hidden = false;
      } else {
        if (title) title.textContent = originalTitle;
        if (copy) copy.textContent = originalCopy;
        if (actions) actions.hidden = false;
      }
    });
    document.querySelectorAll('[data-admin-data]').forEach((content) => { content.hidden = !authorized; });
    document.querySelectorAll('[data-admin-state]').forEach((element) => { element.textContent = authorized ? 'Administrator' : 'Admin access required'; });
    document.querySelectorAll('.admin-sidebar__logout').forEach((button) => {
      button.disabled = !authorized;
      button.textContent = authorized ? 'Log Out' : 'Logout unavailable';
      button.toggleAttribute('data-admin-logout', authorized);
    });
  };

  const sidebar = document.getElementById('admin-sidebar');
  const toggle = document.getElementById('admin-mobile-toggle');
  const media = window.matchMedia?.('(max-width: 960px)');
  const drawerBackdrop = sidebar ? (() => {
    const existing = document.getElementById('admin-drawer-backdrop');
    if (existing) return existing;
    const element = document.createElement('div');
    element.id = 'admin-drawer-backdrop';
    element.className = 'admin-drawer-backdrop';
    element.setAttribute('aria-hidden', 'true');
    document.body.appendChild(element);
    return element;
  })() : null;
  const drawerClose = sidebar ? (() => {
    const existing = sidebar.querySelector('.admin-drawer-close');
    if (existing) return existing;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'admin-drawer-close';
    button.setAttribute('aria-label', 'Close admin navigation');
    button.textContent = '×';
    sidebar.insertBefore(button, sidebar.firstChild);
    return button;
  })() : null;
  const isMobileDrawer = () => media ? media.matches : window.innerWidth <= 960;
  const drawerFocusable = () => sidebar ? [...sidebar.querySelectorAll('a[href], button:not([disabled])')].filter((element) => !element.hidden) : [];
  const syncSidebar = () => {
    if (!sidebar) return;
    const open = isMobileDrawer() && body.classList.contains('admin-nav-open');
    sidebar.setAttribute('aria-hidden', String(isMobileDrawer() && !open));
    drawerBackdrop?.setAttribute('aria-hidden', String(!open));
    if (drawerClose) drawerClose.hidden = !open;
  };
  const setNav = (open, restoreFocus = false) => {
    if (!sidebar || !toggle) return;
    const nextOpen = Boolean(open && isMobileDrawer());
    body.classList.toggle('admin-nav-open', nextOpen);
    syncSidebar();
    toggle.setAttribute('aria-expanded', String(nextOpen));
    toggle.setAttribute('aria-label', nextOpen ? 'Close admin navigation' : 'Open admin navigation');
    if (nextOpen) window.requestAnimationFrame(() => sidebar.querySelector('nav a, .admin-drawer-close')?.focus());
    else if (restoreFocus) toggle.focus();
  };
  toggle?.addEventListener('click', () => setNav(!body.classList.contains('admin-nav-open'), body.classList.contains('admin-nav-open')));
  drawerClose?.addEventListener('click', () => setNav(false, true));
  drawerBackdrop?.addEventListener('click', () => setNav(false, true));
  sidebar?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setNav(false)));
  document.addEventListener('keydown', (event) => {
    if (!body.classList.contains('admin-nav-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setNav(false, true);
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'PageDown', 'PageUp', 'Home', 'End'].includes(event.key) && sidebar?.contains(document.activeElement)) {
      const amount = Math.max(48, sidebar.clientHeight * .8);
      if (event.key === 'Home') sidebar.scrollTo({ top: 0, behavior: 'auto' });
      else if (event.key === 'End') sidebar.scrollTo({ top: sidebar.scrollHeight, behavior: 'auto' });
      else sidebar.scrollBy({ top: ['ArrowDown', 'PageDown'].includes(event.key) ? amount : -amount, behavior: 'auto' });
      event.preventDefault();
      return;
    }
    if (event.key === 'Tab') {
      const focusable = drawerFocusable();
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  window.addEventListener('pagehide', () => setNav(false));
  window.addEventListener('pageshow', (event) => { if (event.persisted) setNav(false); });
  syncSidebar();
  media?.addEventListener?.('change', () => setNav(false));

  document.addEventListener('click', async (event) => {
    const logout = event.target.closest('[data-admin-logout]');
    if (!logout || logout.disabled) return;
    logout.disabled = true;
    const result = await api?.auth.logout();
    if (result?.ok) {
      auth?.setGuest?.();
      window.location.assign('/account/login.html?return=%2Fadmin%2Findex.html');
    } else {
      logout.disabled = false;
    }
  });

  const renderDataState = (container, state, message = '') => {
    if (!container) return;
      const empty = container.querySelector('[data-admin-empty]');
      const loading = container.querySelector('[data-admin-loading]');
      const error = container.querySelector('[data-admin-error]');
      const loaded = container.querySelectorAll('[data-admin-loaded]');
      if (empty) empty.hidden = state !== 'empty';
      loaded.forEach((element) => { element.hidden = state !== 'loaded'; });
    if (loading) loading.hidden = state !== 'loading';
    if (error) { error.hidden = state !== 'error'; if (message) error.textContent = message; }
  };

  const adminFormPayload = (type, form) => {
    const value = (selector) => form.querySelector(selector)?.value?.trim() || '';
    const status = (selector) => (value(selector) || 'draft').toLowerCase();
    if (type === 'product') return { title: value('#product-name'), slug: value('#product-slug'), shortDescription: value('#product-short'), description: value('#product-full'), priceCents: value('#product-price'), currency: value('#product-currency'), categoryId: value('#product-category'), thumbnail: value('#product-thumbnail'), featured: Boolean(form.querySelector('#product-featured')?.checked), status: status('#product-status') };
    if (type === 'category') return { name: value('#category-name'), slug: value('#category-slug'), description: value('#category-description'), status: status('#category-status') };
    if (type === 'service') return { name: value('#service-name'), slug: value('#service-slug'), shortDescription: value('#service-short'), detailedDescription: value('#service-detail'), category: value('#service-category'), deliverables: value('#service-deliverables'), cta: value('#service-cta'), status: status('#service-status') };
    if (type === 'documentation') return { title: value('#doc-title'), slug: value('#doc-slug'), summary: value('#doc-summary'), content: value('#doc-content'), category: value('#doc-category'), displayOrder: value('#doc-order'), seoTitle: value('#doc-seo-title'), seoDescription: value('#doc-seo-description'), status: status('#doc-status') };
    if (type === 'blog') return { title: value('#post-title'), slug: value('#post-slug'), excerpt: value('#post-excerpt'), content: value('#post-content'), category: value('#post-category'), seoTitle: value('#post-seo-title'), seoDescription: value('#post-seo-description'), status: status('#post-status') };
    if (type === 'media') return { fileName: form.querySelector('#media-file')?.files?.[0]?.name || '', mediaType: value('#media-type'), usageReference: value('#media-usage') };
    if (type === 'ticketReply') return { body: value('#ticket-reply') };
    return {};
  };

  const editorResources = {
    product: api?.products,
    category: api?.categories,
    service: api?.services,
    blog: api?.blog,
    documentation: api?.documentation,
  };
  const editorLabels = { product: 'Product', category: 'Category', service: 'Service', documentation: 'Documentation', blog: 'Blog post', ticketReply: 'Support reply' };
  const savedRecordId = (result, fallback) => result?.data?.product?.id || result?.data?.id || fallback || null;
  const setAdminFormStatus = (status, type, message, error = false) => {
    if (!status) return;
    status.textContent = message;
    status.className = `admin-form-status is-visible ${error ? 'is-error' : 'is-success'}`;
    status.dataset.state = type;
  };

  document.querySelectorAll('[data-admin-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const status = form.querySelector('[data-admin-form-status]');
      if (!form.checkValidity()) {
        setAdminFormStatus(status, 'error', 'Complete the required fields before continuing.', true);
        form.querySelector(':invalid')?.focus();
        return;
      }
      const type = form.dataset.adminForm;
      const editingId = new URLSearchParams(window.location.search).get('id');
      const resource = editorResources[type];
      let result;
      if (type === 'ticketReply') {
        result = editingId
          ? await api?.tickets.reply(editingId, adminFormPayload(type, form))
          : { state: 'not_found', message: 'Select a support ticket before sending a reply.' };
      } else {
        const action = editingId && resource?.update ? resource.update.bind(resource, editingId) : resource?.create;
        const fallback = {
          media: api?.media.upload,
          coupon: api?.coupons?.create,
          campaign: api?.campaigns?.create,
          settings: api?.settings?.update,
          team: api?.team?.invite,
        }[type];
        result = await ((action || fallback)
          ? (action || fallback)(adminFormPayload(type, form))
          : Promise.resolve({ state: 'not_configured', message: 'This backend capability is not configured. No changes were saved.' }));
      }

      if (!result?.ok) {
        setAdminFormStatus(status, result?.state || 'error', result?.message || 'Unable to save this record. No changes were saved.', true);
        return;
      }

      const selectedFiles = [...form.querySelectorAll('input[type="file"]')].some((input) => input.files?.length);
      const fileNote = selectedFiles ? ' File upload is not configured, so selected files were not uploaded.' : '';
      if (type === 'ticketReply') {
        setAdminFormStatus(status, 'success', 'Support reply sent.' + fileNote);
        await hydrateAdminDetail();
        return;
      }

      const recordId = savedRecordId(result, editingId);
      if (recordId && resource?.list) {
        const url = new URL(window.location.href);
        url.searchParams.set('id', recordId);
        window.history.replaceState({}, '', `${url.pathname}${url.search}`);
        await hydrateAdminEditor();
      }
      setAdminFormStatus(status, 'success', `${editorLabels[type] || 'Record'} saved and refreshed from the backend.` + fileNote);
    });
  });

  document.querySelectorAll('[data-admin-form="settings"]').forEach((form) => {
    form.querySelectorAll('input, select, textarea, button[type="submit"]').forEach((control) => { control.disabled = true; });
    const status = form.querySelector('[data-admin-form-status]');
    if (status) {
      status.textContent = 'General Admin settings are not supported by the current backend. Social & Contact Links below remain available.';
      status.className = 'admin-form-status is-visible';
    }
  });

  document.querySelectorAll('[data-confirm]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const dialog = document.getElementById(trigger.dataset.confirm);
      if (!dialog) return;
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else dialog.hidden = false;
    });
  });
  document.querySelectorAll('[data-dialog-close]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = button.closest('dialog');
      if (!dialog) return;
      if (typeof dialog.close === 'function') dialog.close();
      else dialog.hidden = true;
    });
  });
  document.querySelectorAll('[data-dialog-confirm]').forEach((button) => {
    button.addEventListener('click', () => {
      const dialog = button.closest('dialog');
      const status = dialog?.querySelector('[data-dialog-status]');
      if (status) {
        status.hidden = false;
        status.textContent = 'This action requires a connected admin service. No record was changed.';
      }
    });
  });

  const adminLoaders = {
    dashboard: api?.analytics.overview,
    products: api?.products.list,
    categories: api?.categories.list,
    orders: api?.orders.list,
    customers: api?.customers.list,
    services: api?.services.list,
    support: api?.tickets.list,
    documentation: api?.documentation.list,
    blog: api?.blog.list,
    media: api?.media.list,
    payments: api?.payments.list,
    activity: api?.activity.list,
  };

  const tableConfigurations = {
    products: { fields: ['id', 'name', 'category', 'priceLabel', 'status', 'updatedAt'], destination: 'product-editor.html', archive: (row) => api?.products.archive(row.id) },
    categories: { fields: ['id', 'name', 'slug', 'description', 'product_count', 'status'], destination: 'category-editor.html', archive: (row) => api?.categories.archive(row.id) },
    orders: { fields: ['reference', 'customer_name', 'created_at', 'id', 'total_cents', 'payment_status', 'order_status'], destination: 'order-detail.html' },
    customers: { fields: ['id', 'name', 'email', 'status', 'created_at'], destination: 'customer-detail.html' },
    services: { fields: ['id', 'name', 'category', 'short_description', 'status'], destination: 'service-editor.html', archive: (row) => api?.services.archive(row.id) },
    support: { fields: ['id', 'customer_name', 'subject', 'status', 'priority', 'created_at', 'updated_at'], destination: 'ticket-detail.html' },
    documentation: {
      fields: ['id', 'title', 'category', 'display_order', 'status', 'updated_at'], destination: 'documentation-editor.html',
      archive: (row) => api?.documentation.update(row.id, { title: row.title, slug: row.slug, summary: row.summary, content: row.content, category: row.category, displayOrder: row.display_order, seoTitle: row.seo_title, seoDescription: row.seo_description, status: 'archived' }),
    },
    blog: {
      fields: ['id', 'title', 'category', 'author_name', 'status', 'created_at', 'updated_at'], destination: 'blog-editor.html',
      archive: (row) => api?.blog.update(row.id, { title: row.title, slug: row.slug, excerpt: row.excerpt, content: row.content, category: row.category, seoTitle: row.seo_title, seoDescription: row.seo_description, status: 'archived' }),
    },
    activity: { fields: ['created_at', 'user_name', 'action', 'module', 'target', 'status'] },
    payments: { fields: ['id', 'order_id', 'customer_name', 'amount_cents', 'currency', 'status', 'provider_reference', 'created_at'] },
  };

  const updateCollectionSummary = (table, total, visible = total) => {
    const summary = table?.closest('[data-admin-data]')?.querySelector('.admin-pagination-ready');
    if (!summary) return;
    const items = summary.querySelectorAll('span');
    if (items[0]) items[0].textContent = visible === total ? 'All available records are shown.' : 'Filtered records are shown.';
    if (items[1]) items[1].textContent = `${visible} of ${total} ${total === 1 ? 'item' : 'items'}`;
  };

  const bindAdminToolbar = (table) => {
    const container = table?.closest('[data-admin-data]');
    const toolbar = container?.querySelector('.admin-toolbar');
    if (!toolbar || toolbar.dataset.bound === 'true') return;
    toolbar.dataset.bound = 'true';
    const filter = () => {
      const query = toolbar.querySelector('.admin-search')?.value.trim().toLowerCase() || '';
      const selectValues = [...toolbar.querySelectorAll('.admin-select')]
        .map((select) => select.value.trim().toLowerCase())
        .filter((value) => value && !value.startsWith('all '));
      let visible = 0;
      table.querySelectorAll('tbody tr').forEach((row) => {
        const text = row.textContent.toLowerCase();
        const matches = (!query || text.includes(query)) && selectValues.every((value) => text.includes(value));
        row.hidden = !matches;
        if (matches) visible += 1;
      });
      updateCollectionSummary(table, table.querySelectorAll('tbody tr').length, visible);
    };
    toolbar.querySelectorAll('.admin-search, .admin-select').forEach((control) => control.addEventListener('input', filter));
    toolbar.querySelectorAll('.admin-select').forEach((control) => control.addEventListener('change', filter));
  };

  const renderAdminTable = (page, data) => {
    const table = document.querySelector(`[data-admin-table="${page}"]`) || (page === 'payments' ? document.querySelector('.admin-table') : null);
    const rows = Object.values(data || {}).find((value) => Array.isArray(value));
    const config = tableConfigurations[page];
    if (!table || !rows || !rows.length || !config) return false;
    const bodyElement = table.querySelector('tbody');
    bodyElement.replaceChildren();
    rows.forEach((row) => {
      const tr = document.createElement('tr');
      const select = document.createElement('td');
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'admin-checkbox';
      checkbox.setAttribute('aria-label', `Select ${row.id || 'record'}`);
      select.appendChild(checkbox);
      tr.appendChild(select);
      config.fields.forEach((field) => {
        const td = document.createElement('td');
        const value = row[field];
        td.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
        tr.appendChild(td);
      });
      const action = document.createElement('td');
      if (config.destination && row.id) {
        const link = document.createElement('a');
        link.className = 'button--text';
        link.textContent = page === 'orders' || page === 'customers' || page === 'support' ? 'View' : 'Edit';
        link.href = `${config.destination}?id=${encodeURIComponent(row.id)}`;
        action.appendChild(link);
      }
      if (config.archive && row.id && row.status !== 'archived') {
        const archive = document.createElement('button');
        archive.type = 'button';
        archive.className = 'button--text admin-table__archive';
        archive.textContent = action.childElementCount ? 'Archive' : 'Archive record';
        archive.addEventListener('click', async () => {
          if (!window.confirm(`Archive this ${page.slice(0, -1)}?`)) return;
          archive.disabled = true;
          const result = await config.archive(row);
          if (result?.ok) {
            await hydrateAdminPage();
          } else {
            archive.disabled = false;
            const error = table.closest('[data-admin-data]')?.querySelector('[data-admin-error]');
            if (error) {
              error.hidden = false;
              error.textContent = result?.message || 'Unable to archive this record.';
            }
          }
        });
        if (action.childElementCount) action.appendChild(document.createTextNode(' · '));
        action.appendChild(archive);
      }
      if (!action.childElementCount) action.textContent = '—';
      tr.appendChild(action);
      bodyElement.appendChild(tr);
    });
    updateCollectionSummary(table, rows.length);
    bindAdminToolbar(table);
    return true;
  };

  const renderAdminMedia = (data) => {
    const grid = document.querySelector('.admin-media-grid');
    const media = Array.isArray(data?.media) ? data.media : [];
    if (!grid || !media.length) return false;
    grid.replaceChildren(...media.map((record) => {
      const item = document.createElement('article');
      item.className = 'admin-media-item';
      const type = document.createElement('p');
      type.className = 'admin-media-item__type';
      type.textContent = record.media_type || 'MEDIA';
      const title = document.createElement('h2');
      title.textContent = record.file_name || 'Unnamed asset';
      const meta = document.createElement('p');
      meta.textContent = record.status || 'pending';
      const link = document.createElement('a');
      link.className = 'button--text';
      link.href = `media-detail.html?id=${encodeURIComponent(record.id)}`;
      link.textContent = 'View metadata';
      item.append(type, title, meta, link);
      return item;
    }));
    return true;
  };

  const populateCategoryOptions = async () => {
    const select = document.getElementById('product-category');
    if (!select || !api?.categories.list) return;
    const result = await api.categories.list();
    if (!result?.ok) return;
    const current = select.value;
    select.replaceChildren();
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select category';
    select.appendChild(placeholder);
    (result.data?.categories || []).filter((category) => category.status !== 'archived').forEach((category) => {
      const option = document.createElement('option');
      option.value = category.id;
      option.textContent = category.name;
      select.appendChild(option);
    });
    select.value = current;
  };

  const setEditorValue = (selector, value) => {
    const field = document.querySelector(selector);
    if (!field || value === null || value === undefined) return;
    if (field.tagName === 'SELECT') {
      const wanted = String(value).toLowerCase();
      const option = [...field.options].find((item) => String(item.value).toLowerCase() === wanted || String(item.textContent).trim().toLowerCase() === wanted);
      if (option) field.value = option.value;
      return;
    }
    field.value = String(value);
  };

  const editorConfigs = {
    'product-editor.html': {
      list: api?.products.list,
      key: 'products',
      fill: (record) => {
        setEditorValue('#product-name', record.name);
        setEditorValue('#product-slug', record.slug);
        setEditorValue('#product-short', record.shortDescription);
        setEditorValue('#product-full', record.fullDescription);
        setEditorValue('#product-price', record.priceCents);
        setEditorValue('#product-currency', record.currency);
        setEditorValue('#product-category', record.categoryId);
        setEditorValue('#product-thumbnail', record.image);
        setEditorValue('#product-status', record.status);
        const featured = document.querySelector('#product-featured');
        if (featured) featured.checked = Boolean(record.featured);
      },
    },
    'category-editor.html': {
      list: api?.categories.list,
      key: 'categories',
      fill: (record) => {
        setEditorValue('#category-name', record.name);
        setEditorValue('#category-slug', record.slug);
        setEditorValue('#category-description', record.description);
        setEditorValue('#category-status', record.status);
      },
    },
    'service-editor.html': {
      list: api?.services.list,
      key: 'services',
      fill: (record) => {
        setEditorValue('#service-name', record.name);
        setEditorValue('#service-slug', record.slug);
        setEditorValue('#service-category', record.category);
        setEditorValue('#service-status', record.status);
        setEditorValue('#service-cta', record.cta);
        setEditorValue('#service-short', record.short_description);
        setEditorValue('#service-detail', record.detailed_description);
        setEditorValue('#service-deliverables', record.deliverables);
      },
    },
    'documentation-editor.html': {
      list: api?.documentation.list,
      key: 'documentation',
      fill: (record) => {
        setEditorValue('#doc-title', record.title);
        setEditorValue('#doc-slug', record.slug);
        setEditorValue('#doc-summary', record.summary);
        setEditorValue('#doc-content', record.content);
        setEditorValue('#doc-category', record.category);
        setEditorValue('#doc-order', record.display_order);
        setEditorValue('#doc-seo-title', record.seo_title);
        setEditorValue('#doc-seo-description', record.seo_description);
        setEditorValue('#doc-status', record.status);
      },
    },
    'blog-editor.html': {
      list: api?.blog.list,
      key: 'posts',
      fill: (record) => {
        setEditorValue('#post-title', record.title);
        setEditorValue('#post-slug', record.slug);
        setEditorValue('#post-excerpt', record.excerpt);
        setEditorValue('#post-content', record.content);
        setEditorValue('#post-category', record.category);
        setEditorValue('#post-seo-title', record.seo_title);
        setEditorValue('#post-seo-description', record.seo_description);
        setEditorValue('#post-status', record.status);
      },
    },
  };

  const hydrateAdminEditor = async () => {
    const config = editorConfigs[window.location.pathname.split('/').pop()];
    const id = new URLSearchParams(window.location.search).get('id');
    if (!config || !id || !config.list) return false;
    const result = await config.list();
    const status = document.querySelector('[data-admin-form-status]');
    if (!result?.ok) {
      if (status) {
        status.textContent = result?.message || 'Unable to load this record.';
        status.className = 'admin-form-status is-visible is-error';
      }
      return true;
    }
    const record = (result.data?.[config.key] || []).find((item) => item.id === id);
    if (!record) {
      if (status) {
        status.textContent = 'Record not found.';
        status.className = 'admin-form-status is-visible is-error';
      }
      return true;
    }
    config.fill(record);
    return true;
  };

  const adminDetailConfigs = {
    'order-detail.html': {
      load: (id) => api?.orders.detail(id),
      rows: (data) => data?.order ? [
        ['Order', data.order.reference || data.order.id],
        ['Customer', data.order.customer_name || data.order.customer_email || '—'],
        ['Payment', data.order.payment_status || 'pending'],
        ['Status', data.order.order_status || 'pending'],
        ['Total', data.order.total_cents === null || data.order.total_cents === undefined ? '—' : `${data.order.currency || ''} ${data.order.total_cents}`],
        ['Items', (data.items || []).map((item) => item.product_title_snapshot || item.product_id).join(', ') || '—'],
      ] : null,
    },
    'customer-detail.html': {
      load: (id) => api?.customers.detail(id),
      rows: (data) => data?.customer ? [
        ['Customer', data.customer.name || data.customer.id],
        ['Email', data.customer.email || '—'],
        ['Status', data.customer.status || '—'],
        ['Orders', data.counts?.orders ?? 0],
        ['Downloads', data.counts?.downloads ?? 0],
        ['Licenses', data.counts?.licenses ?? 0],
        ['Tickets', data.counts?.tickets ?? 0],
      ] : null,
    },
    'ticket-detail.html': {
      load: (id) => api?.tickets.detail(id),
      rows: (data) => data?.ticket ? [
        ['Subject', data.ticket.subject],
        ['Customer', data.ticket.customer_name || data.ticket.customer_email || '—'],
        ['Status', data.ticket.status || 'open'],
        ['Priority', data.ticket.priority || 'normal'],
        ['Messages', (data.messages || []).map((message) => message.body).join(' · ') || '—'],
      ] : null,
    },
    'media-detail.html': {
      load: async (id) => {
        const result = await api?.media.list();
        if (!result?.ok) return result;
        const media = (result.data?.media || []).find((item) => item.id === id);
        return media ? { ok: true, data: { media } } : { ok: false, state: 'not_found', message: 'Media record not found.' };
      },
      rows: (data) => data?.media ? [
        ['File', data.media.file_name],
        ['Type', data.media.media_type],
        ['Status', data.media.status],
        ['Visibility', data.media.visibility],
        ['Size', data.media.size_bytes ?? '—'],
      ] : null,
    },
  };

  const renderAdminDetail = (container, rows) => {
    if (!container || !rows) return false;
    container.querySelector('[data-admin-detail]')?.remove();
    const wrap = document.createElement('div');
    wrap.className = 'admin-table-wrap';
    wrap.dataset.adminDetail = '';
    const table = document.createElement('table');
    table.className = 'admin-table';
    const tableBody = document.createElement('tbody');
    rows.forEach(([label, value]) => {
      const row = document.createElement('tr');
      const heading = document.createElement('th');
      heading.scope = 'row';
      heading.textContent = label;
      const cell = document.createElement('td');
      cell.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
      row.append(heading, cell);
      tableBody.appendChild(row);
    });
    table.appendChild(tableBody);
    wrap.appendChild(table);
    const empty = container.querySelector('[data-admin-empty]');
    if (empty) empty.before(wrap);
    else container.appendChild(wrap);
    return true;
  };

  const hydrateAdminDetail = async () => {
    const config = adminDetailConfigs[window.location.pathname.split('/').pop()];
    const id = new URLSearchParams(window.location.search).get('id');
    const container = document.querySelector('[data-admin-data]');
    if (!config || !id || !container || !config.load) return false;
    renderDataState(container, 'loading');
    const result = await config.load(id);
    if (!result?.ok) {
      renderDataState(container, 'error', result?.message || 'Unable to load this record.');
      return true;
    }
    const rendered = renderAdminDetail(container, config.rows(result.data || {}));
    renderDataState(container, rendered ? 'loaded' : 'empty');
    return true;
  };

  const dashboardMoney = (cents, currency, allowZero = false) => {
    if (cents === null || cents === undefined) return '—';
    if (!currency) return cents === 0 && allowZero ? '$0' : `${cents / 100}`;
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(cents / 100);
    } catch {
      return `${currency} ${(cents / 100).toFixed(2)}`;
    }
  };

  const dashboardDate = (value) => value ? String(value).slice(0, 10) : '—';

  const setDashboardCollection = (wrapSelector, emptySelector, rows, renderRow) => {
    const wrap = document.querySelector(wrapSelector);
    const empty = document.querySelector(emptySelector);
    const bodyElement = wrap?.querySelector('tbody');
    if (!wrap || !empty || !bodyElement) return;
    bodyElement.replaceChildren();
    if (!rows.length) {
      wrap.hidden = true;
      empty.hidden = false;
      return;
    }
    rows.forEach((row) => bodyElement.appendChild(renderRow(row)));
    wrap.hidden = false;
    empty.hidden = true;
  };

  const dashboardCell = (value) => {
    const cell = document.createElement('td');
    cell.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
    return cell;
  };

  const renderDashboardChart = (revenue) => {
    const chart = document.querySelector('[data-dashboard-revenue-chart]');
    const empty = document.querySelector('[data-dashboard-revenue-empty]');
    const subtitle = document.querySelector('[data-dashboard-revenue-subtitle]');
    if (!chart || !empty) return;
    const series = Array.isArray(revenue?.series) ? revenue.series : [];
    if (subtitle) subtitle.textContent = revenue?.currency ? `Paid sales in ${revenue.currency}` : 'No sales yet';
    chart.replaceChildren();
    if (!series.length) {
      chart.hidden = true;
      empty.hidden = false;
      return;
    }
    chart.hidden = false;
    empty.hidden = true;
    const width = 600;
    const height = 190;
    const padding = { top: 18, right: 12, bottom: 30, left: 12 };
    const values = series.map((point) => point.totalCents || 0);
    const max = Math.max(...values, 1);
    const x = (index) => padding.left + (series.length === 1 ? (width - padding.left - padding.right) / 2 : index * ((width - padding.left - padding.right) / (series.length - 1)));
    const y = (value) => padding.top + (height - padding.top - padding.bottom) * (1 - value / max);
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Revenue overview based on paid orders');
    const linePoints = series.map((point, index) => `${x(index)},${y(point.totalCents || 0)}`).join(' ');
    const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    area.setAttribute('class', 'dashboard-chart__area');
    area.setAttribute('d', `M ${x(0)} ${height - padding.bottom} L ${linePoints.replace(/ /g, ' L ')} L ${x(series.length - 1)} ${height - padding.bottom} Z`);
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
    line.setAttribute('class', 'dashboard-chart__line');
    line.setAttribute('points', linePoints);
    svg.append(area, line);
    series.forEach((point, index) => {
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('class', 'dashboard-chart__axis');
      label.setAttribute('x', String(x(index)));
      label.setAttribute('y', String(height - 8));
      label.setAttribute('text-anchor', index === 0 ? 'start' : index === series.length - 1 ? 'end' : 'middle');
      label.textContent = point.label;
      svg.appendChild(label);
    });
    chart.appendChild(svg);
  };

  const renderDashboard = (data) => {
    const dashboard = data.dashboard || {};
    const revenue = dashboard.revenue || {};
    const orders = dashboard.orders || {};
    const customers = dashboard.customers || {};
    const products = dashboard.products || {};
    const health = dashboard.storeHealth || {};
    const kpis = {
      revenue: dashboardMoney(revenue.totalCents, revenue.currency, true),
      orders: orders.total || 0,
      customers: customers.total || 0,
      products: products.published || 0,
    };
    document.querySelectorAll('[data-dashboard-kpi]').forEach((metric) => {
      metric.textContent = kpis[metric.dataset.dashboardKpi] ?? '—';
    });
    document.querySelectorAll('[data-dashboard-order]').forEach((metric) => {
      metric.textContent = orders[metric.dataset.dashboardOrder] || 0;
    });
    document.querySelectorAll('[data-dashboard-health]').forEach((metric) => {
      metric.textContent = health[metric.dataset.dashboardHealth] || 0;
    });
    renderDashboardChart(revenue);
    setDashboardCollection('[data-dashboard-orders-wrap]', '[data-dashboard-orders-empty]', dashboard.recentOrders || [], (order) => {
      const row = document.createElement('tr');
      row.append(dashboardCell(order.reference || order.id), dashboardCell(order.customer_name), dashboardCell(dashboardDate(order.created_at)), dashboardCell(dashboardMoney(order.total_cents, order.currency)), dashboardCell(order.order_status || order.payment_status));
      const action = document.createElement('td');
      const link = document.createElement('a');
      link.href = `order-detail.html?id=${encodeURIComponent(order.id)}`;
      link.textContent = 'View';
      action.appendChild(link);
      row.appendChild(action);
      return row;
    });
    setDashboardCollection('[data-dashboard-customers-wrap]', '[data-dashboard-customers-empty]', customers.recent || [], (customer) => {
      const row = document.createElement('tr');
      row.append(dashboardCell(customer.name), dashboardCell(customer.email), dashboardCell(dashboardDate(customer.created_at)), dashboardCell(customer.order_count || 0), dashboardCell(customer.status));
      return row;
    });
    setDashboardCollection('[data-dashboard-products-wrap]', '[data-dashboard-products-empty]', products.top || [], (product) => {
      const row = document.createElement('tr');
      row.append(dashboardCell(product.product_name), dashboardCell(product.sales_count || 0), dashboardCell(dashboardMoney(product.revenue_cents, product.currency)), dashboardCell(product.product_status));
      return row;
    });
    const activityList = document.querySelector('[data-dashboard-recent-activity]');
    const activityEmpty = document.querySelector('[data-dashboard-activity-empty]');
    const activity = Array.isArray(dashboard.recentActivity) ? dashboard.recentActivity : [];
    if (activityList && activityEmpty) {
      activityList.replaceChildren();
      if (!activity.length) {
        activityList.hidden = true;
        activityEmpty.hidden = false;
      } else {
        activity.forEach((entry) => {
          const item = document.createElement('li');
          const copy = document.createElement('div');
          const title = document.createElement('strong');
          title.textContent = entry.action || 'Activity recorded';
          const detail = document.createElement('span');
          detail.textContent = [entry.user_name, entry.module, entry.target].filter(Boolean).join(' · ') || 'Nibrexo';
          const time = document.createElement('time');
          time.textContent = dashboardDate(entry.created_at);
          copy.append(title, detail);
          item.append(copy, time);
          activityList.appendChild(item);
        });
        activityList.hidden = false;
        activityEmpty.hidden = true;
      }
    }
  };

  const setupDashboardControls = () => {
    const period = document.querySelector('[data-dashboard-period]');
    const refresh = document.querySelector('[data-dashboard-refresh]');
    if (period && !period.dataset.bound) {
      period.dataset.bound = 'true';
      period.addEventListener('change', () => hydrateAdminPage());
    }
    if (refresh && !refresh.dataset.bound) {
      refresh.dataset.bound = 'true';
      refresh.addEventListener('click', () => hydrateAdminPage());
    }
  };

  const hydrateAdminPage = async () => {
    const page = body.dataset.adminPage;
    await populateCategoryOptions();
    if (await hydrateAdminEditor()) return;
    if (await hydrateAdminDetail()) return;
    const loader = adminLoaders[page];
    const container = document.querySelector('[data-admin-data]');
    if (!loader || !container || auth?.getState?.().status !== 'authorized') return;
    if (page === 'dashboard') {
      setupDashboardControls();
      renderDataState(container, 'loading');
      const period = document.querySelector('[data-dashboard-period]')?.value || '30d';
      const result = await api?.analytics.overview(period);
      if (!result?.ok) {
        if (result?.state === 'guest') auth?.setGuest?.();
        else renderDataState(container, 'error', result?.message || 'Unable to load dashboard data.');
        return;
      }
      renderDashboard(result.data || {});
      renderDataState(container, 'loaded');
      return;
    }
    renderDataState(container, 'loading');
    const result = await loader();
    if (!result?.ok) {
      if (result?.state === 'guest') auth?.setGuest?.();
      else renderDataState(container, 'error', result?.message || 'Unable to load this management data.');
      return;
    }
    const data = result.data || {};
    const collection = Object.values(data).find((value) => Array.isArray(value));
    const rendered = page === 'media' ? renderAdminMedia(data) : renderAdminTable(page, data);
    renderDataState(container, rendered || (collection && collection.length) ? 'loaded' : 'empty');
  };

  window.NibrexoAdmin = Object.freeze({
    getState: () => auth?.getState?.() || { status: 'guest' },
    setAuthorized: (user) => auth?.setAuthorized?.(user),
    setGuest: () => auth?.setGuest?.(),
    setLoading: () => auth?.setLoading?.(),
    setUnavailable: (message) => auth?.setUnavailable?.(message),
    setError: (message) => auth?.setError?.(message),
    setDataState: (selector, state, message) => renderDataState(document.querySelector(selector), state, message),
  });

  if (auth?.subscribe) {
    auth.subscribe((state) => {
      renderAdminState(state);
      if (state.status === 'authorized') hydrateAdminPage();
    });
  } else renderAdminState();

  const bootstrapAdminSession = async () => {
    if (!auth?.setLoading || !api?.auth.getAdminSession) return;
    auth.setLoading();
    const result = await api.auth.getAdminSession();
    if (result?.ok && result.data?.user) {
      auth.setAuthorized(result.data.user);
    } else if (result?.state === 'guest') {
      auth.setGuest();
    } else if (result?.state === 'error' || result?.state === 'forbidden' || result?.state === 'not_found') {
      auth.setError(result.message);
    } else {
      auth.setUnavailable(result?.message || 'Admin authentication service is not configured.');
    }
  };
  bootstrapAdminSession();
})();
