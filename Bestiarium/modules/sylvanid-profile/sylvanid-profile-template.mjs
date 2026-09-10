import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const SYLVANID_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Sylvaniiden',
  pageGroup: 'Sylvaniiden',
  archiveEdition: 'Archiv der Wilden Domäne',
  archiveBadge: 'Wildnisarchiv',
  dossierName: 'Sylvaniidendossier',
  rootDataAttribute: 'data-sylvanid-profile',
  buildScript: 'Bestiarium/scripts/build-sylvanid-profiles.mjs',
  bestiaryChapterHref: '../../../index.html#infernale',
  categoryHref: '../../../wesen/gruppen/sylvaniiden/index.html',
  overviewHref: '../../../wesen/gruppen/sylvaniiden/index.html#verwandtschaft',
  overviewLinkLabel: 'Zur Ordnung der Sylvaniiden ↗',
  registerBackLabel: 'Sylvaniiden',
  footerBackLabel: 'Zurück zu den Sylvaniiden ↗'
});

export function renderSylvanidProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, SYLVANID_PROFILE_CONTEXT);
}
