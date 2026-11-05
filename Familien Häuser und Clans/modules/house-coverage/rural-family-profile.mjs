import { FLEISCHSAMMLER_FAMILIES_INDEX } from '../../../Stammbäume/assets/js/data/gwynthor-fleischsammler/localities.mjs';
import { normalizeHouseBiographyModule } from '../../../Stammbäume/assets/js/modules/house-biography/house-biography-model.js';

const profiles = new Map(FLEISCHSAMMLER_FAMILIES_INDEX.map(locality => [locality.familyId, locality]));
const hasBiography = value => value && typeof value === 'object'
  && typeof value.house?.biographyText === 'string' && Boolean(value.house.biographyText.trim());

/** These source-owned households have family profiles, not commissioned warrior pages. */
export function createRuralFamilyCoverageProfile(record, effectiveBiography) {
  const locality = profiles.get(record?.id);
  if (!locality || record.family?.document?.id !== locality.familyId
    || record.family.document.emblem !== locality.emblem
    || !hasBiography(record.family.extensions?.houseBiographyModule)) return null;
  return Object.freeze({
    kind: 'family-record', id: locality.familyId,
    href: `Stammbäume/Stammbaum.html?family=${encodeURIComponent(locality.familyId)}&mode=view`,
    sourcePath: `Stammbäume/assets/js/data/gwynthor-fleischsammler/${locality.slug}-family.js`,
    imageSource: locality.emblem, imageRole: 'family-crest', biographyAction: 'open-house-biography',
    biography: hasBiography(effectiveBiography) ? normalizeHouseBiographyModule(effectiveBiography) : null,
  });
}
