(() => {
  const api = window.NibrexoAutomationApi;
  const contracts = window.NibrexoAutomationContracts;
  const adminAuth = window.NibrexoAdminAuth;

  const setStatus = (container, message, type = 'unavailable') => {
    const status = container?.querySelector('[data-automation-status]');
    if (!status) return;
    status.hidden = false;
    status.className = `automation-status is-${type}`;
    status.textContent = message;
  };

  const workflowCanvas = document.getElementById('workflow-canvas');
  if (workflowCanvas) {
    const nodes = [];
    let selectedId = null;
    const palette = document.getElementById('workflow-palette');
    const config = document.getElementById('workflow-config');
    const validation = document.getElementById('workflow-validation');

    const renderWorkflow = () => {
      workflowCanvas.replaceChildren();
      if (!nodes.length) {
        const empty = document.createElement('p');
        empty.className = 'builder-empty';
        empty.textContent = 'No workflow nodes yet. Add a trigger to begin a workflow definition.';
        workflowCanvas.appendChild(empty);
      } else {
        nodes.forEach((node, index) => {
          const nodeButton = document.createElement('button');
          nodeButton.type = 'button';
          nodeButton.className = `workflow-node${node.id === selectedId ? ' is-selected' : ''}`;
          nodeButton.dataset.workflowNodeId = node.id;
          const type = document.createElement('span');
          type.textContent = node.type;
          const label = document.createElement('strong');
          label.textContent = node.label || 'Configuration required';
          nodeButton.append(type, label);
          nodeButton.addEventListener('click', () => {
            selectedId = node.id;
            renderWorkflow();
            renderNodeConfig();
          });
          workflowCanvas.appendChild(nodeButton);
          if (index < nodes.length - 1) {
            const connector = document.createElement('span');
            connector.className = 'workflow-connector';
            connector.setAttribute('aria-hidden', 'true');
            connector.textContent = '→';
            workflowCanvas.appendChild(connector);
          }
        });
      }
      renderValidation();
    };

    const renderValidation = () => {
      const trigger = nodes.find((node) => node.type === 'Trigger');
      const incomplete = nodes.filter((node) => !node.label);
      if (!nodes.length) {
        validation.textContent = 'Add a trigger to create a valid workflow definition.';
      } else if (!trigger) {
        validation.textContent = 'Workflow requires a trigger node.';
      } else if (incomplete.length) {
        validation.textContent = 'Complete node configuration before a workflow can be marked active.';
      } else {
        validation.textContent = 'Workflow structure is ready for a future execution service.';
      }
    };

    const renderNodeConfig = () => {
      if (!config) return;
      const node = nodes.find((item) => item.id === selectedId);
      config.replaceChildren();
      if (!node) {
        config.textContent = 'Select a node to configure it.';
        return;
      }
      node.configuration ||= {};
      const configurationFields = {
        Trigger: [{ key: 'event', label: 'Event', placeholder: 'Select an event' }],
        Condition: [{ key: 'field', label: 'Field', placeholder: 'Choose a field' }, { key: 'operator', label: 'Operator', placeholder: 'Equals' }, { key: 'value', label: 'Value', placeholder: 'Enter a value' }],
        Delay: [{ key: 'duration', label: 'Duration', placeholder: 'Enter a duration' }, { key: 'unit', label: 'Unit', placeholder: 'Minutes, hours, or days' }],
        Email: [{ key: 'subject', label: 'Subject', placeholder: 'Enter a subject' }, { key: 'audience', label: 'Audience', placeholder: 'Choose an audience' }, { key: 'content', label: 'Content', placeholder: 'Write email content' }],
      };
      const fields = configurationFields[node.type] || [{ key: 'action', label: 'Action Detail', placeholder: 'Configuration required' }];
      const heading = document.createElement('h2');
      heading.textContent = `${node.type} Configuration`;
      config.appendChild(heading);
      fields.forEach((field, index) => {
        const label = document.createElement('label');
        label.textContent = field.label;
        const input = document.createElement(field.key === 'content' ? 'textarea' : 'input');
        if (field.key !== 'content') input.type = 'text';
        input.value = node.configuration[field.key] || '';
        input.placeholder = field.placeholder;
        input.addEventListener('input', () => {
          node.configuration[field.key] = input.value.trim();
          if (index === 0) node.label = input.value.trim();
          renderWorkflow();
        });
        config.append(label, input);
      });
      const note = document.createElement('p');
      note.textContent = 'This frontend builder defines workflow structure only. No automation is executed.';
      config.appendChild(note);
    };

    palette?.querySelectorAll('[data-workflow-node]').forEach((button) => {
      button.addEventListener('click', () => {
        const type = button.dataset.workflowNode;
        const node = { id: `${type.toLowerCase()}-${nodes.length + 1}`, type, label: '', configuration: {} };
        nodes.push(node);
        selectedId = node.id;
        renderWorkflow();
        renderNodeConfig();
      });
    });

    document.getElementById('workflow-form')?.addEventListener('submit', async (event) => {
      event.preventDefault();
      const trigger = nodes.find((node) => node.type === 'Trigger');
      const incomplete = nodes.some((node) => !node.label);
      if (!trigger || incomplete) {
        setStatus(document.getElementById('workflow-form'), 'Complete the workflow trigger and node configuration before saving.', 'error');
        return;
      }
      const name = document.getElementById('workflow-name')?.value.trim() || '';
      const selectedStatus = document.getElementById('workflow-status')?.value;
      if (!name) {
        setStatus(document.getElementById('workflow-form'), 'Enter a workflow name before saving.', 'error');
        return;
      }
      const status = selectedStatus === 'Active' ? 'active' : 'draft';
      const result = await api?.workflows.save({ name, status, nodes });
      if (result?.ok) {
        setStatus(document.getElementById('workflow-form'), 'Workflow saved. Provider-dependent actions remain blocked until a real provider is configured.', 'success');
      } else {
        setStatus(document.getElementById('workflow-form'), result?.message || contracts?.states.unavailable || 'Workflow service is not configured. No workflow was saved.', result?.state || 'unavailable');
      }
    });

    renderWorkflow();
    renderNodeConfig();
  }

  const formBuilder = document.getElementById('form-builder');
  if (formBuilder) {
    const fields = [];
    let selectedId = null;
    const fieldList = document.getElementById('form-field-list');
    const preview = document.getElementById('form-preview');
    const config = document.getElementById('form-field-config');

    const renderForm = () => {
      fieldList.replaceChildren();
      preview.replaceChildren();
      if (!fields.length) {
        const empty = document.createElement('p');
        empty.className = 'builder-empty';
        empty.textContent = 'No fields yet. Add a field to create a form definition.';
        fieldList.appendChild(empty.cloneNode(true));
        preview.appendChild(empty);
      } else {
        fields.forEach((field, index) => {
          const row = document.createElement('button');
          row.type = 'button';
          row.className = `builder-field${field.id === selectedId ? ' is-selected' : ''}`;
          row.textContent = `${index + 1}. ${field.label || field.type}`;
          row.addEventListener('click', () => { selectedId = field.id; renderForm(); renderFieldConfig(); });
          fieldList.appendChild(row);

          const previewField = document.createElement('div');
          previewField.className = 'form-preview-field';
          const label = document.createElement('label');
          label.textContent = field.label || field.type;
          let control;
          if (field.type === 'Textarea') {
            control = document.createElement('textarea');
            control.disabled = true;
          } else if (field.type === 'Select') {
            control = document.createElement('select');
            const option = document.createElement('option');
            option.textContent = field.placeholder || 'Select an option';
            control.appendChild(option);
            control.disabled = true;
          } else if (field.type === 'Checkbox' || field.type === 'Radio') {
            control = document.createElement('input');
            control.type = field.type.toLowerCase();
            control.disabled = true;
          } else {
            control = document.createElement('input');
            control.type = field.type === 'Email' ? 'email' : 'text';
            control.placeholder = field.placeholder || '';
            control.disabled = true;
          }
          previewField.append(label, control);
          preview.appendChild(previewField);
        });
      }
    };

    const renderFieldConfig = () => {
      config.replaceChildren();
      const field = fields.find((item) => item.id === selectedId);
      if (!field) { config.textContent = 'Select a field to edit its label, placeholder, and requirement.'; return; }
      const heading = document.createElement('h2'); heading.textContent = `${field.type} Field`;
      const labelText = document.createElement('label'); labelText.textContent = 'Label';
      const labelInput = document.createElement('input'); labelInput.value = field.label || ''; labelInput.addEventListener('input', () => { field.label = labelInput.value; renderForm(); });
      const placeholderText = document.createElement('label'); placeholderText.textContent = 'Placeholder';
      const placeholderInput = document.createElement('input'); placeholderInput.value = field.placeholder || ''; placeholderInput.addEventListener('input', () => { field.placeholder = placeholderInput.value; renderForm(); });
      const required = document.createElement('label'); required.className = 'checkbox-row';
      const requiredInput = document.createElement('input'); requiredInput.type = 'checkbox'; requiredInput.checked = Boolean(field.required); requiredInput.addEventListener('change', () => { field.required = requiredInput.checked; });
      required.append(requiredInput, document.createTextNode(' Required field'));
      const index = fields.findIndex((item) => item.id === field.id);
      const moveUp = document.createElement('button'); moveUp.type = 'button'; moveUp.className = 'button button--outline'; moveUp.textContent = 'Move Up'; moveUp.disabled = index === 0; moveUp.addEventListener('click', () => { [fields[index - 1], fields[index]] = [fields[index], fields[index - 1]]; renderForm(); renderFieldConfig(); });
      const moveDown = document.createElement('button'); moveDown.type = 'button'; moveDown.className = 'button button--outline'; moveDown.textContent = 'Move Down'; moveDown.disabled = index === fields.length - 1; moveDown.addEventListener('click', () => { [fields[index + 1], fields[index]] = [fields[index], fields[index + 1]]; renderForm(); renderFieldConfig(); });
      const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'button button--danger'; remove.textContent = 'Remove Field'; remove.addEventListener('click', () => { const removeIndex = fields.findIndex((item) => item.id === field.id); fields.splice(removeIndex, 1); selectedId = null; renderForm(); renderFieldConfig(); });
      config.append(heading, labelText, labelInput, placeholderText, placeholderInput, required, moveUp, moveDown, remove);
    };

    document.querySelectorAll('[data-form-field]').forEach((button) => {
      button.addEventListener('click', () => {
        const type = button.dataset.formField;
        const field = { id: `${type.toLowerCase()}-${fields.length + 1}`, type, label: '', placeholder: '', required: false };
        fields.push(field); selectedId = field.id; renderForm(); renderFieldConfig();
      });
    });
    document.getElementById('form-builder-save')?.addEventListener('click', async () => {
      const nameInput = document.getElementById('form-name');
      const name = nameInput?.value.trim() || '';
      if (!name) {
        setStatus(formBuilder, 'Enter a form name before saving this definition.', 'error');
        nameInput?.focus();
        return;
      }
      if (!fields.length) { setStatus(formBuilder, 'Add at least one field before saving this form definition.', 'error'); return; }
      const result = await api?.forms.save({ name, fields });
      if (result?.ok) {
        setStatus(formBuilder, 'Form definition saved.', 'success');
      } else {
        setStatus(formBuilder, result?.message || contracts?.states.unavailable || 'Forms service is not configured. No form was saved.', result?.state || 'unavailable');
      }
    });
    renderForm(); renderFieldConfig();
  }

  const hydrateIntegrationStatuses = async () => {
    if (!document.querySelector('[data-integration-id]') || !api?.integrations.status) return;
    const result = await api.integrations.status();
    if (!result?.ok) return;
    const byId = new Map((result.data?.integrations || []).map((item) => [item.id, item]));
    document.querySelectorAll('[data-integration-id]').forEach((card) => {
      const integration = byId.get(card.dataset.integrationId);
      const status = card.querySelector('.integration-card__status');
      if (!status || !integration) return;
      const labels = {
        connected: 'CONNECTED',
        configured_unverified: 'CONFIGURATION REQUIRED',
        configuration_required: 'CONFIGURATION REQUIRED',
        not_configured: 'NOT CONFIGURED',
      };
      status.textContent = labels[integration.status] || 'NOT CONFIGURED';
    });
  };

  const automationListConfig = () => {
    const file = window.location.pathname.split('/').pop();
    if (file === 'email-automation.html') return {
      load: api?.emailAutomation.list,
      key: 'automations',
      cells: (record) => ['—', record.name || '—', '—', '—', record.status || 'draft', record.updated_at || '—', '—'],
    };
    if (file === 'forms.html') return {
      load: api?.forms.list,
      key: 'forms',
      cells: (record) => {
        let fields = 0;
        try { fields = JSON.parse(record.definition_json || '{}').fields?.length || 0; } catch { fields = 0; }
        return ['—', record.name || '—', String(fields), record.status || 'draft', record.updated_at || '—', '—'];
      },
    };
    if (file === 'form-submissions.html') return {
      load: api?.forms.submissions,
      key: 'submissions',
      cells: (record) => {
        let fieldCount = 0;
        try { fieldCount = Object.keys(JSON.parse(record.payload_json || '{}')).length; } catch { fieldCount = 0; }
        return [record.created_at || '—', record.form_id || '—', String(fieldCount), record.status || 'received', '—'];
      },
    };
    if (file === 'crm.html') return {
      load: api?.crm.contacts,
      key: 'contacts',
      cells: (record) => ['—', record.name || '—', record.email || '—', record.company || '—', record.tags || '—', record.status || '—', record.created_at || '—', record.last_activity_at || '—', '—'],
    };
    if (file === 'newsletter.html') return {
      load: api?.newsletter.subscribers,
      key: 'subscribers',
      cells: (record) => ['—', record.email || '—', record.status || 'pending', record.created_at || '—', '—'],
    };
    return null;
  };

  const renderAutomationList = (records, config) => {
    const table = document.querySelector('.admin-table');
    const empty = document.querySelector('[data-admin-empty]');
    const error = document.querySelector('[data-admin-error]');
    const loaded = document.querySelectorAll('[data-admin-loaded]');
    if (!table || !config) return;
    const rows = Array.isArray(records) ? records : [];
    const wrap = table.closest('.admin-table-wrap');
    const pagination = document.querySelector('.admin-pagination-ready');
    if (!rows.length) {
      if (wrap) wrap.hidden = true;
      if (pagination) pagination.hidden = true;
      if (empty) empty.hidden = false;
      return;
    }
    const bodyElement = table.querySelector('tbody');
    bodyElement.replaceChildren();
    rows.forEach((record) => {
      const row = document.createElement('tr');
      config.cells(record).forEach((value) => {
        const cell = document.createElement('td');
        cell.textContent = value === null || value === undefined || value === '' ? '—' : String(value);
        row.appendChild(cell);
      });
      bodyElement.appendChild(row);
    });
    if (wrap) wrap.hidden = false;
    if (pagination) pagination.hidden = false;
    loaded.forEach((item) => { item.hidden = false; });
    if (empty) empty.hidden = true;
    if (error) error.hidden = true;
  };

  const hydrateAutomationList = async () => {
    const config = automationListConfig();
    if (!config?.load || !document.querySelector('.admin-table')) return;
    const result = await config.load();
    if (!result?.ok) {
      const error = document.querySelector('[data-admin-error]');
      if (error) {
        error.hidden = false;
        error.textContent = result?.message || contracts?.states.error || 'Unable to load automation data.';
      }
      return;
    }
    renderAutomationList(result.data?.[config.key], config);
  };

  if (adminAuth?.subscribe) {
    let automationListHydrated = false;
    let integrationsHydrated = false;
    adminAuth.subscribe((state) => {
      if (state.status !== 'authorized') return;
      if (!integrationsHydrated) {
        integrationsHydrated = true;
        hydrateIntegrationStatuses();
      }
      if (!automationListHydrated) {
        automationListHydrated = true;
        hydrateAutomationList();
      }
    });
  } else {
    hydrateIntegrationStatuses();
  }

  document.querySelectorAll('[data-automation-form]').forEach((form) => {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!form.checkValidity()) {
        setStatus(form, 'Complete the required fields before continuing.', 'error');
        form.querySelector(':invalid')?.focus();
        return;
      }
      const type = form.dataset.automationForm;
      if (type === 'automation' || type === 'campaign') {
        setStatus(form, 'Email automation is NOT CONFIGURED. No automation or campaign was saved.', 'not_configured');
        return;
      }
      const handler = { agent: api?.aiAgent.save, newsletter: api?.newsletter.save, integration: api?.integrations.configure }[type];
      const result = await (handler ? handler() : Promise.resolve({ state: 'not_configured', message: 'Automation service is not configured.' }));
      if (result?.ok) {
        setStatus(form, 'Settings saved.', 'success');
      } else {
        setStatus(form, result?.message || contracts?.states.unavailable || 'Automation service is not configured.', result?.state || 'unavailable');
      }
    });
  });
})();
