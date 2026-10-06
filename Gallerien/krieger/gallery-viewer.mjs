import { normalizeSearch } from './gallery-state.mjs?v=20261006';
import { galleryElement, assetUrl } from './gallery-view.mjs?v=20261006';

/** Owns the image dialog and its assignment form; the gallery owns filtering. */
export function createImageViewer(root, catalog, state, onAssignmentsChanged) {
  const role = name => root.querySelector(`[data-role="${name}"]`);
  const dialog = role('viewer');
  const houseInput = root.querySelector('#assignment-house');
  const houseChoices = new Map(catalog.houses.map(h => [`${h.name} · ${h.location}`, h.id]));
  let activeImageId = '';
  let navigationIds = [];
  const dataList = root.querySelector('#gallery-houses');
  for (const value of houseChoices.keys()) {
    const option = galleryElement('option');
    option.value = value;
    dataList.append(option);
  }

  function renderAssignments(message = '') {
    const assigned = state.assignments(state.imageById.get(activeImageId));
    role('assignments').replaceChildren(...assigned.map(id => {
      const name = state.houseById.get(id).name;
      const chip = galleryElement('span', '', name);
      const button = galleryElement('button', '', '×');
      button.type = 'button';
      button.dataset.action = 'remove-assignment';
      button.dataset.houseId = id;
      button.setAttribute('aria-label', `${name} aus Zuordnung entfernen`);
      chip.append(button);
      return chip;
    }));
    if (!assigned.length) role('assignments').append(galleryElement('p', '', 'Noch keinem Haus zugeordnet.'));
    role('storage-status').textContent = message;
  }

  function renderSources(image) {
    role('sources').replaceChildren(...image.sources.map((source, index) => {
      const item = galleryElement('li');
      const link = galleryElement('a', '', source.label || `Fundstelle ${index + 1}`);
      link.href = assetUrl(source.path);
      link.target = '_blank';
      link.rel = 'noopener';
      item.append(link);
      if (source.original) {
        const original = galleryElement('a', '', ' · Ursprüngliche Bildquelle ↗');
        original.href = source.original;
        original.target = '_blank';
        original.rel = 'noopener';
        item.append(original);
      }
      return item;
    }));
  }

  function showVariant(index) {
    const image = state.imageById.get(activeImageId);
    const variant = image.variants?.[index] || image;
    role('viewer-image').src = assetUrl(variant.image);
    role('original').href = assetUrl(variant.image);
  }

  function open(imageId, imageIds = navigationIds) {
    const image = state.imageById.get(imageId);
    if (!image) return;
    activeImageId = imageId;
    navigationIds = imageIds.includes(imageId) ? [...imageIds] : [imageId];
    showVariant(0);
    role('viewer-image').alt = image.name;
    root.querySelector('#viewer-title').textContent = image.name;
    role('viewer-category').textContent = image.category;
    role('viewer-note').textContent = image.note;
    role('viewer-origin').textContent = image.houseIds.map(id => state.houseById.get(id).name).join(' · ') || image.affiliation || 'Keine Hauszuordnung belegt';
    const variants = image.variants || [];
    role('variant-control').hidden = variants.length < 2;
    role('variant').replaceChildren(...variants.map((variant, index) => {
      const option = galleryElement('option', '', `${index + 1} · ${variant.label}`);
      option.value = String(index);
      return option;
    }));
    role('conversion-note').textContent = image.localGroup ? 'Lokale Quellen als WebP in Originalabmessungen übernommen. Die Originaldateien bleiben im Herkunftsordner erhalten.' : '';
    renderSources(image);
    houseInput.value = '';
    houseInput.setCustomValidity('');
    renderAssignments();
    const index = navigationIds.indexOf(imageId);
    dialog.querySelector('[data-action="previous"]').disabled = index <= 0;
    dialog.querySelector('[data-action="next"]').disabled = index >= navigationIds.length - 1;
    if (!dialog.open) dialog.showModal();
  }

  function navigate(direction) {
    const imageId = navigationIds[navigationIds.indexOf(activeImageId) + direction];
    if (imageId) open(imageId);
  }

  function updateAssignment(action, houseId) {
    const message = state[action](activeImageId, houseId);
    onAssignmentsChanged();
    renderAssignments(message);
  }

  dialog.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const { action, houseId } = button.dataset;
    if (action === 'close-viewer') dialog.close();
    if (action === 'previous') navigate(-1);
    if (action === 'next') navigate(1);
    if (action === 'remove-assignment') updateAssignment('remove', houseId);
    if (action === 'restore-assignment') updateAssignment('restore');
  });
  houseInput.addEventListener('input', () => houseInput.setCustomValidity(''));
  role('variant').addEventListener('change', event => showVariant(Number(event.target.value)));
  role('assignment-form').addEventListener('submit', event => {
    event.preventDefault();
    const id = houseChoices.get(houseInput.value) || catalog.houses.find(h => normalizeSearch(h.name) === normalizeSearch(houseInput.value))?.id;
    if (!id) {
      houseInput.setCustomValidity('Bitte ein vorhandenes Haus aus der Liste auswählen.');
      houseInput.reportValidity();
      return;
    }
    updateAssignment('assign', id);
    houseInput.value = '';
  });
  dialog.addEventListener('keydown', event => {
    if (event.target.matches('input,select,textarea')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      navigate(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  return { open };
}
