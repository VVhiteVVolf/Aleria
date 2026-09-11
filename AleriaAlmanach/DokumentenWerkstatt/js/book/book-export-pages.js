import { paginateBook, createLeaf, findAnchorPage } from '../../../../Bestiarium/modules/book-reader/book-pagination.mjs?v=20260909-books-v2';
import { buildWorkshopBook } from './workshop-book.js';

export function prepareBookExportPages(meta, { readable = false, position = null } = {}) {
  const width = Math.floor(Math.min(960, meta.width) / 2), height = Math.max(560, Math.min(720, meta.height));
  const stage = document.createElement('div');
  stage.className = `document-export-stage workshop-book-export${readable ? ' readable-document' : ''}`;
  stage.style.width = `${width}px`; stage.innerHTML = buildWorkshopBook(meta);
  document.body.append(stage);
  const root = stage.querySelector('.book-reader');
  root.style.setProperty('--book-width', `${width}px`); root.style.setProperty('--book-height', `${height}px`);
  const mount = root.querySelector('[data-role="mount"]');
  root.querySelector('[data-role="stage"]').hidden = false;
  const source = root.querySelector('[data-role="source"]'); source.hidden = true;
  const pages = paginateBook(source, mount, { width, height, title: meta.title });
  if (pages.length % 2) {
    const blank = createLeaf(meta.title, pages.length + 1); blank.body.innerHTML = '<p class="book-end-mark">❧</p>'; pages.push(blank.leaf);
  }
  const leaves = [root.querySelector('[data-role="front-cover"]').content.firstElementChild.cloneNode(true), ...pages, root.querySelector('[data-role="back-cover"]').content.firstElementChild.cloneNode(true)];
  mount.replaceChildren(...leaves);
  let index = findAnchorPage(leaves, { id: position?.anchor || `werkstatt-abschnitt-${meta.currentPage + 1}`, offset: position?.offset || 0 });
  if (position?.cover) index = position.cover === 'front' ? 0 : leaves.length - 1;
  return { stage, leaves, index, width, height, destroy: () => stage.remove() };
}
