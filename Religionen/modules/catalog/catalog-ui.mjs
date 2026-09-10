import { filterEntries, sortEntries } from './catalog-model.mjs?v=20260910-religions-v1';

export function createCatalogView(root) {
  const chapters = [...root.querySelectorAll('[data-chapter]')].map(node => ({
    id: node.dataset.chapter, node, grid: node.querySelector('[data-role="entry-grid"]'),
    count: node.querySelector('[data-role="chapter-count"]')
  }));
  const entries = chapters.flatMap(chapter => [...chapter.node.querySelectorAll('[data-entry-id]')].map(node => ({
    id: node.dataset.entryId, title: node.dataset.title, searchText: node.dataset.search,
    order: Number(node.dataset.order), chapterId: chapter.id, node
  })));
  const controls = {
    search: root.querySelector('[data-role="search"]'),
    chapter: root.querySelector('[data-role="chapter-filter"]'),
    sort: root.querySelector('[data-role="sort"]')
  };
  let lastSort = 'register';

  function render(state, activeChapter = '') {
    const visible = filterEntries(entries, state);
    const ids = new Set(visible.map(entry => entry.id));
    for (const entry of entries) entry.node.hidden = !ids.has(entry.id);
    for (const chapter of chapters) {
      const members = entries.filter(entry => entry.chapterId === chapter.id);
      const count = members.filter(entry => ids.has(entry.id)).length;
      const selected = state.chapterId === 'all' || state.chapterId === chapter.id;
      chapter.node.hidden = !selected || (members.length ? count === 0 : Boolean(state.query.trim()));
      chapter.count.textContent = members.length ? String(count).padStart(2, '0') : '—';
      if (chapter.grid && lastSort !== state.sort) {
        for (const entry of sortEntries(members, state.sort)) chapter.grid.append(entry.node);
      }
    }
    lastSort = state.sort;
    root.querySelector('[data-role="empty"]').hidden = chapters.some(chapter => !chapter.node.hidden);
    root.querySelector('[data-role="result-count"]').textContent = `${visible.length} von ${entries.length} Einträgen`;
    root.querySelector('.filter-row [data-action="reset-catalog"]').hidden = !state.query && state.chapterId === 'all' && state.sort === 'register';
    for (const anchor of root.querySelectorAll('[data-action="navigate-chapter"]')) {
      const current = anchor.dataset.chapterId === (state.chapterId === 'all' ? activeChapter : state.chapterId);
      if (current) anchor.setAttribute('aria-current', 'location');
      else anchor.removeAttribute('aria-current');
    }
  }

  function syncControls(state) {
    controls.search.value = state.query;
    controls.chapter.value = state.chapterId;
    controls.sort.value = state.sort;
  }

  function readControls() {
    return { query: controls.search.value, chapterId: controls.chapter.value, sort: controls.sort.value };
  }

  return { controls, chapterIds: chapters.map(chapter => chapter.id), render, syncControls, readControls };
}
