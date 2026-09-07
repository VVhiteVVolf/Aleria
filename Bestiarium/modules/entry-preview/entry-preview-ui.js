import { createDialogController } from './dialog-controller.js?v=20260907-luetten-v1';

export function mountEntryPreview(root, entries) {
  const dialog = root.querySelector('[data-role="entry-preview"]');
  const byId = new Map(entries.map(entry => [entry.id, entry]));
  const field = name => dialog.querySelector(`[data-role="preview-${name}"]`);
  const controller = createDialogController(dialog, 'close-preview');

  function open(entry, trigger) {
    field('title').textContent = entry.title;
    field('chapter').textContent = entry.chapter;
    field('note').textContent = entry.note || entry.group;
    field('description').textContent = entry.description;
    field('status').textContent = entry.status || (entry.image ? 'Tafel in Vorbereitung' : 'Seite in Vorbereitung');
    field('art').replaceChildren();
    field('art').hidden = !entry.image;
    if (entry.image) {
      const image = document.createElement('img');
      image.src = entry.image;
      image.alt = '';
      image.width = 240;
      image.height = 240;
      field('art').append(image);
    }
    controller.open(trigger);
  }

  root.addEventListener('click', event => {
    const trigger = event.target.closest('[data-action="preview-entry"]');
    if (!trigger || !root.contains(trigger)) return;
    const entry = byId.get(trigger.dataset.entryId);
    if (entry) open(entry, trigger);
  });
}
