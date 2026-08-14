/* Public configuration contracts for future Nibrexo automation services. No live records or secrets are included. */
(function () {
  const contracts = {
    emailAutomation: { id: null, name: null, trigger: null, audience: null, status: null, lastModified: null, nodes: [] },
    aiAgent: { id: null, name: null, description: null, instructions: null, responseStyle: null, knowledgeSources: [], enabled: null, provider: null, model: null, status: null },
    crmContact: { id: null, name: null, email: null, phone: null, company: null, tags: [], status: null, createdAt: null, lastActivity: null },
    workflow: { id: null, name: null, active: null, nodes: [], connections: [], validation: null },
    workflowNode: { id: null, type: null, label: null, configuration: null, connected: null },
    form: { id: null, name: null, status: null, fields: [], submissions: [] },
    formField: { id: null, type: null, label: null, placeholder: null, required: null, options: [] },
    newsletter: { id: null, senderName: null, senderEmail: null, replyTo: null, subscriptionBehavior: null, confirmationSettings: null, subscribers: [] },
    integration: { id: null, category: null, name: null, purpose: null, status: null, configurationState: null },
    states: { loading: 'Loading automation data…', error: 'Unable to load automation data.', unavailable: 'This automation service is not configured.' },
  };
  window.NibrexoAutomationContracts = Object.freeze(contracts);
})();
