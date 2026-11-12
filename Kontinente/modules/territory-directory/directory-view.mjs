// The default follows the whole register, never its current search results.
export function resolveDirectoryView(count, preference = '') {
  return ['list', 'cards'].includes(preference) ? preference : count > 10 ? 'list' : 'cards';
}

export function mountDirectoryView(root, toolbar, count, preference = '') {
  const controls = document.createElement('div');
  controls.className = 'directory-view-controls';
  controls.setAttribute('role', 'group');
  controls.setAttribute('aria-label', 'Häuseransicht');
  for (const [view, label] of [['list', 'Detailliste'], ['cards', 'Große Ansicht']]) {
    const button = document.createElement('button');
    button.type = 'button';
    button.dataset.action = 'set-directory-view';
    button.dataset.view = view;
    button.textContent = label;
    controls.append(button);
  }
  function update(value) {
    root.dataset.directoryViewPreference = ['list', 'cards'].includes(value) ? value : '';
    root.dataset.directoryView = resolveDirectoryView(count, value);
    for (const button of controls.children) {
      button.setAttribute('aria-pressed', String(button.dataset.view === root.dataset.directoryView));
    }
  }
  controls.addEventListener('click', event => {
    const button = event.target.closest('[data-action="set-directory-view"]');
    if (button) update(button.dataset.view);
  });
  update(preference);
  toolbar.append(controls);
}
