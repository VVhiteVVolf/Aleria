import { mountEntryPreview } from '../entry-preview/entry-preview-ui.js?v=20260907-luetten-v1';
import { mountImageGallery } from '../image-gallery/image-gallery-ui.js?v=20260907-luetten-v1';

const root = document.querySelector('[data-creature-profile]');
if (root) {
  const entries = [...root.querySelectorAll('[data-profile-entry]')].map(card => ({
    id: card.dataset.entryId,
    title: card.querySelector('[data-entry-title]').textContent,
    chapter: card.dataset.entryGroup,
    group: 'Weiterführender Eintrag',
    image: card.querySelector('img').src,
    description: card.querySelector('[data-entry-description]')?.textContent || 'Diese Bildtafel ist Teil der Sammlung. Die Beschreibung dieses Exemplars folgt auf seiner eigenen Seite.',
    status: 'Noch nicht ausgearbeitet'
  }));
  mountEntryPreview(root, entries);
  root.querySelectorAll('[data-role="image-gallery"]').forEach(mountImageGallery);
}
