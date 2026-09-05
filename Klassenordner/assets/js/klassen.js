import { filterClassEntries, pickRandomClass } from '../../modules/catalog/class-catalog-model.js?v=20260905-1';
import { readClassCatalog, createClassCatalogView } from '../../modules/catalog/class-catalog-ui.js?v=20260905-1';
import { appendClassLore } from '../../modules/lore/class-lore-ui.js?v=20260905-1';
import { createClassSheetView } from '../../modules/sheets/class-sheet-ui.js?v=20260905-2';
import { getUniversalClassPageHref } from '../../modules/pages/universal-class-registry.js?v=20260905-universal-v1';
import { getCultureClassPageHref } from '../../modules/culture/culture-class-registry.js?v=20260905-cenyr-attacks-v1';

function initializeClassPage(root) {
  const catalog = readClassCatalog(root);
  const view = createClassCatalogView(root, catalog);
  const dialog = root.querySelector('[data-role="class-sheet"]');
  const sheet = createClassSheetView(dialog);
  const search = root.querySelector('[data-role="search"]');
  const groupFilter = root.querySelector('[data-role="group-filter"]');
  const byId = new Map(catalog.entries.map(entry => [entry.id, entry]));
  const state = { query: '', groupId: 'all' };
  let visibleEntries = [];
  let returnHash = '';
  let opener = null;

  function renderFilters({ updateUrl = true } = {}) {
    state.query = search.value;
    state.groupId = groupFilter.value;
    visibleEntries = filterClassEntries(catalog.entries, state);
    view.render(visibleEntries, state);
    view.setActiveGroup(state.groupId === 'all' ? visibleEntries[0]?.groupId : state.groupId);
    if (updateUrl) {
      const url = new URL(window.location.href);
      if (state.query) url.searchParams.set('q', state.query);
      else url.searchParams.delete('q');
      if (state.groupId !== 'all') url.searchParams.set('herkunft', state.groupId);
      else url.searchParams.delete('herkunft');
      window.history.replaceState(null, '', url);
    }
  }

  function readLocation() {
    const url = new URL(window.location.href);
    const legacyBaseId = url.hash.match(/^#klasse-basis-(.+)$/)?.[1];
    const legacyCulture = url.hash.match(/^#klasse-([a-z]+)-([a-z]+)$/);
    const classPage = (legacyBaseId && getUniversalClassPageHref(legacyBaseId))
      || (legacyCulture && getCultureClassPageHref(legacyCulture[1], legacyCulture[2]));
    if (classPage) {
      window.location.replace(new URL(classPage, url));
      return;
    }
    search.value = url.searchParams.get('q') || '';
    const group = url.searchParams.get('herkunft');
    groupFilter.value = catalog.groups.some(entry => entry.id === group) ? group : 'all';
    renderFilters({ updateUrl: false });
    const entry = byId.get(url.hash.replace(/^#klasse-/, ''));
    if (entry && url.hash.startsWith('#klasse-')) sheet.open(entry);
    else {
      sheet.close();
      returnHash = url.hash;
      if (catalog.groups.some(group => `#${group.id}` === url.hash)) view.setActiveGroup(url.hash.slice(1));
    }
  }

  function openSheet(entry, trigger) {
    if (!entry) return;
    const classPage = entry.groupId === 'basis' ? getUniversalClassPageHref(entry.classId)
      : getCultureClassPageHref(entry.groupId, entry.classId);
    if (classPage) {
      window.location.assign(new URL(classPage, window.location.href));
      return;
    }
    opener = trigger;
    if (!dialog.open) returnHash = window.location.hash;
    const url = new URL(window.location.href);
    url.hash = `klasse-${entry.id}`;
    window.history.pushState(null, '', url);
    sheet.open(entry);
  }

  function resetFilters() {
    search.value = '';
    groupFilter.value = 'all';
    renderFilters();
  }

  root.addEventListener('input', event => {
    if (event.target === search) renderFilters();
  });
  root.addEventListener('change', event => {
    if (event.target === groupFilter) renderFilters();
  });
  search.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      event.preventDefault();
      search.value = '';
      renderFilters();
    }
  });
  root.addEventListener('click', event => {
    const control = event.target.closest('[data-action]');
    if (!control || !root.contains(control)) return;
    if (control.tagName === 'A' && (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0)) return;
    switch (control.dataset.action) {
      case 'open-class':
        event.preventDefault();
        openSheet(byId.get(control.dataset.entryId), control);
        break;
      case 'close-sheet':
        sheet.close();
        break;
      case 'reset-filters':
        resetFilters();
        search.focus();
        break;
      case 'navigate-group':
        // Navigation must also reveal sections hidden by the current filters.
        resetFilters();
        view.setActiveGroup(control.dataset.groupId);
        break;
      case 'random-class': {
        const entry = pickRandomClass(visibleEntries, {
          excludeMilitia: root.querySelector('[data-role="exclude-militia"]').checked
        });
        if (entry) openSheet(entry, control);
        else {
          const feedback = root.querySelector('[data-role="random-feedback"]');
          feedback.textContent = 'Die Auswahl enthält nur Milizen. Erlaube Milizen beim Würfeln oder erweitere deine Suche.';
          feedback.hidden = false;
        }
        break;
      }
    }
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    if (window.location.hash.startsWith('#klasse-')) {
      const url = new URL(window.location.href);
      url.hash = returnHash.startsWith('#klasse-') ? '' : returnHash;
      window.history.replaceState(null, '', url);
    }
    if (opener?.isConnected && !opener.hidden) opener.focus({ preventScroll: true });
  });
  window.addEventListener('hashchange', readLocation);
  window.addEventListener('popstate', readLocation);

  root.addEventListener('error', event => {
    const image = event.target;
    if (image.tagName !== 'IMG' || image.dataset.fallback) return;
    image.dataset.fallback = 'true';
    image.src = '../IconOrdner/ReiterIcons/Klassen.png';
  }, true);

  appendClassLore(catalog.groups);
  readLocation();
  root.querySelector('[data-role="catalog-tools"]').hidden = false;
}

const root = document.querySelector('[data-class-page]');
if (root) initializeClassPage(root);
