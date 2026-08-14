(() => {
  const body = document.body;
  const header = document.getElementById('store-header');
  const menuToggle = document.getElementById('store-menu-toggle');
  const menu = document.getElementById('store-menu');
  const CART_KEY = 'nibrexo_store_cart_v1';
  const content = window.NibrexoContent || { products: [], getProduct: () => null };
  const storeApi = window.NibrexoStoreApi;
  let runtimeProducts = Array.isArray(content.products) ? [...content.products] : [];

  body.classList.add('js');

  const setMenu = (open, restoreFocus = false) => {
    if (!header || !menuToggle || !menu) return;
    header.classList.toggle('is-menu-open', open);
    body.classList.toggle('is-menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    menu.setAttribute('aria-hidden', String(!open));

    if (open) {
      window.requestAnimationFrame(() => menu.querySelector('a, button')?.focus());
    } else if (restoreFocus) {
      menuToggle.focus();
    }
  };

  menuToggle?.addEventListener('click', () => {
    const opening = !header?.classList.contains('is-menu-open');
    setMenu(opening, !opening);
  });
  menu?.querySelectorAll('a, button').forEach((element) => element.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header?.classList.contains('is-menu-open')) {
      setMenu(false, true);
    }
  });

  const availableProducts = () => runtimeProducts
    .filter((product) => product && product.id && product.name && product.availability === 'available');

  const productHref = (product) => `product.html?id=${encodeURIComponent(product.slug || product.id)}`;

  const createProductCard = (product) => {
    const card = document.createElement('article');
    card.className = 'product-card store-reveal';
    const link = document.createElement('a');
    link.href = productHref(product);
    link.setAttribute('aria-label', `View ${product.name}`);
    const visual = document.createElement('div');
    visual.className = 'product-card__visual';
    visual.setAttribute('role', 'img');

    if (product.image) {
      visual.classList.add('has-image');
      const image = document.createElement('img');
      image.src = product.image;
      image.alt = product.imageAlt || product.name;
      image.loading = 'lazy';
      image.addEventListener('error', () => {
        image.remove();
        visual.classList.remove('has-image');
        visual.classList.add('product-card__visual--fallback');
        visual.textContent = 'IMAGE UNAVAILABLE';
      });
      visual.appendChild(image);
    } else {
      visual.classList.add('product-card__visual--fallback');
      visual.textContent = 'IMAGE UNAVAILABLE';
    }

    const body = document.createElement('div');
    body.className = 'product-card__body';
    const meta = document.createElement('div');
    meta.className = 'product-meta';
    const category = document.createElement('span');
    category.textContent = product.category || 'CATEGORY NOT PROVIDED';
    const identifier = document.createElement('span');
    identifier.textContent = product.id;
    meta.append(category, identifier);
    const title = document.createElement('h3');
    title.textContent = product.name;
    const description = document.createElement('p');
    description.textContent = product.shortDescription || 'Approved description not provided.';
    const bottom = document.createElement('div');
    bottom.className = 'product-card__bottom';
    const price = document.createElement('span');
    price.className = 'product-price';
    price.textContent = product.priceLabel || product.price || 'Price pending';
    const action = document.createElement('span');
    action.className = 'product-card__link';
    action.textContent = 'View Product';
    bottom.append(price, action);
    body.append(meta, title, description, bottom);
    link.append(visual, body);
    card.appendChild(link);
    return card;
  };

  const renderProductCatalog = () => {
    const catalog = document.querySelector('[data-product-catalog]');
    const grid = document.querySelector('[data-product-grid]');
    const products = availableProducts();
    if (!catalog || !grid || !products.length) return;
    grid.replaceChildren(...products.map(createProductCard));
    catalog.hidden = true;
    grid.hidden = false;
  };

  const renderProductDetail = () => {
    const productId = new URLSearchParams(window.location.search).get('id');
    const product = productId ? (runtimeProducts.find((item) => item.id === productId || item.slug === productId) || (typeof content.getProduct === 'function' ? content.getProduct(productId) : null)) : null;
    if (!product || product.availability !== 'available') return;

    const name = document.querySelector('[data-product-name]');
    const description = document.querySelector('[data-product-description]');
    const price = document.querySelector('[data-product-price]');
    const priceState = document.querySelector('[data-product-price-state]');
    const purchase = document.querySelector('[data-add-to-cart]');
    const included = document.querySelector('[data-product-included]');
    const compatibility = document.querySelector('[data-product-compatibility]');
    const support = document.querySelector('[data-product-support]');
    const visual = document.querySelector('[data-product-main-visual]');

    if (name) name.textContent = product.name;
    if (description) description.textContent = product.fullDescription || product.shortDescription || description.textContent;
    if (price) price.textContent = product.priceLabel || product.price || 'Price pending';
    if (priceState) priceState.textContent = (product.priceLabel || product.price) ? 'APPROVED PRICE' : 'PRICE PENDING';
    if (included && Array.isArray(product.included) && product.included.length) included.textContent = product.included.join(' · ');
    if (compatibility && product.compatibility) compatibility.textContent = product.compatibility;
    if (support && product.support) support.textContent = product.support;

    if (visual && product.image) {
      const image = document.createElement('img');
      image.src = product.image;
      image.alt = product.imageAlt || product.name;
      image.loading = 'eager';
      image.addEventListener('error', () => image.remove());
      visual.prepend(image);
      visual.classList.add('has-image');
    }

    if (purchase && product.purchaseState === 'available' && (product.priceLabel || product.price)) {
      purchase.disabled = false;
      purchase.dataset.productId = product.id;
      purchase.textContent = 'Add to Cart';
      purchase.addEventListener('click', () => {
        if (!window.nibrexoCart?.addProduct(product)) return;
        purchase.textContent = 'Added to Cart';
        purchase.disabled = true;
        window.setTimeout(() => {
          purchase.textContent = 'Add to Cart';
          purchase.disabled = false;
        }, 1200);
      });
    }

    document.title = `${product.name} — Nibrexo`;
    document.querySelector('meta[name="description"]')?.setAttribute('content', product.shortDescription || product.fullDescription || '');
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', `${product.name} — Nibrexo`);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', product.shortDescription || product.fullDescription || '');
    document.querySelector('meta[property="og:image"]')?.setAttribute('content', product.image || '/assets/nibrexo-primary-header.png');
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', `${product.name} — Nibrexo`);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', product.shortDescription || product.fullDescription || '');
    document.querySelector('meta[name="twitter:image"]')?.setAttribute('content', product.image || '/assets/nibrexo-primary-header.png');
  };

  renderProductCatalog();
  renderProductDetail();

  const showCatalogUnavailable = (message) => {
    const catalog = document.querySelector('[data-product-catalog]');
    if (!catalog) return;
    const heading = catalog.querySelector('h2');
    const copy = catalog.querySelector('.catalog-empty__content > p:not(.product-meta)');
    if (heading) heading.textContent = 'Store service unavailable.';
    if (copy) copy.textContent = message || 'Approved product releases could not be loaded right now.';
  };

  const showProductUnavailable = (state, message) => {
    const title = document.querySelector('[data-product-name]');
    const description = document.querySelector('[data-product-description]');
    const priceState = document.querySelector('[data-product-price-state]');
    const purchase = document.querySelector('[data-add-to-cart]');
    if (!title) return;
    if (state === 'not_found') {
      title.textContent = 'Product not found';
      if (description) description.textContent = 'This product is not available as a published release.';
      if (priceState) priceState.textContent = 'NOT FOUND';
    } else {
      title.textContent = 'Product service unavailable';
      if (description) description.textContent = message || 'Product details could not be loaded right now.';
      if (priceState) priceState.textContent = 'UNAVAILABLE';
    }
    if (purchase) {
      purchase.disabled = true;
      purchase.textContent = 'Purchase unavailable';
    }
  };

  const hydrateStoreProducts = async () => {
    if (!storeApi?.listProducts) return;
    const result = await storeApi.listProducts();
    const requested = new URLSearchParams(window.location.search).get('id');
    if (!result?.ok) {
      if (requested) showProductUnavailable(result?.state, result?.message);
      else showCatalogUnavailable(result?.message);
      return;
    }
    runtimeProducts = Array.isArray(result.data?.products) ? result.data.products : [];
    renderProductCatalog();
    if (!requested) return;
    let product = runtimeProducts.find((item) => item.id === requested || item.slug === requested);
    if (!product && storeApi.getProduct) {
      const detail = await storeApi.getProduct(requested);
      product = detail?.ok ? detail.data?.product : null;
      if (product) runtimeProducts.push(product);
      else showProductUnavailable(detail?.state, detail?.message);
    }
    if (product) renderProductDetail();
  };
  hydrateStoreProducts();

  const reveals = document.querySelectorAll('.store-reveal');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          currentObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    reveals.forEach((element) => observer.observe(element));
  } else {
    reveals.forEach((element) => element.classList.add('is-visible'));
  }

  document.querySelectorAll('[data-back-to-top]').forEach((button) => {
    button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  });

  // Cart data is temporary browser UI state only. The server revalidates product, price,
  // currency, quantity, customer, and final total when a checkout request is made.
  const normaliseCartItem = (item) => {
    if (!item || !item.id) return null;
    const title = String(item.title || item.name || '').trim();
    if (!title) return null;
    const priceCents = Number(item.priceCents);
    const hasUnitAmount = item.unitAmount !== null && item.unitAmount !== undefined && item.unitAmount !== '' && Number.isFinite(Number(item.unitAmount));
    const unitAmount = hasUnitAmount
      ? Number(item.unitAmount)
      : (Number.isFinite(priceCents) ? priceCents / 100 : null);
    return {
      ...item,
      title,
      name: String(item.name || title),
      unitAmount,
      currency: typeof item.currency === 'string' ? item.currency : '',
    };
  };

  const readCart = () => {
    try {
      const value = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
      return Array.isArray(value) ? value.map(normaliseCartItem).filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const updateCartCount = () => {
    const quantity = readCart().reduce((total, item) => total + normaliseQuantity(item.quantity), 0);
    document.querySelectorAll('[data-cart-count]').forEach((count) => {
      count.hidden = quantity === 0;
      count.textContent = quantity;
    });
  };

  const writeCart = (items) => {
    const normalizedItems = (Array.isArray(items) ? items : []).map(normaliseCartItem).filter(Boolean);
    localStorage.setItem(CART_KEY, JSON.stringify(normalizedItems));
    updateCartCount();
    renderCart();
    renderCheckout();
  };

  const normaliseQuantity = (value) => Math.max(1, Math.floor(Number(value) || 1));

  const linePrice = (item) => {
    if (typeof item.priceLabel === 'string' && item.priceLabel.trim()) return item.priceLabel;
    if (typeof item.price === 'string' && item.price.trim()) return item.price;
    return 'Price pending';
  };

  const subtotalLabel = (items) => {
    if (!items.length) return '—';
    const hasAmounts = items.every((item) => Number.isFinite(item.unitAmount) && typeof item.currency === 'string' && item.currency.trim());
    const singleCurrency = hasAmounts && new Set(items.map((item) => item.currency)).size === 1;
    if (!singleCurrency) return 'Calculated at checkout';
    const total = items.reduce((sum, item) => sum + (item.unitAmount * normaliseQuantity(item.quantity)), 0);
    return `${items[0].currency} ${total.toFixed(2)}`;
  };

  const itemElement = (item) => {
    const row = document.createElement('article');
    row.className = 'cart-item';
    row.dataset.id = item.id;

    const visual = document.createElement('div');
    visual.className = 'cart-item__visual';
    visual.textContent = 'PRODUCT';

    const copy = document.createElement('div');
    const title = document.createElement('h2');
    title.textContent = item.title;
    const price = document.createElement('p');
    price.textContent = linePrice(item);
    copy.append(title, price);

    const actions = document.createElement('div');
    actions.className = 'cart-item__actions';
    const quantity = document.createElement('div');
    quantity.className = 'quantity-control';
    const decrement = document.createElement('button');
    decrement.type = 'button';
    decrement.dataset.cartAction = 'decrement';
    decrement.setAttribute('aria-label', `Decrease quantity for ${item.title}`);
    decrement.textContent = '−';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '1';
    input.value = normaliseQuantity(item.quantity);
    input.setAttribute('aria-label', `Quantity for ${item.title}`);
    input.dataset.cartAction = 'quantity';
    const increment = document.createElement('button');
    increment.type = 'button';
    increment.dataset.cartAction = 'increment';
    increment.setAttribute('aria-label', `Increase quantity for ${item.title}`);
    increment.textContent = '+';
    quantity.append(decrement, input, increment);
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'cart-item__remove';
    remove.dataset.cartAction = 'remove';
    remove.textContent = 'Remove';
    actions.append(quantity, remove);

    row.append(visual, copy, actions);
    return row;
  };

  const renderCart = () => {
    const empty = document.getElementById('cart-empty');
    const filled = document.getElementById('cart-filled');
    const list = document.getElementById('cart-items');
    const subtotal = document.getElementById('cart-subtotal');
    if (!empty || !filled || !list || !subtotal) return;

    const items = readCart();
    empty.hidden = items.length > 0;
    filled.hidden = items.length === 0;
    list.replaceChildren();
    items.forEach((item) => list.appendChild(itemElement(item)));
    subtotal.textContent = subtotalLabel(items);
  };

  const renderCheckout = () => {
    const empty = document.getElementById('checkout-empty');
    const content = document.getElementById('checkout-content');
    const list = document.getElementById('checkout-items');
    const subtotal = document.getElementById('checkout-subtotal');
    if (!empty || !content || !list || !subtotal) return;

    const items = readCart();
    empty.hidden = items.length > 0;
    content.hidden = items.length === 0;
    list.replaceChildren();
    items.forEach((item) => {
      const line = document.createElement('div');
      line.className = 'checkout-summary__item';
      const title = document.createElement('span');
      title.textContent = `${item.title} × ${normaliseQuantity(item.quantity)}`;
      const price = document.createElement('strong');
      price.textContent = linePrice(item);
      line.append(title, price);
      list.appendChild(line);
    });
    subtotal.textContent = subtotalLabel(items);
  };

  const updateItem = (id, updater) => {
    const items = readCart();
    const nextItems = items.map((item) => item.id === id ? updater({ ...item }) : item).filter(Boolean);
    writeCart(nextItems);
  };

  document.addEventListener('click', (event) => {
    const actionTarget = event.target.closest('[data-cart-action]');
    if (!actionTarget) return;
    const row = actionTarget.closest('.cart-item');
    if (!row) return;
    const id = row.dataset.id;
    const action = actionTarget.dataset.cartAction;
    if (action === 'remove') {
      writeCart(readCart().filter((item) => item.id !== id));
    } else if (action === 'increment') {
      updateItem(id, (item) => ({ ...item, quantity: normaliseQuantity(item.quantity) + 1 }));
    } else if (action === 'decrement') {
      updateItem(id, (item) => ({ ...item, quantity: Math.max(1, normaliseQuantity(item.quantity) - 1) }));
    }
  });

  document.addEventListener('change', (event) => {
    if (!event.target.matches('[data-cart-action="quantity"]')) return;
    const row = event.target.closest('.cart-item');
    if (row) updateItem(row.dataset.id, (item) => ({ ...item, quantity: normaliseQuantity(event.target.value) }));
  });

  document.getElementById('cart-clear')?.addEventListener('click', () => writeCart([]));

  const checkoutForm = document.getElementById('checkout-form');
  if (checkoutForm) {
    const email = document.getElementById('checkout-email');
    const acknowledgement = document.getElementById('checkout-acknowledgement');
    const status = document.getElementById('checkout-status');
    checkoutForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      status.classList.add('is-visible');
      if (!email.validity.valid) {
        status.textContent = 'Enter a valid email address before continuing.';
        email.focus();
        return;
      }
      if (!acknowledgement.checked) {
        status.textContent = 'Review and acknowledge the License Agreement and Refund Policy before continuing.';
        acknowledgement.focus();
        return;
      }
      const items = readCart().map((item) => ({ productId: item.id, quantity: normaliseQuantity(item.quantity) }));
      if (!items.length) {
        status.textContent = 'Add a product to your cart before checkout.';
        return;
      }
      checkoutForm.setAttribute('aria-busy', 'true');
      const idempotencyKey = checkoutForm.dataset.idempotencyKey || (window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`);
      checkoutForm.dataset.idempotencyKey = idempotencyKey;
      const result = await storeApi?.createCheckout?.(items, idempotencyKey);
      checkoutForm.setAttribute('aria-busy', 'false');
      if (result?.ok && result.data?.order) {
        status.textContent = `Order ${result.data.order.reference} is pending. Payment provider is not connected. No payment was taken.`;
        return;
      }
      if (result?.state === 'guest') {
        status.textContent = 'Log in to create a checkout order.';
        return;
      }
      status.textContent = result?.message || 'Checkout service is unavailable.';
    });
  }

  // Available to future approved product cards only. It creates no product data by itself.
  window.nibrexoCart = {
    addProduct(product) {
      const cartItem = normaliseCartItem(product);
      if (!cartItem) return false;
      const items = readCart();
      const existing = items.find((item) => item.id === cartItem.id);
      if (existing) {
        existing.quantity = normaliseQuantity(existing.quantity) + normaliseQuantity(cartItem.quantity);
      } else {
        items.push({ ...cartItem, quantity: normaliseQuantity(cartItem.quantity) });
      }
      writeCart(items);
      return true;
    },
    clear() { writeCart([]); },
    items: readCart,
  };

  updateCartCount();
  renderCart();
  renderCheckout();
})();
