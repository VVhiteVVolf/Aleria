import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const NAUTILOID_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Nautiloiden',
  pageGroup: 'Nautiloiden',
  archiveEdition: 'Archiv der Untiefen',
  archiveBadge: 'Tiefenarchiv',
  dossierName: 'Nautiloidendossier',
  rootDataAttribute: 'data-nautiloid-profile',
  buildScript: 'Bestiarium/scripts/build-nautiloid-profiles.mjs',
  bestiaryChapterHref: '../../../index.html#infernale',
  categoryHref: '../../../wesen/gruppen/nautiloiden/index.html',
  overviewHref: '../../../wesen/gruppen/nautiloiden/index.html#verwandtschaft',
  overviewLinkLabel: 'Zur Ordnung der Nautiloiden ↗',
  registerBackLabel: 'Nautiloiden',
  footerBackLabel: 'Zurück zu den Nautiloiden ↗'
});

export function renderNautiloidProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, NAUTILOID_PROFILE_CONTEXT);
}
