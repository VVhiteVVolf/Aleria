import { COMBAT_SHEET_PAGES } from './combat-sheet-pages.js';
const normalize = value => String(value || '').normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('de');

// Presentation state only. Every form stays mounted and its draft stays with
// the combat editor; navigation/search never serialize or replace profile data.
export function createCombatSheetWorkspace() {
  let owner = '', page = 'overview', controller, frame = 0;
  const searches = new Map(), expanded = new Set(), positions = new Map();
  function activate(root, id, focus = false, remember = true) {
    if (!COMBAT_SHEET_PAGES.some(candidate => candidate.id === id)) return;
    const scroll = root.closest('.cp-combat-tab');
    if (scroll && remember) positions.set(page, scroll.scrollTop);
    page = id;
    root.querySelectorAll('[data-sheet-page]').forEach(button => {
      const active = button.dataset.sheetPage === id;
      button.setAttribute('aria-selected', String(active)); button.tabIndex = active ? 0 : -1;
      if (active && focus) button.focus({ preventScroll: true });
    });
    root.querySelectorAll('.cs-page').forEach(panel => { panel.hidden = panel.id !== `cs-page-${id}`; });
    if (scroll) scroll.scrollTop = positions.get(id) || 0;
  }
  function filter(root, id) {
    const panel = root.querySelector(`#cs-page-${id}`);
    if (!panel) return;
    const words = normalize(searches.get(id)).split(/\s+/).filter(Boolean);
    const entries = [...panel.querySelectorAll('[data-sheet-entry]')];
    let visible = 0;
    for (const entry of entries) {
      const matches = words.every(word => normalize(entry.dataset.sheetSearchText || entry.textContent).includes(word));
      entry.hidden = !matches; if (matches) visible++;
    }
    const count = panel.querySelector('[data-sheet-results]');
    if (count) count.textContent = entries.length ? `${visible} / ${entries.length}` : '';
    const empty = panel.querySelector('[data-sheet-empty]');
    if (empty) empty.hidden = !words.length || visible > 0 || !entries.length;
  }
  return {
    reset(id) {
      controller?.abort(); if (frame) cancelAnimationFrame(frame);
      owner = id || ''; page = 'overview'; searches.clear(); expanded.clear(); positions.clear();
    },
    capture(root) {
      if (root.dataset.sheetOwner !== owner) return;
      root.querySelectorAll('details[data-sheet-entry], details[data-sheet-disclosure]').forEach(entry => {
        const key = entry.dataset.sheetEntry || entry.dataset.sheetDisclosure;
        if (entry.open) expanded.add(key); else expanded.delete(key);
      });
      const scroll = root.closest('.cp-combat-tab');
      if (scroll) positions.set(page, scroll.scrollTop);
    },
    mount(root) {
      controller?.abort(); controller = new AbortController(); root.dataset.sheetOwner = owner;
      if (frame) { cancelAnimationFrame(frame); frame = 0; }
      const { signal } = controller;
      root.querySelectorAll('details[data-sheet-entry], details[data-sheet-disclosure]').forEach(entry => { entry.open = expanded.has(entry.dataset.sheetEntry || entry.dataset.sheetDisclosure); });
      root.querySelectorAll('[data-sheet-search]').forEach(input => {
        input.value = searches.get(input.dataset.sheetSearch) || ''; filter(root, input.dataset.sheetSearch);
      });
      activate(root, page, false, false);
      root.addEventListener('click', event => {
        const button = event.target.closest('[data-sheet-page]');
        if (button) activate(root, button.dataset.sheetPage);
      }, { signal });
      root.addEventListener('input', event => {
        const id = event.target.dataset.sheetSearch; if (!id) return;
        searches.set(id, event.target.value);
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => { frame = 0; filter(root, id); });
      }, { signal });
      root.addEventListener('keydown', event => {
        const button = event.target.closest('[data-sheet-page]'); if (!button) return;
        const index = COMBAT_SHEET_PAGES.findIndex(candidate => candidate.id === button.dataset.sheetPage);
        const next = { ArrowRight: (index + 1) % COMBAT_SHEET_PAGES.length, ArrowLeft: (index + COMBAT_SHEET_PAGES.length - 1) % COMBAT_SHEET_PAGES.length, Home: 0, End: COMBAT_SHEET_PAGES.length - 1 }[event.key];
        if (next == null) return; event.preventDefault(); activate(root, COMBAT_SHEET_PAGES[next].id, true);
      }, { signal });
    }
  };
}
