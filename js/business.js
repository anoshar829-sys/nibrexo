(() => {
  const body = document.body;
  const header = document.getElementById('business-header');
  const toggle = document.getElementById('business-menu-toggle');
  const menu = document.getElementById('business-menu');

  body.classList.add('js');

  const setMenu = (open, restoreFocus = false) => {
    if (!header || !toggle || !menu) return;
    header.classList.toggle('is-menu-open', open);
    body.classList.toggle('is-menu-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.setAttribute('aria-hidden', String(!open));

    if (open) {
      window.requestAnimationFrame(() => menu.querySelector('a, button')?.focus());
    } else if (restoreFocus) {
      toggle.focus();
    }
  };

  toggle?.addEventListener('click', () => {
    const opening = !header?.classList.contains('is-menu-open');
    setMenu(opening, !opening);
  });
  menu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header?.classList.contains('is-menu-open')) {
      setMenu(false, true);
    }
  });

  const serviceContent = window.NibrexoContent?.services;
  if (Array.isArray(serviceContent)) {
    document.querySelectorAll('[data-service-id]').forEach((card) => {
      const service = serviceContent.find((item) => item.id === card.dataset.serviceId);
      if (!service) return;
      const title = card.querySelector('h3');
      const description = card.querySelector('[data-service-description]');
      if (title && service.name) title.textContent = service.name;
      if (description && service.shortDescription) description.textContent = service.shortDescription;
    });
  }

  const publicApi = window.NibrexoPublicApi;
  const serviceGrid = document.querySelector('[data-service-grid]');
  const renderPublishedServices = (services) => {
    if (!serviceGrid || !services.length) return;
    serviceGrid.replaceChildren(...services.map((service, index) => {
      const card = document.createElement('article');
      card.className = 'service-card business-reveal is-visible';
      const visual = document.createElement('div');
      visual.className = 'service-card__visual service-card__visual--product';
      visual.setAttribute('role', 'img');
      visual.setAttribute('aria-label', service.visual ? `${service.name} visual` : 'Service visual not provided');
      const visualLabel = document.createElement('span');
      visualLabel.textContent = service.visual ? 'SERVICE VISUAL' : 'VISUAL NOT PROVIDED';
      visual.appendChild(visualLabel);
      if (service.visual) {
        const image = document.createElement('img');
        image.src = service.visual;
        image.alt = service.name;
        image.loading = 'lazy';
        image.addEventListener('error', () => image.remove());
        visual.appendChild(image);
      }
      const body = document.createElement('div');
      body.className = 'service-card__body';
      const meta = document.createElement('p');
      meta.className = 'service-card__meta';
      meta.textContent = service.category || 'SERVICE';
      const title = document.createElement('h3');
      title.textContent = service.name;
      const description = document.createElement('p');
      description.textContent = service.short_description || 'Service information is available on the detail page.';
      const link = document.createElement('a');
      link.className = 'button button--outline';
      link.href = `service-detail.html?id=${encodeURIComponent(service.slug)}`;
      link.textContent = 'View Service';
      body.append(meta, title, description, link);
      card.append(visual, body);
      return card;
    }));
  };
  publicApi?.services?.().then((result) => {
    if (result?.ok) renderPublishedServices(result.data?.services || []);
  });

  const elements = document.querySelectorAll('.business-reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
  } else {
    elements.forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-back-to-top]').forEach((button) => {
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  });
})();
