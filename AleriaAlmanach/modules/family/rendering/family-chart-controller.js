// Owns Family Chart DOM sessions and their scoped lifecycle.

(function installFamilyChartController(global) {
  'use strict';

  const records = new WeakMap();

  function isRecord(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function findFamilyPages(root) {
    if (!root) return [];
    const pages = [];
    if (root.matches?.('.family-page')) pages.push(root);
    root.querySelectorAll?.('.family-page').forEach(page => pages.push(page));
    return [...new Set(pages)];
  }

  function setStatus(pageElement, message, state = 'ready') {
    const status = pageElement.querySelector('[data-family-chart-status]');
    if (!status) return;
    status.textContent = message;
    status.dataset.state = state;
  }

  function clearRecord(pageElement) {
    const record = records.get(pageElement);
    if (!record) return;
    if (record.mountFrame) cancelAnimationFrame(record.mountFrame);
    if (record.fitFrame) cancelAnimationFrame(record.fitFrame);
    record.resizeObserver?.disconnect();
    if (record.clickHandler) pageElement.removeEventListener('click', record.clickHandler);
    if (record.changeHandler) pageElement.removeEventListener('change', record.changeHandler);
    record.session?.destroy();
    records.delete(pageElement);
  }

  function bindControls(pageElement, record) {
    record.clickHandler = event => {
      const action = event.target?.closest?.('[data-family-action]')?.dataset.familyAction;
      if (!action || !pageElement.contains(event.target)) return;
      if (action === 'fit-chart') record.session.fit();
    };
    record.changeHandler = event => {
      const orientationSelect = event.target?.closest?.('[data-family-orientation-select]');
      if (orientationSelect && pageElement.contains(orientationSelect)) {
        record.session.setOrientation(orientationSelect.value);
        setStatusFromSession(pageElement, record);
      }
    };
    pageElement.addEventListener('click', record.clickHandler);
    pageElement.addEventListener('change', record.changeHandler);
  }

  function setStatusFromSession(pageElement, record) {
    if (!record?.session) return;
    const state = record.session.getState();
    const warningCount = state.diagnostics.filter(item => item.severity !== 'info').length
      + record.migrationReport.filter(item => item.severity !== 'info').length;
    const suffix = warningCount ? ` · ${warningCount} Hinweise` : '';
    setStatus(pageElement, `${record.session.getData().length} Personen${suffix}`, warningCount ? 'notice' : 'ready');
  }

  function observeSize(pageElement, host, record) {
    if (typeof ResizeObserver !== 'function') return;
    let previousWidth = host.clientWidth;
    let previousHeight = host.clientHeight;
    record.resizeObserver = new ResizeObserver(entries => {
      const size = entries[0]?.contentRect;
      if (!size?.width || !size?.height) return;
      if (Math.abs(size.width - previousWidth) < 2 && Math.abs(size.height - previousHeight) < 2) return;
      previousWidth = size.width;
      previousHeight = size.height;
      if (record.fitFrame) cancelAnimationFrame(record.fitFrame);
      record.fitFrame = requestAnimationFrame(() => {
        record.fitFrame = 0;
        if (records.get(pageElement) === record) record.session.fit();
      });
    });
    record.resizeObserver.observe(host);
  }

  function mountPageElement(pageElement, context, record) {
    if (records.get(pageElement) !== record || !pageElement.isConnected) return;
    const host = pageElement.querySelector('[data-family-chart-host]');
    const api = global.AleriaFamily;
    const adapter = api?.adapters?.familyChart;
    const compatibility = api?.compatibility;
    if (!host || !adapter || !compatibility?.read) {
      setStatus(pageElement, 'Stammbaum-Komponenten konnten nicht geladen werden.', 'error');
      return;
    }

    try {
      const resolved = compatibility.read(context.page?.family || {});
      const family = resolved.family;
      const searchContainer = pageElement.querySelector('[data-family-search-host]');
      const view = {
        ...(isRecord(family.view) ? family.view : {}),
        orientation: pageElement.dataset.familyOrientation || family.view?.orientation || 'vertical'
      };
      record.migrationReport = resolved.report || [];
      record.session = adapter.createSession({
        container: host,
        searchContainer,
        searchPlaceholder: 'Person suchen',
        family,
        view,
        options: {
          transitionTime: context.preview ? 0 : 320,
          unknownParentLabel: 'Unbekannt',
          sanitizeImageSource: typeof global.sanitizeImageSrc === 'function'
            ? global.sanitizeImageSrc
            : undefined
        },
        onAfterUpdate: () => {
          if (records.get(pageElement) === record) setStatusFromSession(pageElement, record);
        }
      });
      host.dataset.familyChartMounted = 'true';
      const searchInput = searchContainer?.querySelector?.('input');
      searchInput?.setAttribute('aria-label', 'Person im Stammbaum suchen');
      const orientationSelect = pageElement.querySelector('[data-family-orientation-select]');
      if (orientationSelect) orientationSelect.value = record.session.getState().orientation;
      bindControls(pageElement, record);
      observeSize(pageElement, host, record);
      setStatusFromSession(pageElement, record);
      record.fitFrame = requestAnimationFrame(() => {
        record.fitFrame = 0;
        if (records.get(pageElement) === record) record.session.fit();
      });
    } catch (error) {
      host.replaceChildren();
      const fallback = host.ownerDocument.createElement('div');
      fallback.className = 'family-chart-error';
      fallback.setAttribute('role', 'alert');
      fallback.textContent = error?.message || 'Der Stammbaum konnte nicht aufgebaut werden.';
      host.appendChild(fallback);
      setStatus(pageElement, 'Stammbaum konnte nicht geladen werden.', 'error');
    }
  }

  function mount(context = {}) {
    const root = context.root || document;
    unmount({ root });
    findFamilyPages(root).forEach(pageElement => {
      const record = {
        session: null,
        migrationReport: [],
        resizeObserver: null,
        clickHandler: null,
        changeHandler: null,
        fitFrame: 0,
        mountFrame: 0
      };
      record.mountFrame = requestAnimationFrame(() => {
        record.mountFrame = 0;
        mountPageElement(pageElement, {
          ...context,
          preview: Boolean(global._moduleRenderPreviewContext?.entry)
            || Boolean(pageElement.closest('.module-editor-preview-frame, .inline-module-preview-frame'))
        }, record);
      });
      records.set(pageElement, record);
    });
  }

  function unmount(context = {}) {
    findFamilyPages(context.root || document).forEach(clearRecord);
  }

  function getState(root = document) {
    const pageElement = findFamilyPages(root)[0];
    const record = pageElement ? records.get(pageElement) : null;
    return record?.session ? record.session.getState() : null;
  }

  const currentApi = isRecord(global.AleriaFamily) ? global.AleriaFamily : {};
  const currentPageApi = isRecord(currentApi.page) ? currentApi.page : {};
  global.AleriaFamily = Object.freeze({
    apiVersion: currentApi.apiVersion || 1,
    schema: currentApi.schema || 'aleria.family',
    schemaVersion: currentApi.schemaVersion || 2,
    ...currentApi,
    page: Object.freeze({ ...currentPageApi, mount, unmount, getState })
  });
})(globalThis);
