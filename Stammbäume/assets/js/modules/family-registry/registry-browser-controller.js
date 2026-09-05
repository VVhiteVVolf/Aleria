import { createRegistryBrowserIndex, registryPathKey, resolveRegistryLocation } from './registry-browser-model.js';
import { renderRegistryContent, renderRegistryNavigation } from './registry-browser-view.js';

export function createRegistryBrowser({ root, records, browserWindow = window }) {
  const navigation = root.querySelector('[data-role="registry-navigation"]');
  const content = root.querySelector('[data-role="registry-content"]');
  const search = root.querySelector('#registry-search');
  const count = root.querySelector('#registry-count');
  const status = root.querySelector('[data-role="registry-status"]');
  const sidebar = root.querySelector('.registry-sidebar');
  const isNarrow = () => browserWindow.matchMedia('(max-width: 42rem)').matches;
  if (isNarrow()) sidebar.open = false;
  let index = createRegistryBrowserIndex(records);
  let selected = resolveRegistryLocation(index, new URL(browserWindow.location.href).searchParams.getAll('gebiet'));
  const expanded = new Set();

  function expandLocation() {
    selected.path.forEach((_, i) => expanded.add(registryPathKey(selected.path.slice(0, i + 1))));
  }
  function render() {
    navigation.innerHTML = renderRegistryNavigation(index, selected.key, expanded);
    const result = renderRegistryContent(index, selected, search.value);
    content.innerHTML = result.html;
    count.textContent = String(index.root.totalCount);
    status.textContent = result.status;
  }
  function selectLocation(node) {
    selected = node;
    search.value = '';
    expandLocation();
    const url = new URL(browserWindow.location.href);
    url.searchParams.delete('gebiet');
    node.path.forEach(name => url.searchParams.append('gebiet', name));
    if (url.href !== browserWindow.location.href) browserWindow.history.pushState(null, '', url);
    render();
    if (isNarrow()) sidebar.open = false;
    content.querySelector('h2')?.focus({ preventScroll: true });
  }
  function onClick(event) {
    const button = event.target.closest('button[data-action]');
    if (!button || !root.contains(button)) return;
    if (button.dataset.action === 'clear-search') {
      search.value = '';
      render();
      search.focus();
      return;
    }
    const key = button.dataset.path;
    const node = index.nodes.get(key);
    if (!node) return;
    if (button.dataset.action === 'select-region') selectLocation(node);
    if (button.dataset.action === 'toggle-region') {
      if (expanded.has(key)) expanded.delete(key);
      else expanded.add(key);
      navigation.innerHTML = renderRegistryNavigation(index, selected.key, expanded);
      [...navigation.querySelectorAll('[data-action="toggle-region"]')]
        .find(toggle => toggle.dataset.path === key)?.focus({ preventScroll: true });
    }
  }
  function onPopState() {
    selected = resolveRegistryLocation(index, new URL(browserWindow.location.href).searchParams.getAll('gebiet'));
    search.value = '';
    expandLocation();
    render();
  }
  root.addEventListener('click', onClick);
  search.addEventListener('input', render);
  browserWindow.addEventListener('popstate', onPopState);
  expandLocation();
  render();
  return {
    updateRecords(nextRecords) {
      index = createRegistryBrowserIndex(nextRecords);
      selected = resolveRegistryLocation(index, selected.path);
      expandLocation();
      render();
    },
    destroy() {
      root.removeEventListener('click', onClick);
      search.removeEventListener('input', render);
      browserWindow.removeEventListener('popstate', onPopState);
    }
  };
}
