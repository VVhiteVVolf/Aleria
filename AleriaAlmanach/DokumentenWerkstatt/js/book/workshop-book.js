import { renderBookReader } from '../../../../Bestiarium/modules/book-reader/book-article-template.mjs';
import { mountBookReader } from '../../../../Bestiarium/modules/book-reader/book-reader.mjs';
import { sanitizeContent } from '../document-content.js';
import { paperBackground } from '../paper/paper-generator.js';
import { ensureDocumentFont } from '../fonts/document-fonts.js';
import { documentNotesMarkup } from '../notes/document-notes-markup.js';

export function buildWorkshopBook(meta, { notesPreview = false } = {}) {
  const sections = meta.pages.map((html, index) => {
    const section = document.createElement('template'); section.innerHTML = sanitizeContent(html);
    const title = section.content.firstElementChild?.matches('h2, h3') ? section.content.firstElementChild.textContent.trim() : '';
    return { id: `werkstatt-abschnitt-${index + 1}`, title: title || (index === 0 ? meta.title : `Aufzeichnung ${index + 1}`), html: section.innerHTML, side: meta.bookPageSides?.[index] || 'any' };
  });
  const topic = {
    title: meta.title, classification: meta.category || 'Aufzeichnungen aus Aleria',
    book: { author: meta.author, edition: meta.subtitle || 'Abschrift aus der Dokumentenwerkstatt',
      ...(meta.bookBackCover ? { backCoverImage: { src: meta.bookBackCover, alt: `Rückdeckel · ${meta.title}`, width: 1024, height: 1536 } } : {}) },
    sections: sections.map(({ id, title }) => ({ id, title, blocks: [] }))
  };
  const template = document.createElement('template');
  template.innerHTML = renderBookReader(topic);
  const root = template.content.querySelector('.book-reader');
  root.classList.add('workshop-book-reader');
  // Mounted explicitly by the workshop. Standalone HTML uses the same reader's auto-mount.
  root.removeAttribute('data-book-reader');
  root.dataset.workshopBook = '';
  root.dataset.documentId = meta.slug;
  root.style.setProperty('--preview-font', meta.font);
  root.style.setProperty('--preview-size', `${meta.fontSize}px`);
  root.style.setProperty('--doc-line-height', meta.lineHeight);
  root.style.setProperty('--doc-paragraph-spacing', `${meta.paragraphSpacing ?? 15}px`);
  root.style.setProperty('--doc-letter-spacing', `${meta.letterSpacing}px`);
  root.style.setProperty('--ink', meta.ink);
  const source = root.querySelector('[data-role="source"]');
  source.replaceChildren();
  sections.forEach(({ id, title, html, side }, pageIndex) => {
    const heading = document.createElement('h2');
    heading.id = id; heading.dataset.bookAnchor = heading.id;
    heading.textContent = title;
    if (side !== 'any') heading.dataset.bookSide = side;
    source.append(heading);
    const section = document.createElement('template'); section.innerHTML = sanitizeContent(html);
    if (section.content.firstElementChild?.matches('h2, h3')) section.content.firstElementChild.remove();
    [...section.content.childNodes].forEach((node, index) => {
      if (node.nodeType === Node.TEXT_NODE) {
        if (!node.textContent.trim()) return;
        const paragraph = document.createElement('p'); paragraph.textContent = node.textContent; node = paragraph;
      }
      if (node.nodeType !== Node.ELEMENT_NODE) return;
      node.dataset.bookAnchor = `${heading.id}-block-${index + 1}`;
      source.append(node);
    });
    if (meta.notesPage === pageIndex) {
      const notes = document.createElement('template'); notes.innerHTML = documentNotesMarkup({ preview: notesPreview });
      notes.content.firstElementChild.dataset.bookAnchor = `${heading.id}-notes`;
      source.append(notes.content);
    }
  });
  for (const part of [root, root.querySelector('[data-role="front-cover"]').content, root.querySelector('[data-role="back-cover"]').content]) {
    part.querySelectorAll('.book-cover-imprint').forEach(node => { node.textContent = 'Skriptorium · Aleria'; });
  }
  if (meta.media.main.image) {
    for (const cover of [root.querySelector('.book-cover-launch'), root.querySelector('[data-role="front-cover"]').content.firstElementChild]) {
      const inscription = cover.querySelector('.book-cover-inscription'); inscription?.remove();
      const image = document.createElement('img'); image.className = 'book-cover-art'; image.src = meta.media.main.image; image.alt = meta.title; cover.prepend(image);
    }
  }
  const paper = document.createElement('style');
  paper.textContent = `.workshop-book-reader .book-leaf:not(.book-cover){background-image:${paperBackground(meta)};background-size:100% 100%;background-color:transparent;}`;
  root.prepend(paper);
  return root.outerHTML;
}

export function createWorkshopBookMount(host) {
  let reader = null, generation = 0;
  return {
    async update(meta) {
      const current = ++generation;
      reader?.destroy(); reader = null;
      if (meta.template !== 'book') return;
      await ensureDocumentFont(meta);
      if (current !== generation) return;
      const root = host.querySelector('[data-workshop-book]');
      if (root) reader = mountBookReader(root, { initialAnchor: { id: `werkstatt-abschnitt-${meta.currentPage + 1}`, offset: 0 } });
    },
    destroy() { generation++; reader?.destroy(); reader = null; }
  };
}

export function readBookPosition(host) {
  const root = host.querySelector('[data-workshop-book]');
  if (!root) return null;
  const page = Number(root.querySelector('[data-role="page-status"]')?.dataset.page || 1);
  const visible = root.querySelector('.book-leaf[aria-hidden="false"]');
  return { cover: page === 0 ? 'front' : visible?.classList.contains('book-cover') ? 'back' : '',
    anchor: visible?.querySelector('[data-book-anchor]')?.dataset.bookAnchor,
    offset: Number(visible?.querySelector('[data-book-anchor]')?.dataset.bookOffset || 0) };
}
