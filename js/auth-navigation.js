/* Shared same-origin account navigation. It reads the server session only; it stores no auth data. */
(() => {
  const CUSTOMER_LINKS = [
    ['Dashboard', '/account/dashboard.html'],
    ['Profile', '/account/profile.html'],
    ['Orders', '/account/orders.html'],
    ['Downloads', '/account/downloads.html'],
    ['Licenses', '/account/licenses.html'],
    ['Saved Items', '/account/saved-items.html'],
    ['Billing', '/account/billing.html'],
    ['Support', '/account/support.html'],
    ['Messages', '/account/messages.html'],
    ['Notifications', '/account/notifications.html'],
    ['Settings', '/account/settings.html'],
  ];
  const ADMIN_ROLES = new Set(['owner', 'admin', 'manager', 'support', 'editor']);
  const loginPath = '/account/login.html';
  const registerPath = '/account/register.html';
  const accountPath = (path) => new URL(path, window.location.origin).pathname;
  const isAccountLink = (anchor) => {
    try { return new URL(anchor.href, window.location.origin).pathname === loginPath; } catch { return false; }
  };

  const injectStyles = () => {
    if (document.getElementById('nibrexo-auth-navigation-styles')) return;
    const style = document.createElement('style');
    style.id = 'nibrexo-auth-navigation-styles';
    style.textContent = `
      .nibrexo-auth-control { position:relative; display:inline-flex; align-items:center; min-height:36px; }
      .nibrexo-auth-control__loading { display:inline-block; width:64px; height:12px; border-radius:999px; background:rgba(31,41,55,.12); }
      .nibrexo-auth-control details { position:relative; }
      .nibrexo-auth-control summary { display:inline-flex; min-height:36px; align-items:center; padding:0 11px; border:1px solid rgba(31,41,55,.18); border-radius:8px; color:#1e40af; background:#fff; font:inherit; font-size:.75rem; font-weight:720; cursor:pointer; list-style:none; }
      .nibrexo-auth-control summary::-webkit-details-marker { display:none; }
      .nibrexo-auth-control__menu { position:absolute; z-index:80; top:calc(100% + 8px); right:0; display:grid; width:190px; max-height:min(70dvh,500px); overflow-y:auto; padding:8px; border:1px solid rgba(31,41,55,.14); border-radius:10px; background:#fff; box-shadow:0 14px 32px rgba(31,41,55,.16); }
      .nibrexo-auth-control__menu a, .nibrexo-auth-control__menu button { display:flex; min-height:36px; align-items:center; padding:0 9px; border:0; border-radius:6px; color:#1f2937; background:transparent; font:inherit; font-size:.76rem; font-weight:650; text-align:left; text-decoration:none; cursor:pointer; }
      .nibrexo-auth-control__menu a:hover, .nibrexo-auth-control__menu button:hover { color:#1e40af; background:#eff6ff; }
      .nibrexo-auth-control__menu button { color:#b45309; }
      .nibrexo-auth-control__divider { height:1px; margin:6px 2px; background:rgba(31,41,55,.12); }
      .nibrexo-auth-control__guest { display:inline-flex; align-items:center; gap:9px; font-size:.75rem; font-weight:720; }
      .nibrexo-auth-control__guest a { color:#1e40af; text-decoration:none; }
      .nibrexo-auth-control__guest a:last-child { color:#1f2937; }
      @media (max-width:760px) {
        .nibrexo-auth-control__guest a:last-child { display:none; }
        .mobile-menu nav, .business-menu nav, .store-menu nav { max-height:calc(100dvh - 84px); overflow-y:auto; overscroll-behavior:contain; }
      }
    `;
    document.head.appendChild(style);
  };

  const closeAllMenus = (except = null) => {
    document.querySelectorAll('.nibrexo-auth-control details[open]').forEach((details) => {
      if (details !== except) details.open = false;
    });
  };

  const makeLink = (label, path, className = '') => {
    const link = document.createElement('a');
    link.href = accountPath(path);
    link.textContent = label;
    if (className) link.className = className;
    return link;
  };

  const renderDesktopControl = (control, state) => {
    control.replaceChildren();
    control.removeAttribute('aria-busy');
    if (state.status === 'loading') {
      const loading = document.createElement('span');
      loading.className = 'nibrexo-auth-control__loading';
      loading.setAttribute('aria-label', 'Checking account session');
      control.setAttribute('aria-busy', 'true');
      control.appendChild(loading);
      return;
    }
    if (state.status === 'authenticated' && state.user) {
      const isAdmin = ADMIN_ROLES.has(state.user.role);
      const details = document.createElement('details');
      const summary = document.createElement('summary');
      summary.textContent = isAdmin ? 'Account' : (state.user.name ? `Hi, ${state.user.name}` : 'Account');
      const menu = document.createElement('nav');
      menu.className = 'nibrexo-auth-control__menu';
      menu.setAttribute('aria-label', 'Account navigation');
      if (isAdmin) {
        menu.appendChild(makeLink('Admin Dashboard', '/admin/index.html'));
      } else {
        CUSTOMER_LINKS.forEach(([label, path]) => menu.appendChild(makeLink(label, path)));
      }
      const divider = document.createElement('span');
      divider.className = 'nibrexo-auth-control__divider';
      const logout = document.createElement('button');
      logout.type = 'button';
      logout.dataset.authNavigationLogout = '';
      logout.textContent = 'Log Out';
      menu.append(divider, logout);
      details.append(summary, menu);
      details.addEventListener('toggle', () => { if (details.open) closeAllMenus(details); });
      control.appendChild(details);
      return;
    }
    if (state.status === 'unavailable') {
      const unavailable = document.createElement('span');
      unavailable.className = 'nibrexo-auth-control__loading';
      unavailable.setAttribute('aria-label', 'Account service is temporarily unavailable');
      control.appendChild(unavailable);
      return;
    }
    const guest = document.createElement('span');
    guest.className = 'nibrexo-auth-control__guest';
    guest.append(makeLink('Log In', loginPath), makeLink('Create Account', registerPath));
    control.appendChild(guest);
  };

  const replaceHeaderControls = (state) => {
    document.querySelectorAll('a[aria-label="Account"]').forEach((anchor) => {
      if (anchor.dataset.authNavigationBound === 'true') return;
      const control = document.createElement('div');
      control.className = 'nibrexo-auth-control';
      control.dataset.authNavigationControl = '';
      anchor.dataset.authNavigationBound = 'true';
      anchor.replaceWith(control);
      renderDesktopControl(control, state);
    });
    document.querySelectorAll('[data-auth-navigation-control]').forEach((control) => renderDesktopControl(control, state));
  };

  const renderMobileNavigation = (state) => {
    document.querySelectorAll('.mobile-menu nav, .business-menu nav, .store-menu nav').forEach((nav) => {
      nav.querySelectorAll('[data-auth-navigation-mobile]').forEach((item) => item.remove());
      const existingAccount = nav.querySelector('[data-auth-navigation-account]') || [...nav.querySelectorAll('a')].find(isAccountLink);
      if (existingAccount) existingAccount.dataset.authNavigationAccount = '';
      if (state.status === 'loading' || state.status === 'unavailable') {
        if (existingAccount) existingAccount.textContent = 'Account';
        return;
      }
      if (state.status === 'authenticated' && state.user) {
        const isAdmin = ADMIN_ROLES.has(state.user.role);
        if (existingAccount) {
          existingAccount.href = accountPath(isAdmin ? '/admin/index.html' : '/account/dashboard.html');
          existingAccount.textContent = isAdmin ? 'Admin Dashboard' : 'Dashboard';
        }
        if (isAdmin) {
          if (!existingAccount) {
            const item = makeLink('Admin Dashboard', '/admin/index.html');
            item.dataset.authNavigationMobile = '';
            nav.appendChild(item);
          }
        } else {
          const links = existingAccount ? CUSTOMER_LINKS.slice(1) : CUSTOMER_LINKS;
          links.forEach(([label, path]) => {
            const item = makeLink(label, path);
            item.dataset.authNavigationMobile = '';
            nav.appendChild(item);
          });
        }
        const logout = document.createElement('a');
        logout.href = accountPath(loginPath);
        logout.textContent = 'Log Out';
        logout.dataset.authNavigationMobile = '';
        logout.dataset.authNavigationLogout = '';
        nav.appendChild(logout);
      } else {
        if (existingAccount) {
          existingAccount.href = accountPath(loginPath);
          existingAccount.textContent = 'Log In';
        } else {
          const login = makeLink('Log In', loginPath);
          login.dataset.authNavigationMobile = '';
          nav.appendChild(login);
        }
        const register = makeLink('Create Account', registerPath);
        register.dataset.authNavigationMobile = '';
        nav.appendChild(register);
      }
    });
  };

  const render = (state) => {
    replaceHeaderControls(state);
    renderMobileNavigation(state);
  };

  const logout = async () => {
    try {
      const response = await fetch('/api/auth/logout', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      if (!response.ok) return;
      render({ status: 'guest', user: null });
      window.dispatchEvent(new CustomEvent('nibrexo:auth-change', { detail: { status: 'guest', user: null } }));
    } catch {
      // Keep the current server-derived UI if the logout request cannot be completed.
    }
  };

  const initialise = async () => {
    injectStyles();
    render({ status: 'loading', user: null });
    try {
      const response = await fetch('/api/auth/me', { credentials: 'include', headers: { 'Accept': 'application/json' } });
      const body = await response.json().catch(() => ({}));
      if (response.ok && body?.data?.user) {
        const state = { status: 'authenticated', user: body.data.user };
        render(state);
        window.dispatchEvent(new CustomEvent('nibrexo:auth-change', { detail: state }));
      } else if (response.status === 401) {
        render({ status: 'guest', user: null });
      } else {
        render({ status: 'unavailable', user: null });
      }
    } catch {
      render({ status: 'unavailable', user: null });
    }
  };

  document.addEventListener('click', (event) => {
    const logoutTrigger = event.target.closest('[data-auth-navigation-logout]');
    if (logoutTrigger) {
      event.preventDefault();
      logout();
      return;
    }
    if (!event.target.closest('.nibrexo-auth-control')) closeAllMenus();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAllMenus();
  });
  initialise();
})();
