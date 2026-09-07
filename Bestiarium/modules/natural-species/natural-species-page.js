import { mountEntryPreview } from '../entry-preview/entry-preview-ui.js?v=20260907-natural-species-v1';

const root = document.querySelector('[data-natural-species]');

if (root) {
  const entries = [...root.querySelectorAll('[data-species-entry]')].map(card => ({
    id: card.dataset.entryId,
    title: card.querySelector('[data-entry-title]').textContent,
    chapter: card.dataset.entryGroup,
    group: card.querySelector('[data-entry-region]').textContent,
    description: card.querySelector('[data-entry-description]').textContent,
    status: card.dataset.entryStatus,
    image: card.querySelector('img')?.src || null
  }));

  mountEntryPreview(root, entries);
}
