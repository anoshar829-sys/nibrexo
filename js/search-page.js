(() => {
  const form = document.getElementById('public-search-form');
  const input = document.getElementById('public-search-query');
  const results = document.getElementById('public-search-results');
  const state = document.getElementById('public-search-state');
  const publicApi = window.NibrexoPublicApi;
  const storeApi = window.NibrexoStoreApi;
  if (!form || !input || !results || !state || !publicApi || !storeApi) return;

  const setState = (title, message) => {
    state.hidden = false;
    results.hidden = true;
    const heading = state.querySelector('h2');
    const copy = state.querySelector('p');
    if (heading) heading.textContent = title;
    if (copy) copy.textContent = message;
  };

  const normalized = (value) => String(value || '').toLowerCase();
  const matches = (term, ...values) => values.some((value) => normalized(value).includes(term));

  const render = (items) => {
    if (!items.length) {
      setState('No results found', 'No published content matched this search term.');
      return;
    }
    results.replaceChildren(...items.map((item) => {
      const card = document.createElement('article');
      card.className = 'public-content-card';
      const type = document.createElement('span');
      type.className = 'public-content-card__meta';
      type.textContent = item.type;
      const title = document.createElement('h2');
      title.textContent = item.title;
      const description = document.createElement('p');
      description.textContent = item.description || 'Published content details are available on this page.';
      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = 'View';
      card.append(type, title, description, link);
      return card;
    }));
    state.hidden = true;
    results.hidden = false;
  };

  const runSearch = async () => {
    const term = input.value.trim().toLowerCase();
    if (!term) {
      setState('Search published content', 'Enter a term to search currently published products, services, documentation, and blog posts.');
      return;
    }
    setState('Searching published content', 'Loading published results…');
    const [products, services, docs, blog] = await Promise.all([
      storeApi.listProducts(), publicApi.services(), publicApi.documentation(), publicApi.blog(),
    ]);
    if (![products, services, docs, blog].every((result) => result?.ok)) {
      setState('Search service unavailable', 'Published content could not be searched right now.');
      return;
    }
    const items = [];
    (products.data?.products || []).forEach((item) => {
      if (matches(term, item.name, item.shortDescription, item.fullDescription, item.category)) items.push({ type: 'PRODUCT', title: item.name, description: item.shortDescription, href: `store/product.html?id=${encodeURIComponent(item.slug)}` });
    });
    (services.data?.services || []).forEach((item) => {
      if (matches(term, item.name, item.short_description, item.detailed_description, item.category)) items.push({ type: 'SERVICE', title: item.name, description: item.short_description, href: `service-detail.html?id=${encodeURIComponent(item.slug)}` });
    });
    (docs.data?.documentation || []).forEach((item) => {
      if (matches(term, item.title, item.summary, item.category)) items.push({ type: 'DOCUMENTATION', title: item.title, description: item.summary, href: `docs-detail.html?id=${encodeURIComponent(item.slug)}` });
    });
    (blog.data?.posts || []).forEach((item) => {
      if (matches(term, item.title, item.excerpt, item.category)) items.push({ type: 'BLOG', title: item.title, description: item.excerpt, href: `blog-post.html?id=${encodeURIComponent(item.slug)}` });
    });
    render(items);
  };

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const url = new URL(window.location.href);
    if (input.value.trim()) url.searchParams.set('q', input.value.trim());
    else url.searchParams.delete('q');
    window.history.replaceState({}, '', url);
    runSearch();
  });

  const initial = new URLSearchParams(window.location.search).get('q');
  if (initial) {
    input.value = initial;
    runSearch();
  }
})();
