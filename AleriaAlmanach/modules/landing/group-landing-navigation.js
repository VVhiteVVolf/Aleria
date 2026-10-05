// Ephemeral view state is scoped to the modal host, never stored with a group.
const views = new WeakMap();

export function mountGroupNavigation(root, owner, key) {
  const abort = new AbortController();
  const tabs = [...root.querySelectorAll('[data-group-tab]')];
  function activate(name, focus = false) {
    if (!tabs.some(tab => tab.dataset.groupTab === name)) return;
    root.dataset.groupActiveTab = name;
    views.set(owner, { key, name });
    for (const tab of tabs) {
      const active = tab.dataset.groupTab === name;
      tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
      if (active && focus) tab.focus();
    }
    for (const panel of root.querySelectorAll('[data-group-tab-panel]')) panel.hidden = panel.dataset.groupTabPanel !== name;
    root.dispatchEvent(new CustomEvent('aleria:group-tab-changed', { detail: { name } }));
  }
  root.addEventListener('click', event => {
    const tab = event.target.closest?.('[data-group-tab]');
    if (tab) activate(tab.dataset.groupTab);
  }, { signal: abort.signal });
  root.addEventListener('keydown', event => {
    const tab = event.target.closest?.('[data-group-tab]');
    if (!tab || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(tab);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    activate(tabs[next].dataset.groupTab, true);
  }, { signal: abort.signal });
  const previous = views.get(owner);
  activate(previous?.key === key ? previous.name : 'roster');
  return () => abort.abort();
}
