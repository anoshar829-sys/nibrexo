(() => {
  const api = window.NibrexoStoreApi;
  const grid = document.getElementById('categories-grid');
  const empty = document.getElementById('categories-empty');
  if (!grid || !empty || !api?.listCategories) return;

  const setEmpty = (title, message) => {
    const heading = empty.querySelector('h2');
    const copy = empty.querySelector('p');
    if (heading) heading.textContent = title;
    if (copy) copy.textContent = message;
    empty.hidden = false;
    grid.hidden = true;
  };

  api.listCategories().then((result) => {
    if (!result?.ok) {
      setEmpty('Category service unavailable', result?.message || 'Published categories could not be loaded right now.');
      return;
    }
    const categories = Array.isArray(result.data?.categories) ? result.data.categories : [];
    if (!categories.length) {
      setEmpty('No categories yet', 'Published categories will appear here when approved Store data is available.');
      return;
    }
    grid.replaceChildren(...categories.map((category) => {
      const card = document.createElement('article');
      card.className = 'store-category-card';
      const meta = document.createElement('span');
      meta.textContent = 'STORE CATEGORY';
      const title = document.createElement('h2');
      title.textContent = category.name;
      const description = document.createElement('p');
      description.textContent = category.description || 'Published category details are available in the Store.';
      const link = document.createElement('a');
      link.className = 'button button--outline';
      link.href = 'store/index.html';
      link.textContent = 'Browse Products';
      card.append(meta, title, description, link);
      return card;
    }));
    empty.hidden = true;
    grid.hidden = false;
  });
})();
