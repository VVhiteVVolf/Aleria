import { selectFactions } from './faction-model.mjs';

function initFactionCatalog(root) {
  const search = root.querySelector('[data-role="search"]');
  const cards = [...root.querySelectorAll('[data-faction-id]')];
  const groups = [...root.querySelectorAll('[data-faction-group]')];
  const bundles = [...root.querySelectorAll('[data-faction-bundle]')];
  const chapters = [...root.querySelectorAll('[data-faction-chapter]')];
  const categoryIds = new Set(chapters.map(chapter => chapter.dataset.factionChapter));
  const entries = cards.map(card => ({
    id: card.dataset.factionId, parentId: card.dataset.parentId,
    categoryId: card.dataset.categoryId, search: card.dataset.search,
  }));
  const state = { query: '', categoryId: 'all' };

  function render() {
    const { matches, visible } = selectFactions(entries, state);
    for (const card of cards) {
      card.hidden = !visible.has(card.dataset.factionId);
      card.querySelector('[data-role="context-label"]').hidden = card.hidden || matches.has(card.dataset.factionId);
    }
    for (const group of groups) {
      const shown = [...group.querySelectorAll('[data-faction-id]')].filter(card => !card.hidden);
      group.hidden = !shown.length;
      group.querySelector('[data-role="group-count"]').textContent = String(shown.length);
    }
    for (const bundle of bundles) {
      bundle.hidden = !visible.has(bundle.dataset.factionBundle);
      const content = bundle.querySelector(':scope > [data-role="bundle-content"]');
      content.hidden = ![...content.querySelectorAll('[data-faction-id]')].some(card => !card.hidden);
    }
    for (const chapter of chapters) chapter.hidden = ![...chapter.querySelectorAll('[data-faction-id]')].some(card => !card.hidden);
    for (const link of root.querySelectorAll('[data-action="select-category"]')) {
      if (link.dataset.category === state.categoryId) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    }
    const contextCount = visible.size - matches.size;
    const matchedCategories = new Set(entries.filter(entry => matches.has(entry.id)).map(entry => entry.categoryId));
    const scopeLabel = state.categoryId === 'all'
      ? `${matchedCategories.size} ${matchedCategories.size === 1 ? 'Bereich' : 'Bereiche'}`
      : chapters.find(chapter => chapter.dataset.factionChapter === state.categoryId).querySelector('h2').textContent;
    root.querySelector('[data-role="result-count"]').textContent = `${matches.size} ${matches.size === 1 ? 'Eintrag' : 'Einträge'} · ${scopeLabel}${contextCount ? ` · ${contextCount} ${contextCount === 1 ? 'übergeordneter Verband' : 'übergeordnete Verbände'} zur Einordnung` : ''}`;
    root.querySelector('[data-role="empty"]').hidden = matches.size > 0;
    root.querySelector('.catalog-results [data-action="reset-catalog"]').hidden = !state.query && state.categoryId === 'all';
  }

  function showEntry(id, focus = true) {
    const card = cards.find(candidate => candidate.dataset.factionId === id);
    if (!card) return;
    state.query = '';
    state.categoryId = card.dataset.categoryId;
    search.value = '';
    render();
    card.scrollIntoView({ block: 'center' });
    if (focus) card.focus({ preventScroll: true });
  }

  function readHash() {
    const hash = window.location.hash.slice(1);
    if (hash.startsWith('fraktion-')) showEntry(hash.slice(9));
    else if (categoryIds.has(hash) || hash === 'verzeichnis' || !hash) {
      state.categoryId = categoryIds.has(hash) ? hash : 'all';
      render();
    }
  }

  root.addEventListener('input', event => {
    if (event.target !== search) return;
    state.query = search.value;
    render();
  });
  root.addEventListener('click', event => {
    const action = event.target.closest('[data-action]');
    if (!action || !root.contains(action)) return;
    // Preserve native open-in-new-tab behavior for register and relation links.
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
    if (action.dataset.action === 'select-category') {
      event.preventDefault();
      state.categoryId = action.dataset.category;
      state.query = '';
      search.value = '';
      history.pushState(null, '', state.categoryId === 'all' ? '#verzeichnis' : `#${state.categoryId}`);
      render();
      root.querySelector('#verzeichnis').scrollIntoView({ block: 'start' });
    } else if (action.dataset.action === 'reset-catalog') {
      state.query = '';
      state.categoryId = 'all';
      search.value = '';
      history.replaceState(null, '', '#verzeichnis');
      render();
      search.focus();
    } else if (action.dataset.action === 'show-faction') {
      event.preventDefault();
      history.pushState(null, '', `#fraktion-${action.dataset.entryTarget}`);
      showEntry(action.dataset.entryTarget);
    }
  });
  window.addEventListener('hashchange', readHash);
  root.querySelector('[data-role="catalog-tools"]').hidden = false;
  readHash();
}

const root = document.querySelector('[data-faction-catalog]');
if (root) initFactionCatalog(root);
