/* Public footer social/contact links. Values are supplied only by the public settings API. */
(() => {
  const groups = [...document.querySelectorAll('[data-social-contact-links]')];
  if (!groups.length) return;

  const icons = {
    tiktok: [
      ['path', { d: 'M14.5 4v9.1a4.35 4.35 0 1 1-3.25-4.2' }],
      ['path', { d: 'M14.5 4c.7 2.1 2.1 3.5 4.2 4.2' }],
    ],
    instagram: [
      ['rect', { x: '4', y: '4', width: '16', height: '16', rx: '4' }],
      ['circle', { cx: '12', cy: '12', r: '3.5' }],
      ['circle', { cx: '17.1', cy: '6.9', r: '.8', fill: 'currentColor', stroke: 'none' }],
    ],
    facebook: [
      ['path', { d: 'M14.2 20v-7h2.7l.4-3h-3.1V8.1c0-.87.24-1.46 1.5-1.46H17.3V3.96c-.28-.04-1.23-.12-2.34-.12-2.32 0-3.91 1.42-3.91 4.02V10H8.4v3h2.65v7' }],
    ],
    pinterest: [
      ['circle', { cx: '12', cy: '12', r: '8.5' }],
      ['path', { d: 'M9.7 19.2 11 14.3m.1 0c.7 1.05 2.3 1.14 3.32.33 1.3-1.04 1.63-3.92.12-5.15-1.66-1.35-4.76-.6-5.02 1.9-.1.98.35 1.76 1.13 2.07' }],
    ],
    whatsapp: [
      ['path', { d: 'M20 11.8a8 8 0 0 1-11.78 7.05L4 20l1.2-4.02A8 8 0 1 1 20 11.8Z' }],
      ['path', { d: 'M9.1 8.4c.2-.45.4-.46.68-.45h.57c.18.02.43.06.56.37l.7 1.66c.08.2.06.4-.07.57l-.42.54c-.12.14-.26.3-.11.57.15.26.67 1.1 1.44 1.79.99.88 1.83 1.16 2.1 1.29.27.14.43.12.59-.07l.76-.9c.16-.19.32-.15.54-.08l1.73.82c.22.1.37.16.42.25.06.1.06.56-.13 1.1-.19.54-1.1 1.03-1.52 1.1-.39.07-.9.1-1.46-.08-.34-.11-.77-.25-1.33-.49-2.34-1.01-3.86-3.39-3.98-3.55-.12-.16-.95-1.27-.95-2.42 0-1.15.6-1.71.82-1.94Z' }],
    ],
    email: [
      ['rect', { x: '3.5', y: '5.5', width: '17', height: '13', rx: '1.8' }],
      ['path', { d: 'm4.5 7 7.5 5.6L19.5 7' }],
    ],
  };

  const svgElement = (platform) => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    (icons[platform] || icons.email).forEach(([tag, attributes]) => {
      const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
      Object.entries(attributes).forEach(([name, value]) => element.setAttribute(name, value));
      svg.appendChild(element);
    });
    return svg;
  };

  const render = (links) => {
    const safeLinks = (Array.isArray(links) ? links : [])
      .filter((link) => link && icons[link.platform] && typeof link.href === 'string' && /^(https:|mailto:)/i.test(link.href))
      .sort((a, b) => (a.displayOrder - b.displayOrder) || a.label.localeCompare(b.label));

    groups.forEach((group) => {
      group.replaceChildren();
      if (!safeLinks.length) {
        group.hidden = true;
        group.setAttribute('aria-busy', 'false');
        return;
      }
      safeLinks.forEach((link) => {
        const anchor = document.createElement('a');
        anchor.className = 'footer-social-link';
        anchor.href = link.href;
        anchor.dataset.socialPlatform = link.platform;
        anchor.setAttribute('aria-label', link.label);
        anchor.title = link.label;
        if (link.href.startsWith('https://')) {
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        }
        anchor.appendChild(svgElement(link.platform));
        group.appendChild(anchor);
      });
      group.hidden = false;
      group.setAttribute('aria-busy', 'false');
    });
  };

  groups.forEach((group) => group.setAttribute('aria-busy', 'true'));
  const request = window.NibrexoPublicApi?.socialLinks
    ? window.NibrexoPublicApi.socialLinks()
    : fetch('/api/settings/social-links', { credentials: 'include' })
      .then(async (response) => ({ ok: response.ok, data: (await response.json()).data || null }))
      .catch(() => ({ ok: false, data: null }));

  request.then((result) => render(result?.ok ? result.data?.links : []));
})();
