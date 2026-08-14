(() => {
  const api = window.NibrexoPublicApi;
  const page = document.body.dataset.publicContent;
  if (!api || !page) return;

  const showMissing = (state = 'not_found', message = '') => {
    const missing = document.querySelector('[data-content-missing]');
    if (!missing) return;
    const heading = missing.querySelector('h2');
    const copy = missing.querySelector('p');
    if (heading && !heading.dataset.originalText) heading.dataset.originalText = heading.textContent;
    if (copy && !copy.dataset.originalText) copy.dataset.originalText = copy.textContent;
    if (state === 'not_found') {
      if (heading) heading.textContent = heading.dataset.originalText || heading.textContent;
      if (copy) copy.textContent = copy.dataset.originalText || copy.textContent;
    } else {
      if (heading) heading.textContent = 'Content service unavailable';
      if (copy) copy.textContent = message || 'Published content could not be loaded right now.';
    }
    missing.hidden = false;
  };

  const renderCards = (container, items, type) => {
    if (!container || !items.length) return;
    container.hidden = false;
    document.querySelector('[data-content-missing]')?.setAttribute('hidden', '');
    container.replaceChildren(...items.map((item) => {
      const card = document.createElement('article');
      card.className = 'public-content-card';
      const meta = document.createElement('span');
      meta.className = 'public-content-card__meta';
      meta.textContent = item.category || type.toUpperCase();
      const title = document.createElement('h2');
      title.textContent = item.title;
      const description = document.createElement('p');
      description.textContent = item.summary || item.excerpt || 'Content details are available on this page.';
      const link = document.createElement('a');
      const target = type === 'documentation' ? 'docs-detail.html' : 'blog-post.html';
      link.href = `${target}?id=${encodeURIComponent(item.slug)}`;
      link.textContent = type === 'documentation' ? 'Read Documentation' : 'Read Post';
      card.append(meta, title, description, link);
      return card;
    }));
  };

  const renderDetail = (item, type, result = null) => {
    const title = document.querySelector('[data-content-title]');
    const meta = document.querySelector('[data-content-meta]');
    const body = document.querySelector('[data-content-body]');
    if (!item) {
      showMissing(result?.state || 'not_found', result?.message || '');
      return;
    }
    if (title) title.textContent = item.title || item.name || '';
    if (meta) meta.textContent = item.category || type.toUpperCase();
    if (body) body.textContent = item.content || item.detailed_description || item.summary || item.excerpt || item.short_description || '';
    document.querySelector('[data-content-missing]')?.setAttribute('hidden', '');
    document.title = `${item.title || item.name} — Nibrexo`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', item.summary || item.excerpt || item.short_description || '');
  };

  const load = async () => {
    if (page === 'documentation') {
      const result = await api.documentation();
      if (result?.ok) renderCards(document.querySelector('[data-content-grid]'), result.data?.documentation || [], 'documentation');
      else showMissing(result?.state, result?.message);
    } else if (page === 'blog') {
      const result = await api.blog();
      if (result?.ok) renderCards(document.querySelector('[data-content-grid]'), result.data?.posts || [], 'blog');
      else showMissing(result?.state, result?.message);
    } else if (page === 'documentation-detail') {
      const slug = new URLSearchParams(window.location.search).get('id');
      if (!slug) return renderDetail(null, 'documentation');
      const result = await api.documentationDetail(slug);
      renderDetail(result?.ok ? result.data?.documentation : null, 'documentation', result);
    } else if (page === 'blog-detail') {
      const slug = new URLSearchParams(window.location.search).get('id');
      if (!slug) return renderDetail(null, 'blog');
      const result = await api.blogDetail(slug);
      renderDetail(result?.ok ? result.data?.post : null, 'blog', result);
    } else if (page === 'service-detail') {
      const slug = new URLSearchParams(window.location.search).get('id');
      if (!slug) return renderDetail(null, 'service');
      const result = await api.service(slug);
      renderDetail(result?.ok ? result.data?.service : null, 'service', result);
    } else if (page === 'resources') {
      const [docs, blog] = await Promise.all([api.documentation(), api.blog()]);
      const docsItems = docs?.ok ? docs.data?.documentation || [] : [];
      const blogItems = blog?.ok ? blog.data?.posts || [] : [];
      const items = [...docsItems, ...blogItems];
      if (items.length) renderCards(document.querySelector('[data-content-grid]'), items, 'resources');
      else if (!docs?.ok || !blog?.ok) showMissing((!docs?.ok ? docs : blog)?.state, (!docs?.ok ? docs : blog)?.message);
    }
  };
  load();
})();
