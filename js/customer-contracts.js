/*
 * Public contracts for future authenticated customer data.
 * These are shapes only — they contain no live customer data, credentials, or API configuration.
 */
(function () {
  const contracts = {
    user: {
      id: null,
      name: null,
      email: null,
      profileImage: null,
      createdAt: null,
      accountStatus: null,
    },
    order: {
      id: null,
      customerId: null,
      date: null,
      products: [],
      subtotal: null,
      total: null,
      currency: null,
      paymentStatus: null,
      orderStatus: null,
    },
    download: {
      productId: null,
      productName: null,
      file: null,
      version: null,
      downloadUrl: null,
      availability: null,
      updateInformation: null,
    },
    license: {
      id: null,
      productId: null,
      licenseType: null,
      key: null,
      status: null,
      issuedAt: null,
      expiresAt: null,
    },
    savedItem: {
      productId: null,
      savedAt: null,
      product: null,
    },
    billing: {
      profile: null,
      paymentMethodSummary: null,
      invoices: [],
      transactions: [],
    },
    ticket: {
      id: null,
      subject: null,
      status: null,
      priority: null,
      createdAt: null,
      updatedAt: null,
      messageCount: null,
    },
    conversation: {
      id: null,
      participant: null,
      preview: null,
      timestamp: null,
      unreadCount: null,
      state: null,
    },
    notification: {
      id: null,
      type: null,
      title: null,
      message: null,
      timestamp: null,
      read: null,
      destination: null,
    },
    states: {
      loading: 'Loading account information…',
      error: 'Unable to load this account information.',
      empty: 'No account information is available yet.',
      unavailable: 'This account service is not configured.',
      expired: 'Your session has expired. Please authenticate again.',
    },
  };

  window.NibrexoCustomerContracts = Object.freeze(contracts);
})();
