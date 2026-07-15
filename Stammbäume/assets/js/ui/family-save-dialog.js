import { normalizeFamilyId } from '../services/family-library.js';

export function createFamilySaveDialog(documentRef = document) {
  const dialog = documentRef.getElementById('family-save-dialog');
  const form = documentRef.getElementById('family-save-form');

  function open(family, folderPath = []) {
    form.elements.namedItem('id').value = normalizeFamilyId(family.document.id || family.document.title);
    form.elements.namedItem('title').value = family.document.title;
    form.elements.namedItem('folderPath').value = folderPath.join(' > ');
    dialog.showModal();
  }

  function read() {
    return Object.fromEntries(new FormData(form).entries());
  }

  return Object.freeze({ dialog, form, open, close: () => dialog.close(), read });
}
