import {
  createHouseProfileFromFolderPath,
  formatHouseProfile,
  getHouseRank,
  listHouseRanks
} from '../domain/house-profile.js';

export function fillHouseRankSelect(select, selectedRankId = 'unknown') {
  select.replaceChildren(...listHouseRanks().map(rank => new Option(rank.label, rank.id)));
  select.value = getHouseRank(selectedRankId).id;
}

export function renderHouseProfilePreview(element, folderPath, rankId) {
  const profile = createHouseProfileFromFolderPath(folderPath, { rankId });
  element.textContent = formatHouseProfile(profile)
    || 'Adelsrang und Orts-Hierarchie werden beim Speichern in der Familienakte hinterlegt.';
}
