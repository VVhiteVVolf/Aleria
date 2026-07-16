import { normalizeFamilyId, parseFolderPath } from '../services/family-library.js';
import { fillHouseRankSelect, renderHouseProfilePreview } from './house-profile-fields.js';

export function createFamilySaveDialog(documentRef = document) {
  const dialog = documentRef.getElementById('family-save-dialog');
  const form = documentRef.getElementById('family-save-form');
  const folderPathInput = form.elements.namedItem('folderPath');
  const rankSelect = form.elements.namedItem('rankId');
  const profilePreview = form.querySelector('[data-house-profile-preview]');

  function updateProfilePreview() {
    renderHouseProfilePreview(profilePreview, parseFolderPath(folderPathInput.value), rankSelect.value);
  }

  function open(family, folderPath = []) {
    form.elements.namedItem('id').value = normalizeFamilyId(family.document.id || family.document.title);
    form.elements.namedItem('title').value = family.document.title;
    folderPathInput.value = folderPath.join(' > ');
    fillHouseRankSelect(rankSelect, family.document.houseProfile?.rankId);
    updateProfilePreview();
    dialog.showModal();
  }

  function read() {
    return Object.fromEntries(new FormData(form).entries());
  }

  folderPathInput.addEventListener('input', updateProfilePreview);
  rankSelect.addEventListener('change', updateProfilePreview);

  return Object.freeze({ dialog, form, open, close: () => dialog.close(), read });
}
