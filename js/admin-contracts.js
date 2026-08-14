/* Public data contracts for future Nibrexo admin integrations. No records or secrets are included. */
(function () {
  const contracts = {
    adminUser: { id: null, role: null, name: null, email: null, status: null },
    product: { id: null, name: null, shortDescription: null, fullDescription: null, category: null, price: null, image: null, status: null, files: [], licenseReference: null, refundReference: null, createdAt: null, updatedAt: null },
    category: { id: null, name: null, slug: null, description: null, productCount: null, status: null },
    order: { id: null, customerId: null, date: null, products: [], amount: null, currency: null, paymentStatus: null, orderStatus: null },
    customer: { id: null, name: null, email: null, accountStatus: null, registeredAt: null, orderCount: null },
    service: { id: null, name: null, shortDescription: null, detailedDescription: null, visual: null, deliverables: null, cta: null, category: null, status: null },
    coupon: { id: null, code: null, discountType: null, discountValue: null, startDate: null, endDate: null, usageLimit: null, status: null },
    review: { id: null, productId: null, customerId: null, rating: null, text: null, date: null, status: null },
    supportTicket: { id: null, customerId: null, subject: null, status: null, priority: null, createdAt: null, updatedAt: null, assigneeId: null, messageCount: null },
    emailCampaign: { id: null, name: null, subject: null, previewText: null, audience: null, content: null, schedule: null, status: null, createdAt: null, sentAt: null },
    blogPost: { id: null, title: null, slug: null, excerpt: null, content: null, featuredImage: null, category: null, author: null, seoTitle: null, seoDescription: null, status: null, createdAt: null, updatedAt: null },
    documentation: { id: null, title: null, slug: null, category: null, content: null, order: null, seoTitle: null, seoDescription: null, status: null },
    mediaAsset: { id: null, fileName: null, type: null, dimensions: null, size: null, uploadedAt: null, usage: null, status: null },
    payment: { id: null, orderId: null, customerId: null, amount: null, currency: null, status: null, provider: null, providerReference: null, createdAt: null },
    teamMember: { id: null, name: null, email: null, role: null, status: null, lastActivity: null },
    activityLog: { id: null, timestamp: null, userId: null, action: null, module: null, target: null, status: null },
    analytics: { revenue: null, orders: null, customers: null, productPerformance: null, conversion: null, traffic: null },
    states: { loading: 'Loading management data…', error: 'Unable to load this management data.', unavailable: 'Admin service is not configured.' },
  };
  window.NibrexoAdminContracts = Object.freeze(contracts);
})();
