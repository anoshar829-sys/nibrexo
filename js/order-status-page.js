(() => {
  const state = document.getElementById('order-status-state');
  const card = document.getElementById('order-status-card');
  const api = window.NibrexoCustomerApi;
  if (!state || !card || !api?.customer.order) return;
  const orderId = new URLSearchParams(window.location.search).get('id');
  if (!orderId) return;

  const setState = (title, message) => {
    const heading = state.querySelector('h2');
    const copy = state.querySelector('p');
    if (heading) heading.textContent = title;
    if (copy) copy.textContent = message;
    state.hidden = false;
    card.hidden = true;
  };

  api.customer.order(orderId).then((result) => {
    if (!result?.ok) {
      if (result?.state === 'guest') setState('Sign in to view this order', 'Order status is available only through an authenticated account.');
      else if (result?.state === 'not_found') setState('Order not found', 'No accessible order matched this link.');
      else setState('Order status unavailable', result?.message || 'Order status could not be loaded right now.');
      return;
    }
    const order = result.data?.order;
    if (!order) {
      setState('Order status unavailable', 'No order details were returned.');
      return;
    }
    card.replaceChildren();
    const heading = document.createElement('h2');
    const copy = document.createElement('p');
    if (order.payment_status === 'paid') {
      heading.textContent = 'Payment confirmed';
      copy.textContent = `Order ${order.reference || order.id} has a verified paid status.`;
    } else {
      heading.textContent = 'Order pending payment confirmation';
      copy.textContent = `Order ${order.reference || order.id} is not confirmed as paid. No license or download entitlement is implied.`;
    }
    card.append(heading, copy);
    state.hidden = true;
    card.hidden = false;
  });
})();
