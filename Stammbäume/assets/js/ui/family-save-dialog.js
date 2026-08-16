import { createFolderPathFromHouseProfile } from '../domain/house-profile.js';
import { normalizeFamilyId } from '../services/family-library.js';
import { fillHouseRankSelect, renderHouseProfilePreview } from './house-profile-fields.js';
import { createHousePlacementFields } from './house-placement-fields.js';

export function createFamilySaveDialog(documentRef = document) {
  const dialog = documentRef.getElementById('family-save-dialog');
  const form = documentRef.getElementById('family-save-form');
  const rankSelect = form.elements.namedItem('rankId');
  const profilePreview = form.querySelector('[data-house-profile-preview]');
  const placementFields = createHousePlacementFields(
    form.querySelector('[data-family-save-placement]'),
    {
      rankSelect,
      onUpdate(placement) {
        renderHouseProfilePreview(
          profilePreview,
          placement.folderPath,
          placement.rankId,
          { unclassified: placement.unclassified }
        );
      }
    }
  );

  function open(family, folderPath = []) {
    form.elements.namedItem('id').value = normalizeFamilyId(family.document.id || family.document.title);
    form.elements.namedItem('title').value = family.document.title;
    const profile = family.document.houseProfile || {};
    const resolvedFolderPath = folderPath.length
      ? folderPath
      : createFolderPathFromHouseProfile(profile);
    const unclassified = family.extensions?.registry?.unclassified === true
      || resolvedFolderPath.length === 0;
    fillHouseRankSelect(rankSelect, profile.rankId, { requireKnownRank: true });
    placementFields.setFromProfile(profile, { folderPath: resolvedFolderPath, unclassified });
    dialog.showModal();
  }

  function read() {
    return {
      ...Object.fromEntries(new FormData(form).entries()),
      ...placementFields.read()
    };
  }

  return Object.freeze({ dialog, form, open, close: () => dialog.close(), read });
}
