// Owns only the currently displayed result page. Search, counts, grouping and
// bulk operations continue to use the complete filtered character list.
const AleriaCharacterResultPages = (() => {
  const pageSize = 36;
  let selectionKey = '';
  let pageIndex = 0;

  function select(entries, context) {
    const key = JSON.stringify([context, entries.map(character => character.id)]);
    if (selectionKey !== key) {
      selectionKey = key;
      pageIndex = 0;
    }
    const pageCount = Math.max(1, Math.ceil(entries.length / pageSize));
    pageIndex = Math.min(pageIndex, pageCount - 1);
    const start = pageIndex * pageSize;
    return { entries: entries.slice(start, start + pageSize), total: entries.length,
      start: entries.length ? start + 1 : 0, end: Math.min(start + pageSize, entries.length), pageCount, pageIndex };
  }

  function renderNavigation(container, page) {
    if (page.pageCount <= 1) return;
    const navigation = document.createElement('nav');
    navigation.className = 'char-result-pages';
    navigation.setAttribute('aria-label', 'Charakter-Ergebnisseiten');
    navigation.innerHTML = `
      <button type="button" data-character-page="${page.pageIndex - 1}" ${page.pageIndex === 0 ? 'disabled' : ''}>← Zurück</button>
      <span tabindex="-1" role="status">${page.start}–${page.end} von ${page.total} Figuren · Seite ${page.pageIndex + 1} / ${page.pageCount}</span>
      <button type="button" data-character-page="${page.pageIndex + 1}" ${page.pageIndex + 1 === page.pageCount ? 'disabled' : ''}>Weiter →</button>`;
    container.appendChild(navigation);
  }

  document.addEventListener('click', event => {
    const trigger = event.target?.closest?.('[data-character-page]');
    const grid = document.getElementById('char-grid');
    if (!trigger || trigger.disabled || !grid?.contains(trigger)) return;
    const next = Number(trigger.dataset.characterPage);
    if (!Number.isInteger(next) || next < 0) return;
    event.preventDefault();
    pageIndex = next;
    renderCharGrid();
    const status = grid.querySelector('.char-result-pages [role="status"]');
    status?.focus({ preventScroll: true });
    status?.scrollIntoView({ block: 'nearest' });
  });

  return Object.freeze({ select, renderNavigation });
})();
