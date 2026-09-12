/** Owns the temporary opening of nested domain registers for search and print. */
export function createMagicDisclosures(root) {
  const panels = [...root.querySelectorAll('[data-magic-disclosure]')];
  const groups = [...root.querySelectorAll('[data-magic-domain-group]')];
  let searchSnapshot = null;

  function hasVisibleDomain(element) {
    return [...element.querySelectorAll('[data-magic-domain]')].some(entry => !entry.hidden);
  }

  function applySearch(query) {
    const searching = Boolean(query.trim());
    if (searching && !searchSnapshot) searchSnapshot = panels.map(panel => panel.open);
    panels.forEach((panel, index) => {
      panel.hidden = !hasVisibleDomain(panel);
      if (searching) panel.open = !panel.hidden;
      else if (searchSnapshot) panel.open = searchSnapshot[index];
    });
    groups.forEach(group => { group.hidden = !hasVisibleDomain(group); });
    if (!searching) searchSnapshot = null;
  }

  function reveal(target) {
    let panel = target.closest('[data-magic-disclosure]');
    while (panel && root.contains(panel)) {
      panel.hidden = false;
      panel.open = true;
      panel = panel.parentElement.closest('[data-magic-disclosure]');
    }
  }

  return { applySearch, reveal, panels, groups };
}
