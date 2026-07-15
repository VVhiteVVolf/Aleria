// Orchestrates direct genealogy editing and Family Chart rendering without exposing library state.

(function installFamilyWorkbenchController(global) {
  'use strict';

  const records = new WeakMap();

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function getApi() {
    return global.AleriaFamily?.workbench || null;
  }

  function findWorkbenches(root) {
    if (!root) return [];
    const workbenches = [];
    if (root.matches?.('.family-workbench')) workbenches.push(root);
    root.querySelectorAll?.('.family-workbench').forEach(workbench => workbenches.push(workbench));
    return [...new Set(workbenches)];
  }

  function parseFamily(workbench) {
    try {
      return getApi().state.create(JSON.parse(workbench.querySelector('.family-v2-source-data')?.value || 'null'));
    } catch (error) {
      return null;
    }
  }

  function countRelationships(family) {
    return ['genealogy.partnerships', 'genealogy.parentages', 'genealogy.associations']
      .reduce((count, path) => count + getApi().state.getRecords(family, path).length, 0);
  }

  function updateChrome(record) {
    const { workbench, family } = record;
    const people = getApi().state.getRecords(family, 'genealogy.persons');
    const title = workbench.querySelector('[data-family-workbench-title]');
    const personCount = workbench.querySelector('[data-family-workbench-person-count]');
    const relationCount = workbench.querySelector('[data-family-workbench-relation-count]');
    const orientation = workbench.querySelector('[data-family-workbench-orientation]');
    if (title) title.textContent = family.document?.title || 'Familienakte';
    if (personCount) personCount.textContent = String(people.length);
    if (relationCount) relationCount.textContent = String(countRelationships(family));
    if (orientation) orientation.value = family.view?.orientation === 'horizontal' ? 'horizontal' : 'vertical';
    workbench.querySelectorAll('[data-family-workbench-action="start-relative"]').forEach(button => {
      button.disabled = !getApi().state.findPerson(family, record.selectedPersonId);
    });
  }

  function setStatus(record, message, state = 'ready') {
    const status = record.workbench.querySelector('[data-family-workbench-status]');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function updateStatusFromSession(record) {
    if (!record.session) return;
    const state = record.session.getState();
    const warnings = state.diagnostics.filter(item => item.severity !== 'info').length;
    setStatus(
      record,
      warnings ? `${record.session.getData().length} Personen · ${warnings} Hinweise` : 'Karte anklicken, um die Person zu bearbeiten',
      warnings ? 'notice' : 'ready'
    );
  }

  function renderInspector(record, view = record.inspectorView) {
    const inspector = record.workbench.querySelector('[data-family-workbench-inspector]');
    if (!inspector) return;
    const ui = getApi().ui;
    record.inspectorView = view || { type: 'person' };
    if (record.inspectorView.type === 'relative') {
      inspector.innerHTML = ui.buildRelativeEditor(record.family, record.selectedPersonId, record.inspectorView.relationType);
    } else if (record.inspectorView.type === 'relation') {
      inspector.innerHTML = ui.buildRelationEditor(record.family, record.inspectorView.collectionPath, record.inspectorView.relationId);
    } else if (record.inspectorView.type === 'manager') {
      inspector.innerHTML = ui.buildManager(record.family, record.inspectorView.managerId);
    } else {
      record.inspectorView = { type: 'person' };
      inspector.innerHTML = ui.buildPersonInspector(record.family, record.selectedPersonId);
    }
  }

  function dispatchFamilyChange(record) {
    const source = record.workbench.querySelector('.family-v2-source-data');
    if (source) source.value = JSON.stringify(record.family);
    const EventConstructor = record.workbench.ownerDocument?.defaultView?.CustomEvent || global.CustomEvent;
    if (typeof EventConstructor === 'function') {
      record.workbench.dispatchEvent(new EventConstructor('family-workbench-change', {
        bubbles: true,
        detail: { family: record.family, mode: record.workbench.dataset.familyWorkbenchMode || 'module' }
      }));
    }
  }

  function commit(record, family, options = {}) {
    record.family = getApi().state.create(family);
    updateChrome(record);
    dispatchFamilyChange(record);
    if (options.renderInspector) renderInspector(record, options.view || record.inspectorView);
    scheduleChartRefresh(record);
  }

  function selectPerson(record, personId, options = {}) {
    if (!getApi().state.findPerson(record.family, personId)) return false;
    record.selectedPersonId = personId;
    record.workbench.dataset.familyWorkbenchSelectedPerson = personId;
    if (options.render !== false) renderInspector(record, { type: 'person' });
    if (options.focus !== false) record.session?.focus(personId);
    updateChrome(record);
    return true;
  }

  function clearChart(record) {
    record.resizeObserver?.disconnect();
    record.resizeObserver = null;
    record.session?.destroy();
    record.session = null;
    record.workbench.querySelector('[data-family-workbench-search]')?.replaceChildren?.();
  }

  function observeChartSize(record) {
    if (typeof ResizeObserver !== 'function' || !record.session) return;
    const host = record.workbench.querySelector('[data-family-workbench-chart]');
    if (!host) return;
    let previousWidth = host.clientWidth;
    let previousHeight = host.clientHeight;
    record.resizeObserver = new ResizeObserver(entries => {
      const size = entries[0]?.contentRect;
      if (!size?.width || !size?.height || !record.session) return;
      if (Math.abs(size.width - previousWidth) < 2 && Math.abs(size.height - previousHeight) < 2) return;
      previousWidth = size.width;
      previousHeight = size.height;
      if (record.fitFrame) cancelAnimationFrame(record.fitFrame);
      record.fitFrame = requestAnimationFrame(() => {
        record.fitFrame = 0;
        if (records.get(record.workbench) === record && record.session) record.session.fit();
      });
    });
    record.resizeObserver.observe(host);
  }

  function chartView(record) {
    return {
      ...(isRecord(record.family.view) ? record.family.view : {}),
      initialFocusPersonId: record.selectedPersonId || record.family.view?.initialFocusPersonId || ''
    };
  }

  function createChartSession(record) {
    const adapter = global.AleriaFamily?.adapters?.familyChart;
    const host = record.workbench.querySelector('[data-family-workbench-chart]');
    const search = record.workbench.querySelector('[data-family-workbench-search]');
    if (!adapter || !host) {
      setStatus(record, 'Stammbaum-Komponenten konnten nicht geladen werden.', 'error');
      return;
    }
    try {
      record.session = adapter.createSession({
        container: host,
        searchContainer: search,
        searchPlaceholder: 'Person suchen',
        family: record.family,
        view: chartView(record),
        options: {
          transitionTime: 120,
          unknownParentLabel: 'Unbekannt',
          sanitizeImageSource: typeof global.sanitizeImageSrc === 'function' ? global.sanitizeImageSrc : undefined
        },
        onPersonClick: ({ personId }) => {
          selectPerson(record, personId, { focus: false });
          return false;
        },
        onAfterUpdate: ({ focusPersonId }) => {
          if (records.get(record.workbench) !== record) return;
          if (focusPersonId && focusPersonId !== record.selectedPersonId) selectPerson(record, focusPersonId, { focus: false });
          if (record.session) updateStatusFromSession(record);
        }
      });
      search?.querySelector('input')?.setAttribute('aria-label', 'Person im Stammbaum suchen');
      observeChartSize(record);
      updateStatusFromSession(record);
      record.fitFrame = requestAnimationFrame(() => {
        record.fitFrame = 0;
        if (records.get(record.workbench) === record && record.session) record.session.fit();
      });
    } catch (error) {
      clearChart(record);
      host.replaceChildren();
      const fallback = host.ownerDocument.createElement('div');
      fallback.className = 'family-workbench-chart-error';
      fallback.setAttribute('role', 'alert');
      fallback.textContent = error?.message || 'Der Stammbaum konnte nicht aufgebaut werden.';
      host.appendChild(fallback);
      setStatus(record, 'Stammbaum konnte nicht geladen werden.', 'error');
    }
  }

  function refreshChart(record) {
    if (records.get(record.workbench) !== record || !record.workbench.isConnected) return;
    const people = getApi().state.getRecords(record.family, 'genealogy.persons');
    if (!people.length) {
      clearChart(record);
      record.workbench.querySelector('[data-family-workbench-chart]')?.replaceChildren();
      setStatus(record, 'Noch keine Person · mit „Neue Person“ beginnen', 'empty');
      return;
    }
    if (!record.selectedPersonId || !getApi().state.findPerson(record.family, record.selectedPersonId)) {
      record.selectedPersonId = people[0].id;
    }
    if (!record.session) {
      createChartSession(record);
      return;
    }
    try {
      record.session.update(record.family, chartView(record));
      updateStatusFromSession(record);
    } catch (error) {
      clearChart(record);
      createChartSession(record);
    }
  }

  function scheduleChartRefresh(record) {
    if (record.refreshFrame) cancelAnimationFrame(record.refreshFrame);
    record.refreshFrame = requestAnimationFrame(() => {
      record.refreshFrame = 0;
      refreshChart(record);
    });
  }

  function readFieldValue(input) {
    const valueType = input.dataset.familyValueType || '';
    if (valueType === 'boolean' || input.type === 'checkbox') return Boolean(input.checked);
    if (valueType === 'number' || input.type === 'number') return input.value === '' ? null : Number(input.value);
    if (input.multiple) return Array.from(input.selectedOptions || []).map(option => String(option.value || '').trim()).filter(Boolean);
    if (valueType === 'array') return String(input.value || '').split(',').map(item => item.trim()).filter(Boolean);
    return String(input.value ?? '').trim();
  }

  function updateLivePersonChrome(record, path) {
    if (!['identity.displayName', 'profile.tagline', 'profile.portrait.src', 'profile.portrait.alt'].includes(path)) return;
    const person = getApi().state.findPerson(record.family, record.selectedPersonId);
    const title = record.workbench.querySelector('[data-family-person-editor-title]');
    if (title) title.textContent = person?.identity?.displayName || person?.id || 'Person';
    const tagline = record.workbench.querySelector('[data-family-person-editor-tagline]');
    if (tagline) tagline.textContent = person?.profile?.tagline || 'Ohne Titel oder Rang';
    if (path !== 'profile.portrait.src' && path !== 'profile.portrait.alt') return;
    const portrait = record.workbench.querySelector('[data-family-person-editor-portrait]');
    if (!portrait?.ownerDocument) return;
    portrait.replaceChildren();
    const source = String(person?.profile?.portrait?.src || '').trim();
    if (source) {
      const image = portrait.ownerDocument.createElement('img');
      image.src = source;
      image.alt = person?.profile?.portrait?.alt || '';
      portrait.appendChild(image);
    } else {
      const placeholder = portrait.ownerDocument.createElement('span');
      placeholder.textContent = 'Kein Portrait';
      portrait.appendChild(placeholder);
    }
  }

  function handleDataField(record, input) {
    const value = readFieldValue(input);
    const personPath = input.dataset.familyPersonField;
    if (personPath) {
      commit(record, getApi().state.updatePerson(record.family, record.selectedPersonId, personPath, value));
      updateLivePersonChrome(record, personPath);
      return true;
    }
    const topPath = input.dataset.familyTopField;
    if (topPath) {
      commit(record, getApi().state.updatePath(record.family, topPath, value));
      return true;
    }
    const collectionField = input.dataset.familyCollectionField;
    if (collectionField) {
      commit(record, getApi().state.updateCollectionRecord(
        record.family,
        input.dataset.familyCollection,
        input.dataset.familyRecordId,
        collectionField,
        value
      ));
      return true;
    }
    const relationField = input.dataset.familyRelationField;
    if (relationField) {
      const editor = input.closest('[data-family-relation-editor]');
      let next = getApi().state.updateRelation(record.family, editor?.dataset.familyCollection, editor?.dataset.familyRelationId, { [relationField]: value });
      if (relationField === 'parentIds.1' && !value) {
        const relation = getApi().state.getRecords(next, editor.dataset.familyCollection).find(item => item.id === editor.dataset.familyRelationId);
        if (relation) relation.parentIds = (relation.parentIds || []).filter(Boolean);
      }
      commit(record, next);
      return true;
    }
    return false;
  }

  function collectFormValues(form, selector, pathDataset) {
    const values = {};
    form.querySelectorAll(selector).forEach(input => {
      const path = input.dataset[pathDataset];
      if (path) values[path] = readFieldValue(input);
    });
    return values;
  }

  function submitRelative(record, form) {
    const target = form.querySelector('[data-family-relative-target]')?.value || '__new__';
    const personValues = target === '__new__'
      ? collectFormValues(form, '[data-family-relative-person-field]', 'familyRelativePersonField')
      : {};
    if (target === '__new__' && !String(personValues['identity.displayName'] || '').trim()) {
      personValues['identity.displayName'] = 'Neue Person';
    }
    const result = getApi().state.addRelative(record.family, {
      anchorId: record.selectedPersonId,
      relationType: form.dataset.familyRelationType,
      personId: target === '__new__' ? '' : target,
      personValues,
      relationValues: collectFormValues(form, '[data-family-relative-field]', 'familyRelativeField'),
      coParentId: form.querySelector('[data-family-relative-co-parent]')?.value || '',
      partnershipId: form.querySelector('[data-family-relative-partnership]')?.value || '',
      anchorRole: form.querySelector('[data-family-relative-anchor-role]')?.value || '',
      relativeRole: form.querySelector('[data-family-relative-person-role]')?.value || ''
    });
    if (!result.personId) return;
    record.selectedPersonId = result.personId;
    commit(record, result.family, { renderInspector: true, view: { type: 'person' } });
    record.session?.focus(result.personId, { fit: true });
  }

  function confirmAction(message) {
    return typeof global.confirm !== 'function' || global.confirm(message);
  }

  function handleAction(record, trigger, event) {
    const action = trigger.dataset.familyWorkbenchAction;
    if (action === 'fit-chart') {
      record.session?.fit();
      return;
    }
    if (action === 'add-person') {
      const result = getApi().state.addPerson(record.family, { 'identity.displayName': 'Neue Person' });
      record.selectedPersonId = result.personId;
      commit(record, result.family, { renderInspector: true, view: { type: 'person' } });
      record.session?.focus(result.personId, { fit: true });
      return;
    }
    if (action === 'start-relative' && record.selectedPersonId) {
      renderInspector(record, { type: 'relative', relationType: trigger.dataset.familyRelationType || 'partner' });
      return;
    }
    if (action === 'show-person') {
      renderInspector(record, { type: 'person' });
      return;
    }
    if (action === 'open-manager') {
      renderInspector(record, { type: 'manager', managerId: trigger.dataset.familyManager || 'document' });
      return;
    }
    if (action === 'select-person') {
      selectPerson(record, trigger.dataset.familyPersonId);
      return;
    }
    if (action === 'edit-relation') {
      renderInspector(record, {
        type: 'relation',
        collectionPath: trigger.dataset.familyCollection,
        relationId: trigger.dataset.familyRelationId
      });
      return;
    }
    if (action === 'delete-relation') {
      if (!confirmAction('Diese Beziehung wirklich entfernen? Die beteiligten Personen bleiben erhalten.')) return;
      const next = getApi().state.removeRelation(record.family, trigger.dataset.familyCollection, trigger.dataset.familyRelationId);
      commit(record, next, { renderInspector: true, view: { type: 'person' } });
      return;
    }
    if (action === 'delete-person') {
      const person = getApi().state.findPerson(record.family, record.selectedPersonId);
      if (!person || !confirmAction(`${person.identity?.displayName || person.id} und alle direkten Zuordnungen wirklich entfernen?`)) return;
      const next = getApi().state.removePerson(record.family, record.selectedPersonId);
      record.selectedPersonId = getApi().state.getRecords(next, 'genealogy.persons')[0]?.id || '';
      commit(record, next, { renderInspector: true, view: { type: 'person' } });
      return;
    }
    if (action === 'add-manager-record') {
      const result = getApi().state.addCollectionRecord(record.family, trigger.dataset.familyCollection);
      commit(record, result.family, { renderInspector: true });
      return;
    }
    if (action === 'remove-manager-record') {
      if (!confirmAction('Diesen Eintrag wirklich löschen?')) return;
      const next = getApi().state.removeCollectionRecord(record.family, trigger.dataset.familyCollection, trigger.dataset.familyRecordId);
      commit(record, next, { renderInspector: true });
    }
  }

  function bindEvents(record) {
    const { workbench } = record;
    record.clickHandler = event => {
      const trigger = event.target?.closest?.('[data-family-workbench-action]');
      if (!trigger || !workbench.contains(trigger)) return;
      event.preventDefault();
      handleAction(record, trigger, event);
    };
    record.inputHandler = event => {
      if (!workbench.contains(event.target)) return;
      handleDataField(record, event.target);
    };
    record.changeHandler = event => {
      if (!workbench.contains(event.target)) return;
      const orientation = event.target?.closest?.('[data-family-workbench-orientation]');
      if (orientation) {
        commit(record, getApi().state.updatePath(record.family, 'view.orientation', orientation.value));
        record.session?.setOrientation(orientation.value);
        return;
      }
      const relativeTarget = event.target?.closest?.('[data-family-relative-target]');
      if (relativeTarget) {
        const form = relativeTarget.closest('[data-family-relative-editor]');
        if (form) form.dataset.familyRelativeTargetMode = relativeTarget.value === '__new__' ? 'new' : 'existing';
        return;
      }
      handleDataField(record, event.target);
    };
    record.submitHandler = event => {
      const form = event.target?.closest?.('[data-family-relative-editor]');
      if (!form || !workbench.contains(form)) return;
      event.preventDefault();
      submitRelative(record, form);
    };
    workbench.addEventListener('click', record.clickHandler);
    workbench.addEventListener('input', record.inputHandler);
    workbench.addEventListener('change', record.changeHandler);
    workbench.addEventListener('submit', record.submitHandler);
  }

  function clearRecord(workbench) {
    const record = records.get(workbench);
    if (!record) return;
    if (record.mountFrame) cancelAnimationFrame(record.mountFrame);
    if (record.refreshFrame) cancelAnimationFrame(record.refreshFrame);
    if (record.fitFrame) cancelAnimationFrame(record.fitFrame);
    workbench.removeEventListener('click', record.clickHandler);
    workbench.removeEventListener('input', record.inputHandler);
    workbench.removeEventListener('change', record.changeHandler);
    workbench.removeEventListener('submit', record.submitHandler);
    clearChart(record);
    records.delete(workbench);
  }

  function mount(context = {}) {
    findWorkbenches(context.root || document).forEach(workbench => {
      clearRecord(workbench);
      const family = parseFamily(workbench);
      if (!family) return;
      const people = getApi().state.getRecords(family, 'genealogy.persons');
      const requestedPersonId = workbench.dataset.familyWorkbenchSelectedPerson || family.view?.initialFocusPersonId || '';
      const record = {
        workbench,
        family,
        selectedPersonId: getApi().state.findPerson(family, requestedPersonId)?.id || people[0]?.id || '',
        inspectorView: { type: 'person' },
        session: null,
        resizeObserver: null,
        clickHandler: null,
        inputHandler: null,
        changeHandler: null,
        submitHandler: null,
        mountFrame: 0,
        refreshFrame: 0,
        fitFrame: 0
      };
      records.set(workbench, record);
      bindEvents(record);
      updateChrome(record);
      renderInspector(record);
      record.mountFrame = requestAnimationFrame(() => {
        record.mountFrame = 0;
        refreshChart(record);
      });
    });
  }

  function unmount(context = {}) {
    findWorkbenches(context.root || document).forEach(clearRecord);
  }

  function getState(root = document) {
    const workbench = findWorkbenches(root)[0];
    const record = workbench ? records.get(workbench) : null;
    return Object.freeze({
      activePanel: record?.inspectorView?.type || null,
      inspectorView: record?.inspectorView ? { ...record.inspectorView } : null,
      selectedPersonId: record?.selectedPersonId || null,
      chart: record?.session ? record.session.getState() : null
    });
  }

  function restore(root, retained = {}) {
    const workbench = findWorkbenches(root)[0];
    const record = workbench ? records.get(workbench) : null;
    if (!record) return false;
    const state = isRecord(retained) ? retained : {};
    if (state.selectedPersonId) selectPerson(record, state.selectedPersonId, { focus: false, render: false });
    renderInspector(record, isRecord(state.inspectorView) ? state.inspectorView : { type: 'person' });
    if (record.selectedPersonId) record.session?.focus(record.selectedPersonId);
    return true;
  }

  const currentApi = isRecord(global.AleriaFamily) ? global.AleriaFamily : {};
  const currentWorkbench = isRecord(currentApi.workbench) ? currentApi.workbench : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    workbench: Object.freeze({ ...currentWorkbench, mount, unmount, getState, restore })
  });
})(globalThis);
