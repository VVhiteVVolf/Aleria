export function mountGuideDirectory(root) {
  let selected = null;
  const normalize = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de');
  const search = root.querySelector('[data-role="directory-search"]');
  const filter = () => {
    let count = 0;
    for (const card of root.querySelectorAll('[data-guide-card]')) {
      card.hidden = !!(selected && !selected.has(card.dataset.guideCard)) || !normalize(card.dataset.search).includes(normalize(search.value));
      if (!card.hidden) count++;
    }
    root.querySelector('[data-role="directory-status"]').textContent = `${count} Charakter-Guide${count === 1 ? '' : 's'}`;
    root.querySelector('[data-role="directory-empty"]').hidden = count > 0;
  };
  const clearSelection = () => { selected = null; root.querySelectorAll('[data-action="filter-directory-node"]').forEach(b => b.setAttribute('aria-pressed','false')); };
  search.addEventListener('input',filter);
  root.addEventListener('click',event => {
    const button = event.target.closest('[data-action]'); if (!button) return;
    if (button.dataset.action === 'filter-directory-node') {
      clearSelection(); selected = new Set(button.dataset.slugs.split(' ')); button.setAttribute('aria-pressed','true');
    } else if (button.dataset.action === 'reset-directory') { clearSelection(); search.value = ''; }
    else if (button.dataset.action === 'directory-mode') {
      clearSelection();
      root.querySelectorAll('[data-directory-tree]').forEach(tree => tree.hidden = tree.dataset.directoryTree !== button.dataset.mode);
      root.querySelectorAll('[data-action="directory-mode"]').forEach(b => b.setAttribute('aria-pressed',String(b === button)));
    } else return;
    filter();
  });
}
