import { readCatalogState, writeCatalogState } from './catalog-model.mjs?v=20260910-religions-v1';
import { createCatalogView } from './catalog-ui.mjs?v=20260910-religions-v1';

export function initializeReligionCatalog(root, locationWindow = window) {
  const view = createCatalogView(root);
  const controller = new AbortController();
  const options = { signal: controller.signal };

  function readLocation() {
    const url = new URL(locationWindow.location.href);
    const state = readCatalogState(url, view.chapterIds);
    view.syncControls(state);
    view.render(state, url.hash.slice(1));
  }

  function updateFromControls() {
    const state = view.readControls();
    const url = writeCatalogState(locationWindow.location.href, state);
    view.render(state, url.hash.slice(1));
    locationWindow.history.replaceState(null, '', url);
  }

  root.addEventListener('input', event => {
    if (event.target === view.controls.search) updateFromControls();
  }, options);
  root.addEventListener('change', event => {
    if (event.target === view.controls.chapter || event.target === view.controls.sort) updateFromControls();
  }, options);
  root.addEventListener('keydown', event => {
    if (event.target === view.controls.search && event.key === 'Escape') {
      event.preventDefault();
      view.controls.search.value = '';
      updateFromControls();
    }
  }, options);
  root.addEventListener('click', event => {
    const control = event.target.closest('[data-action]');
    if (!control || !root.contains(control)) return;
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    if (control.dataset.action === 'reset-catalog') {
      view.syncControls({ query: '', chapterId: 'all', sort: 'register' });
      updateFromControls();
      view.controls.search.focus();
    } else if (control.dataset.action === 'navigate-chapter') {
      // Native fragment navigation remains intact, including without JavaScript.
      view.syncControls({ query: '', chapterId: 'all', sort: 'register' });
      updateFromControls();
    }
  }, options);
  locationWindow.addEventListener('popstate', readLocation, options);
  locationWindow.addEventListener('hashchange', readLocation, options);
  readLocation();
  root.querySelector('[data-role="catalog-tools"]').hidden = false;
  return () => controller.abort();
}

const root = document.querySelector('[data-religion-catalog]');
if (root) initializeReligionCatalog(root);
