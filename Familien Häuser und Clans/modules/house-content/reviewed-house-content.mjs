// Apply reviewed editorial text to prepared canonical facts. No family is mutated.
import { houseBiographyDefaultFingerprint } from '../../../Stammbäume/assets/js/modules/house-biography/house-biography-fingerprint.js';

export function applyReviewedHouseContent(content, { record, sections = {}, biographySummary,
  trivia = [], prepared = false }) {
  if (!biographySummary?.overview) throw new Error(`Geprüfter Bio-Überblick fehlt: ${record.id}`);
  for (const [key, value] of Object.entries(sections)) if (value?.trim()) content.sections[key] = value;
  content.prepared = prepared;
  // The full shell exposes all reviewed chapters, including martial traditions.
  if (!prepared) content.page = 'haus.html';
  content.biographyIntroTitle = content.type === 'Clan' ? 'Über den Clan' : 'Über die Familie';
  content.biographyHistoryTitle = 'Geschichte';
  content.trivia = [...trivia];
  content.biographySummary = { ...biographySummary, influence: biographySummary.influence || [],
    achievements: biographySummary.achievements || [], trivia: biographySummary.trivia || [] };
  const previous = record.family.extensions.houseBiographyModule;
  content.biographyPreviousDefaultFingerprints = previous ? [houseBiographyDefaultFingerprint(previous)] : [];
  return content;
}
