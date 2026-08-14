(() => {
  const body = document.body;
  const auth = window.NibrexoAuth;
  const api = window.NibrexoCustomerApi;
  const contracts = window.NibrexoCustomerContracts;
  const pageDataState = new Map();
  const ADMIN_ROLES = new Set(['owner', 'admin', 'manager', 'support', 'editor']);
  const isAdministrator = (user) => ADMIN_ROLES.has(user?.role);
  const defaultAuthenticatedDestination = (user) => isAdministrator(user) ? '../admin/index.html' : 'dashboard.html';

  const isDevelopmentPreviewHost = () => /\.e2b\.app$/i.test(window.location.hostname);

  const submitPreviewForm = (form, endpoint) => {
    form.method = 'post';
    form.action = endpoint;
    form.target = '_self';
    form.submit();
  };

  const verifySessionAfterAuthentication = async () => {
    const session = await api?.auth.getSession?.();
    if (session?.ok && session.data?.user) {
      auth?.setAuthenticated?.(session.data.user);
      return session.data.user;
    }
    auth?.setGuest?.();
    return null;
  };

  const showStatus = (form, type, message) => {
    const status = form.querySelector('[data-form-status]');
    if (!status) return;
    form.classList.remove('is-loading', 'is-error', 'is-unavailable', 'is-success', 'is-not_configured', 'is-forbidden', 'is-not_found');
    form.setAttribute('aria-busy', String(type === 'loading'));
    status.className = 'form-status is-visible';
    status.classList.add(`is-${type}`);
    status.textContent = message;
    form.classList.add(`is-${type}`);
  };

  const setFormSubmitting = (form, submitting, message = '') => {
    const submit = form.querySelector('button[type="submit"]');
    if (submit) {
      submit.disabled = submitting;
      submit.dataset.originalLabel ||= submit.textContent;
      submit.textContent = submitting ? 'Signing in…' : submit.dataset.originalLabel;
    }
    if (submitting && message) showStatus(form, 'loading', message);
  };

  const validateEmail = (input) => input && input.value.trim() && input.validity.valid;

  const initialisePageDataStates = () => {
    document.querySelectorAll('[data-customer-state]').forEach((content) => {
      const emptyContent = document.createElement('div');
      emptyContent.dataset.pageEmptyContent = '';
      while (content.firstChild) emptyContent.appendChild(content.firstChild);

      const loading = document.createElement('div');
      loading.className = 'account-data-state account-data-loading';
      loading.dataset.pageLoading = '';
      loading.hidden = true;
      loading.textContent = contracts?.states.loading || 'Loading account information…';

      const error = document.createElement('div');
      error.className = 'account-data-state account-data-error';
      error.dataset.pageError = '';
      error.hidden = true;
      error.textContent = contracts?.states.error || 'Unable to load this account information.';

      content.append(emptyContent, loading, error);
      pageDataState.set(content, { state: 'empty', message: '' });
    });
  };

  const setPageDataState = (state, message = '') => {
    document.querySelectorAll('[data-customer-state]').forEach((content) => {
      pageDataState.set(content, { state, message });
      const empty = content.querySelector('[data-page-empty-content]');
      const loading = content.querySelector('[data-page-loading]');
      const error = content.querySelector('[data-page-error]');
      if (empty) empty.hidden = !['empty', 'loaded'].includes(state);
      if (loading) loading.hidden = state !== 'loading';
      if (error) {
        error.hidden = state !== 'error';
        if (message) error.textContent = message;
      }
    });
  };

  const renderAccountHeader = (state) => {
    document.querySelectorAll('.account-topbar__utility').forEach((utility) => {
      utility.replaceChildren();
      if (state.status === 'loading') {
        const loading = document.createElement('span');
        loading.className = 'account-topbar__state';
        loading.textContent = 'Checking your account…';
        utility.appendChild(loading);
        return;
      }
      if (state.status === 'authenticated' && state.user) {
        const profile = document.createElement('a');
        profile.className = 'account-topbar__link';
        profile.href = 'profile.html';
        profile.textContent = 'Profile';
        const notifications = document.createElement('a');
        notifications.className = 'account-topbar__link';
        notifications.href = 'notifications.html';
        notifications.textContent = 'Notifications';
        const dashboard = document.createElement('a');
        dashboard.className = 'account-topbar__link';
        dashboard.href = isAdministrator(state.user) ? '../admin/index.html' : 'dashboard.html';
        dashboard.textContent = isAdministrator(state.user) ? 'Admin Panel' : 'Dashboard';
        const logout = document.createElement('button');
        logout.type = 'button';
        logout.className = 'account-topbar__link account-topbar__logout';
        logout.dataset.accountLogout = '';
        logout.textContent = 'Log Out';
        utility.append(profile, notifications, dashboard, logout);
        return;
      }
      if (state.status === 'guest' || state.status === 'expired' || state.status === 'error') {
        const login = document.createElement('a');
        login.className = 'account-topbar__link';
        login.href = 'login.html';
        login.textContent = 'Log In';
        const register = document.createElement('a');
        register.className = 'account-topbar__link';
        register.href = 'register.html';
        register.textContent = 'Create Account';
        utility.append(login, register);
        return;
      }
      const unavailable = document.createElement('span');
      unavailable.className = 'account-topbar__state';
      unavailable.textContent = 'Account unavailable';
      utility.appendChild(unavailable);
    });
  };

  const renderAccountState = (state = auth?.getState?.() || { status: 'guest' }) => {
    const authenticated = state.status === 'authenticated';
    renderAccountHeader(state);
    document.querySelectorAll('[data-guest-guard]').forEach((guard) => {
      const title = guard.querySelector('h1');
      const copy = guard.querySelector('p:not(.eyebrow)');
      const actions = guard.querySelector('.account-guard__actions');
      const originalTitle = guard.dataset.guardTitle || title?.textContent || 'Customer account';
      const originalCopy = guard.dataset.guardCopy || copy?.textContent || 'Authenticate to access this secure customer area.';
      guard.dataset.guardTitle = originalTitle;
      guard.dataset.guardCopy = originalCopy;
      guard.hidden = authenticated;
      if (authenticated) return;

      const returnTo = state.returnTo || (body.dataset.customerPage ? `${window.location.pathname}${window.location.search}` : '');
      guard.querySelectorAll('a[href^="login.html"]').forEach((link) => {
        link.href = returnTo ? `login.html?return=${encodeURIComponent(returnTo)}` : 'login.html';
      });

      if (state.status === 'loading') {
        if (title) title.textContent = 'Checking account';
        if (copy) copy.textContent = 'Account authentication is being checked.';
        if (actions) actions.hidden = true;
      } else if (state.status === 'expired') {
        if (title) title.textContent = 'Session expired';
        if (copy) copy.textContent = contracts?.states.expired || 'Your session has expired. Please authenticate again.';
        if (actions) actions.hidden = false;
      } else if (state.status === 'error') {
        if (title) title.textContent = 'Unable to verify your account';
        if (copy) copy.textContent = state.error || 'Please authenticate again.';
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

    document.querySelectorAll('[data-customer-state]').forEach((content) => {
      content.hidden = !authenticated;
    });
    document.querySelectorAll('[data-account-state]').forEach((element) => {
      element.textContent = authenticated ? 'Customer account' : 'Guest mode';
    });
    document.querySelectorAll('[data-account-logout]').forEach((button) => {
      button.disabled = !authenticated;
      button.textContent = authenticated ? 'Logout' : 'Logout unavailable';
    });
  };

  const sidebar = document.getElementById('account-sidebar');
  const menuToggle = document.getElementById('account-mobile-toggle');
  const accountMedia = window.matchMedia?.('(max-width: 960px)');
  const drawerBackdrop = sidebar ? (() => {
    const existing = document.getElementById('account-drawer-backdrop');
    if (existing) return existing;
    const element = document.createElement('div');
    element.id = 'account-drawer-backdrop';
    element.className = 'account-drawer-backdrop';
    element.setAttribute('aria-hidden', 'true');
    document.body.appendChild(element);
    return element;
  })() : null;
  const drawerClose = sidebar ? (() => {
    const existing = sidebar.querySelector('.account-drawer-close');
    if (existing) return existing;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'account-drawer-close';
    button.setAttribute('aria-label', 'Close account navigation');
    button.textContent = '×';
    sidebar.insertBefore(button, sidebar.firstChild);
    return button;
  })() : null;
  const isMobileDrawer = () => accountMedia ? accountMedia.matches : window.innerWidth <= 960;
  const drawerFocusable = () => sidebar ? [...sidebar.querySelectorAll('a[href], button:not([disabled])')].filter((element) => !element.hidden) : [];
  const syncSidebarAccessibility = () => {
    if (!sidebar) return;
    const open = isMobileDrawer() && body.classList.contains('account-nav-open');
    sidebar.setAttribute('aria-hidden', String(isMobileDrawer() && !open));
    drawerBackdrop?.setAttribute('aria-hidden', String(!open));
    if (drawerClose) drawerClose.hidden = !open;
  };
  const setAccountNav = (open, restoreFocus = false) => {
    if (!sidebar || !menuToggle) return;
    const nextOpen = Boolean(open && isMobileDrawer());
    body.classList.toggle('account-nav-open', nextOpen);
    syncSidebarAccessibility();
    menuToggle.setAttribute('aria-expanded', String(nextOpen));
    menuToggle.setAttribute('aria-label', nextOpen ? 'Close account navigation' : 'Open account navigation');
    if (nextOpen) window.requestAnimationFrame(() => sidebar.querySelector('nav a, .account-drawer-close')?.focus());
    else if (restoreFocus) menuToggle.focus();
  };

  menuToggle?.addEventListener('click', () => setAccountNav(!body.classList.contains('account-nav-open'), body.classList.contains('account-nav-open')));
  drawerClose?.addEventListener('click', () => setAccountNav(false, true));
  drawerBackdrop?.addEventListener('click', () => setAccountNav(false, true));
  sidebar?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setAccountNav(false)));
  document.addEventListener('keydown', (event) => {
    if (!body.classList.contains('account-nav-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setAccountNav(false, true);
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
  window.addEventListener('pagehide', () => setAccountNav(false));
  window.addEventListener('pageshow', (event) => { if (event.persisted) setAccountNav(false); });
  syncSidebarAccessibility();
  accountMedia?.addEventListener?.('change', () => setAccountNav(false));

  document.querySelectorAll('[data-password-toggle]').forEach((button) => {
    button.addEventListener('click', () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      if (!input) return;
      const visible = input.type === 'text';
      input.type = visible ? 'password' : 'text';
      button.setAttribute('aria-pressed', String(!visible));
      button.setAttribute('aria-label', visible ? 'Show password' : 'Hide password');
    });
  });

  const loginForm = document.getElementById('login-form');
  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = loginForm.querySelector('[name="email"]');
    const password = loginForm.querySelector('[name="password"]');
    if (!validateEmail(email)) {
      showStatus(loginForm, 'error', 'Enter a valid email address.');
      email?.focus();
      return;
    }
    if (!password?.value) {
      showStatus(loginForm, 'error', 'Enter your password.');
      password?.focus();
      return;
    }
    setFormSubmitting(loginForm, true, 'Signing in…');
    if (isDevelopmentPreviewHost()) {
      // Use a document navigation for the preview host so Set-Cookie is handled
      // as a normal top-level form response instead of a fetch response.
      submitPreviewForm(loginForm, '/api/auth/login');
      return;
    }
    const result = await api?.auth.login({ email: email.value, password: password.value });
    if (result?.ok && result.data?.user) {
      const verifiedUser = await verifySessionAfterAuthentication();
      if (!verifiedUser) {
        setFormSubmitting(loginForm, false);
        showStatus(loginForm, 'error', 'Sign-in completed, but the secure session could not be confirmed in this preview. No account or password data was changed.');
        return;
      }
      const returnTo = new URLSearchParams(window.location.search).get('return');
      const safeReturn = returnTo && (
        returnTo.startsWith('/account/') || (isAdministrator(verifiedUser) && returnTo.startsWith('/admin/'))
      );
      window.location.assign(safeReturn ? returnTo : defaultAuthenticatedDestination(verifiedUser));
      return;
    }
    setFormSubmitting(loginForm, false);
    showStatus(loginForm, result?.state || 'unavailable', result?.message || 'Authentication service is not configured. No sign-in occurred.');
  });

  const registerForm = document.getElementById('register-form');
  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const name = registerForm.querySelector('[name="name"]');
    const email = registerForm.querySelector('[name="email"]');
    const password = registerForm.querySelector('[name="password"]');
    const confirm = registerForm.querySelector('[name="confirm-password"]');
    const terms = registerForm.querySelector('[name="terms"]');
    if (!name?.value.trim()) {
      showStatus(registerForm, 'error', 'Enter your name.');
      name?.focus();
      return;
    }
    if (!validateEmail(email)) {
      showStatus(registerForm, 'error', 'Enter a valid email address.');
      email?.focus();
      return;
    }
    if (!password?.value || password.value.length < 8) {
      showStatus(registerForm, 'error', 'Use a password with at least 8 characters.');
      password?.focus();
      return;
    }
    if (password.value !== confirm?.value) {
      showStatus(registerForm, 'error', 'Passwords do not match.');
      confirm?.focus();
      return;
    }
    if (!terms?.checked) {
      showStatus(registerForm, 'error', 'Accept the Terms & Conditions and Privacy Policy to continue.');
      terms?.focus();
      return;
    }
    setFormSubmitting(registerForm, true, 'Creating account…');
    if (isDevelopmentPreviewHost()) {
      submitPreviewForm(registerForm, '/api/auth/register');
      return;
    }
    const result = await api?.auth.register({ name: name.value, email: email.value, password: password.value });
    if (result?.ok && result.data?.user) {
      const verifiedUser = await verifySessionAfterAuthentication();
      if (!verifiedUser) {
        setFormSubmitting(registerForm, false);
        showStatus(registerForm, 'error', 'Your account was created, but the secure session could not be confirmed in this preview. You can use the same account to sign in later.');
        return;
      }
      window.location.assign(defaultAuthenticatedDestination(verifiedUser));
      return;
    }
    setFormSubmitting(registerForm, false);
    showStatus(registerForm, result?.state || 'unavailable', result?.message || 'Account registration service is not configured. No account was created.');
  });

  const forgotForm = document.getElementById('forgot-password-form');
  forgotForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = forgotForm.querySelector('[name="email"]');
    if (!validateEmail(email)) {
      showStatus(forgotForm, 'error', 'Enter a valid email address.');
      email?.focus();
      return;
    }
    const result = await api?.auth.requestPasswordReset({ email: email.value });
    showStatus(forgotForm, result?.state || 'unavailable', result?.message || 'Password reset service is not configured. No reset email was sent.');
  });

  const customerActions = {
    profile: (form) => api?.customer.updateProfile({
      name: form.querySelector('#profile-name')?.value || '',
      email: form.querySelector('#profile-email')?.value || '',
    }),
    settings: () => api?.customer.updateSettings({}),
    ticket: (form) => api?.customer.createTicket({
      subject: form.querySelector('#ticket-subject')?.value || '',
      message: form.querySelector('#ticket-message')?.value || '',
    }),
  };
  document.querySelectorAll('[data-account-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const action = customerActions[form.dataset.accountForm] || (() => api?.customer.profile());
      const result = await action(form);
      if (result?.ok) {
        if (form.dataset.accountForm === 'profile' && result.data?.user) auth?.setAuthenticated?.(result.data.user);
        const success = form.dataset.accountForm === 'ticket' ? 'Support ticket created.' : 'Changes saved.';
        showStatus(form, 'success', success);
        if (form.dataset.accountForm === 'ticket') hydrateCustomerPage?.();
      } else {
        showStatus(form, result?.state || 'unavailable', result?.message || 'Account service is not configured. No changes were saved.');
      }
    });
  });

  document.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-account-logout]');
    if (!button || button.disabled) return;
    event.preventDefault();
    button.disabled = true;
    const result = await api?.auth.logout();
    if (result?.ok) {
      auth?.setGuest?.();
      window.location.assign('login.html');
    } else {
      button.disabled = false;
    }
  });

  document.querySelectorAll('[data-back-to-top]').forEach((button) => {
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  });

  const customerCollectionDefinitions = {
    orders: {
      key: 'orders',
      columns: [
        ['Order', (record) => record.reference || record.id],
        ['Payment', (record) => record.payment_status || 'pending'],
        ['Status', (record) => record.order_status || 'pending'],
        ['Total', (record) => record.total_cents === null || record.total_cents === undefined ? '—' : `${record.currency || ''} ${record.total_cents}`],
      ],
      detail: (record) => `order-detail.html?id=${encodeURIComponent(record.id)}`,
    },
    downloads: {
      key: 'downloads',
      columns: [['Product', (record) => record.product_id], ['Version', (record) => record.version || '—'], ['Availability', (record) => record.availability || 'unavailable']],
    },
    licenses: {
      key: 'licenses',
      columns: [['Product', (record) => record.product_id], ['Type', (record) => record.license_type || '—'], ['Status', (record) => record.status || 'pending'], ['License key', (record) => record.licenseKey || 'Pending']],
    },
    'saved-items': {
      key: 'savedItems',
      columns: [['Product', (record) => record.product_id], ['Saved', (record) => record.created_at || '—']],
    },
    billing: {
      key: 'billing',
      columns: [['Status', (record) => record.status || 'pending'], ['Amount', (record) => record.amount_cents === null || record.amount_cents === undefined ? '—' : `${record.currency || ''} ${record.amount_cents}`], ['Reference', (record) => record.provider_reference || '—']],
    },
    support: {
      key: 'tickets',
      columns: [['Subject', (record) => record.subject], ['Status', (record) => record.status || 'open'], ['Priority', (record) => record.priority || 'normal'], ['Updated', (record) => record.updated_at || record.created_at || '—']],
      detail: (record) => `ticket-detail.html?id=${encodeURIComponent(record.id)}`,
    },
    messages: {
      key: 'messages',
      columns: [['Message', (record) => record.body], ['From', (record) => record.sender_user_id], ['Received', (record) => record.created_at || '—']],
      detail: (record) => `message-detail.html?id=${encodeURIComponent(record.id)}`,
    },
    notifications: {
      key: 'notifications',
      columns: [['Title', (record) => record.title], ['Message', (record) => record.message], ['Received', (record) => record.created_at || '—']],
    },
  };

  const customerRecordMount = () => {
    const content = document.querySelector('[data-customer-state]');
    const emptyContent = content?.querySelector('[data-page-empty-content]');
    if (!emptyContent) return null;
    let mount = emptyContent.querySelector('[data-customer-records]');
    if (!mount) {
      mount = document.createElement('div');
      mount.dataset.customerRecords = '';
      const empty = emptyContent.querySelector('.account-empty');
      if (empty) empty.before(mount);
      else emptyContent.appendChild(mount);
    }
    return mount;
  };

  const clearCustomerRecords = () => {
    const mount = customerRecordMount();
    if (mount) {
      mount.replaceChildren();
      mount.hidden = true;
    }
    document.querySelector('[data-customer-state] .account-empty')?.removeAttribute('hidden');
  };

  const renderCustomerCollection = (page, data) => {
    const definition = customerCollectionDefinitions[page];
    const records = definition && Array.isArray(data?.[definition.key]) ? data[definition.key] : [];
    const mount = customerRecordMount();
    const empty = document.querySelector('[data-customer-state] .account-empty');
    if (!definition || !mount) return;
    if (!records.length) {
      mount.replaceChildren();
      mount.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    const wrap = document.createElement('div');
    wrap.className = 'account-table-wrap';
    const table = document.createElement('table');
    table.className = 'account-table';
    const head = document.createElement('thead');
    const headRow = document.createElement('tr');
    definition.columns.forEach(([label]) => {
      const heading = document.createElement('th');
      heading.scope = 'col';
      heading.textContent = label;
      headRow.appendChild(heading);
    });
    if (definition.detail) {
      const heading = document.createElement('th');
      heading.scope = 'col';
      heading.textContent = 'Details';
      headRow.appendChild(heading);
    }
    head.appendChild(headRow);
    const tableBody = document.createElement('tbody');
    records.forEach((record) => {
      const row = document.createElement('tr');
      definition.columns.forEach(([, value]) => {
        const cell = document.createElement('td');
        const rendered = value(record);
        cell.textContent = rendered === null || rendered === undefined || rendered === '' ? '—' : String(rendered);
        row.appendChild(cell);
      });
      if (definition.detail) {
        const cell = document.createElement('td');
        const link = document.createElement('a');
        link.className = 'button--text';
        link.href = definition.detail(record);
        link.textContent = 'View';
        cell.appendChild(link);
        row.appendChild(cell);
      }
      tableBody.appendChild(row);
    });
    table.append(head, tableBody);
    wrap.appendChild(table);
    mount.replaceChildren(wrap);
    mount.hidden = false;
    if (empty) empty.hidden = true;
  };

  const renderCustomerDetail = (page, data) => {
    const details = {
      'order-detail': data?.order ? [
        ['Order', data.order.reference || data.order.id],
        ['Payment', data.order.payment_status || 'pending'],
        ['Status', data.order.order_status || 'pending'],
        ['Total', data.order.total_cents === null || data.order.total_cents === undefined ? '—' : `${data.order.currency || ''} ${data.order.total_cents}`],
        ['Items', (data.items || []).map((item) => item.product_title_snapshot || item.product_id).join(', ') || '—'],
      ] : null,
      'ticket-detail': data?.ticket ? [
        ['Subject', data.ticket.subject],
        ['Status', data.ticket.status || 'open'],
        ['Priority', data.ticket.priority || 'normal'],
        ['Messages', (data.messages || []).map((message) => message.body).join(' · ') || '—'],
      ] : null,
      'message-detail': data?.message ? [
        ['Message', data.message.body],
        ['From', data.message.sender_user_id],
        ['Received', data.message.created_at || '—'],
      ] : null,
    }[page];
    const mount = customerRecordMount();
    const empty = document.querySelector('[data-customer-state] .account-empty');
    if (!mount || !details) return;
    const wrap = document.createElement('div');
    wrap.className = 'account-table-wrap';
    const table = document.createElement('table');
    table.className = 'account-table';
    const tableBody = document.createElement('tbody');
    details.forEach(([label, value]) => {
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
    mount.replaceChildren(wrap);
    mount.hidden = false;
    if (empty) empty.hidden = true;
  };

  const detailId = () => new URLSearchParams(window.location.search).get('id');
  const customerLoaders = {
    dashboard: api?.customer.dashboard,
    profile: api?.customer.profile,
    orders: api?.customer.orders,
    downloads: api?.customer.downloads,
    licenses: api?.customer.licenses,
    'saved-items': api?.customer.savedItems,
    billing: api?.customer.billing,
    support: api?.customer.tickets,
    messages: api?.customer.messages,
    notifications: api?.customer.notifications,
    'order-detail': () => detailId() ? api?.customer.order(detailId()) : null,
    'ticket-detail': () => detailId() ? api?.customer.ticket(detailId()) : null,
    'message-detail': () => detailId() ? api?.customer.message(detailId()) : null,
  };

  const hydrateCustomerPage = async () => {
    const page = body.dataset.customerPage;
    const loader = customerLoaders[page];
    if (!loader || !auth?.getState || auth.getState().status !== 'authenticated') return;
    const request = loader();
    if (!request) {
      clearCustomerRecords();
      return;
    }
    setPageDataState('loading');
    const result = await request;
    if (result?.ok) {
      const data = result.data || {};
      if (page === 'dashboard' && data.counts) {
        const values = document.querySelectorAll('.dashboard-card__value');
        const ordered = [data.counts.orders, data.counts.downloads, data.counts.licenses, data.counts.savedItems, data.counts.tickets, data.counts.messages];
        values.forEach((value, index) => { value.textContent = ordered[index] ?? 0; });
      }
      if (page === 'profile' && data.user) {
        const name = document.getElementById('profile-name');
        const email = document.getElementById('profile-email');
        if (name) name.value = data.user.name || '';
        if (email) email.value = data.user.email || '';
      }
      setPageDataState('empty');
      if (customerCollectionDefinitions[page]) renderCustomerCollection(page, data);
      else if (['order-detail', 'ticket-detail', 'message-detail'].includes(page)) renderCustomerDetail(page, data);
      return;
    }
    if (result?.state === 'guest') {
      auth.setGuest(window.location.pathname + window.location.search);
      return;
    }
    setPageDataState('error', result?.message || 'Unable to load this account information.');
  };

  const integrationBridge = {
    getState: () => auth?.getState?.() || { status: 'guest'},
    setPageDataState,
    beginAuthentication: () => auth?.setLoading?.(),
    showAuthenticationUnavailable: (message) => auth?.setUnavailable?.(message),
    showAuthenticationError: (message) => auth?.setError?.(message),
    expireSession: (returnTo) => auth?.setExpired?.(returnTo),
    completeAuthentication: (user) => auth?.setAuthenticated?.(user),
    setGuest: (returnTo) => auth?.setGuest?.(returnTo),
  };
  window.NibrexoAccount = Object.freeze(integrationBridge);

  if (body.dataset.customerPage && auth?.getState?.().status === 'guest') {
    auth.setGuest(`${window.location.pathname}${window.location.search}`);
  }

  initialisePageDataStates();
  let authPageRedirected = false;
  const isPublicAccountAuthPage = Boolean(document.getElementById('login-form') || document.getElementById('register-form') || document.getElementById('forgot-password-form'));
  if (auth?.subscribe) {
    auth.setLoading?.();
    auth.subscribe((state) => {
      if (state.status === 'authenticated' && isPublicAccountAuthPage && !authPageRedirected) {
        authPageRedirected = true;
        window.location.replace(defaultAuthenticatedDestination(state.user));
        return;
      }
      renderAccountState(state);
      if (state.status === 'authenticated') hydrateCustomerPage();
    });
  } else {
    renderAccountState();
  }

  const bootstrapSession = async () => {
    if (!auth?.setLoading || !api?.auth.getSession) return;
    auth.setLoading();
    const result = await api.auth.getSession();
    if (result?.ok && result.data?.user) {
      auth.setAuthenticated(result.data.user);
    } else if (result?.state === 'guest') {
      auth.setGuest(body.dataset.customerPage ? `${window.location.pathname}${window.location.search}` : null);
    } else {
      auth.setUnavailable(result?.message || 'Authentication service is not configured.');
    }
  };
  bootstrapSession();
})();
