import { BESTIARY_ENTRIES } from './modules/catalog/catalog-data.js?v=20260907-fairean-v1';
import { BESTIARY_TOPICS } from './modules/topic-board/topic-board-data.js?v=20260907-topic-articles-v1';
import { mountCatalog } from './modules/catalog/catalog-ui.js?v=20260907-fairean-v1';
import { mountTopicBoard } from './modules/topic-board/topic-board-ui.js?v=20260907-topic-articles-v1';
import { mountEntryPreview } from './modules/entry-preview/entry-preview-ui.js?v=20260907-luetten-v1';

const root = document.querySelector('[data-bestiary]');
if (root) {
  const board = mountTopicBoard(root.querySelector('[data-role="topic-board"]'));
  const catalog = mountCatalog(root.querySelector('[data-role="catalog"]'), { onQueryChange: board.search });
  mountEntryPreview(root, [...BESTIARY_ENTRIES, ...BESTIARY_TOPICS]);
  root.querySelector('[data-role="chapter-navigation"]').addEventListener('click', event => {
    if (event.target.closest('a[href^="#"]')) catalog.reset();
  });
  // The chapters are rendered after the browser's initial fragment resolution.
  const target = document.getElementById(location.hash.slice(1));
  if (target && root.contains(target)) requestAnimationFrame(() => target.scrollIntoView());
}
