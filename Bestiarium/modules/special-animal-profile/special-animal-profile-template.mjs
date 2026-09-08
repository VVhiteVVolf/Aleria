import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const SPECIAL_ANIMAL_CONTEXT = Object.freeze({
  categoryName: 'Besondere Exemplare',
  pageGroup: 'Besondere Tiere',
  archiveEdition: 'Archiv besonderer Tiere',
  archiveBadge: 'Sonderarchiv',
  dossierName: 'Tierdossier',
  rootDataAttribute: 'data-special-animal-profile',
  buildScript: 'Bestiarium/scripts/build-special-animal-profiles.mjs',
  categoryHref: '../../../index.html#besondere',
  overviewHref: '../../../index.html#besondere',
  overviewLinkLabel: 'Zu den besonderen Exemplaren ↗',
  registerBackLabel: 'Besondere Exemplare',
  footerBackLabel: 'Zurück zu den besonderen Exemplaren ↗'
});

export function renderSpecialAnimalProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, SPECIAL_ANIMAL_CONTEXT);
}
