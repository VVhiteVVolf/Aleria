import { createDialogController } from '../entry-preview/dialog-controller.js?v=20260907-luetten-v1';

export function mountImageGallery(root) {
  const links = [...root.querySelectorAll('[data-action="open-gallery"]')];
  const dialog = root.querySelector('[data-role="gallery-dialog"]');
  const controller = createDialogController(dialog, 'close-gallery');
  const image = dialog.querySelector('[data-role="gallery-image"]');
  const title = dialog.querySelector('[data-role="gallery-title"]');
  const position = dialog.querySelector('[data-role="gallery-position"]');
  let selected = 0;

  function show(index) {
    selected = (index + links.length) % links.length;
    const link = links[selected];
    image.src = link.href;
    image.alt = link.dataset.galleryTitle;
    title.textContent = link.dataset.galleryTitle;
    position.textContent = `Bildtafel ${selected + 1} von ${links.length}`;
  }
  root.addEventListener('click', event => {
    const link = event.target.closest('[data-action="open-gallery"]');
    if (!link || !root.contains(link) || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    show(links.indexOf(link));
    controller.open(link);
  });
  dialog.addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (action === 'previous-image') show(selected - 1);
    if (action === 'next-image') show(selected + 1);
  });
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      show(selected + (event.key === 'ArrowLeft' ? -1 : 1));
    }
  });
}
