import {
  createHouseProfileFromFolderPath,
  formatHouseProfile,
  getHouseRank,
  listHouseRanks
} from '../domain/house-profile.js';

export function fillHouseRankSelect(select, selectedRankId = 'unknown', options = {}) {
  const requireKnownRank = options.requireKnownRank === true;
  const ranks = listHouseRanks().filter(rank => !requireKnownRank || rank.id !== 'unknown');
  const choices = ranks.map(rank => new Option(rank.label, rank.id));
  if (requireKnownRank) {
    const placeholder = new Option('Bitte Tier-Level wählen', '', true, false);
    placeholder.disabled = true;
    choices.unshift(placeholder);
  }
  select.replaceChildren(...choices);
  const selected = getHouseRank(selectedRankId).id;
  select.value = requireKnownRank && selected === 'unknown' ? '' : selected;
}

export function renderHouseProfilePreview(element, folderPath, rankId, options = {}) {
  const profile = createHouseProfileFromFolderPath(folderPath, { rankId });
  const summary = formatHouseProfile(profile);
  element.textContent = options.unclassified
    ? `${summary || 'Rang noch nicht gewählt'} · Nicht einsortiert`
    : summary
    || 'Adelsrang und Orts-Hierarchie werden beim Speichern in der Familienakte hinterlegt.';
}
