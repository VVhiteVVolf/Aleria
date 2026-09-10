import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const BLOODSUCKER_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Blutsauger',
  pageGroup: 'Blutsauger',
  archiveEdition: 'Archiv der vampirischen Infektionen',
  archiveBadge: 'Sprossarchiv',
  dossierName: 'Sprossdossier',
  rootDataAttribute: 'data-bloodsucker-profile',
  buildScript: 'Bestiarium/scripts/build-bloodsucker-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/blutsauger/index.html',
  overviewHref: '../../../wesen/gruppen/blutsauger/index.html#verwandtschaft',
  overviewLinkLabel: 'Zu den bekannten Sprossen ↗',
  registerBackLabel: 'Blutsaugerarten',
  footerBackLabel: 'Zurück zu den Blutsaugerarten ↗'
});

const BLOODSUCKER_GROUP_CONTEXT = Object.freeze({
  categoryName: 'Vampire',
  pageGroup: 'Blutsauger',
  archiveEdition: 'Archiv der vampirischen Infektionen',
  archiveBadge: 'Sprossarchiv',
  dossierName: 'Gattungsdossier',
  relatedLabel: 'Bekannte Sprossformen',
  relatedEyebrow: 'Infizierte Linien',
  rootDataAttribute: 'data-bloodsucker-group-profile',
  buildScript: 'Bestiarium/scripts/build-bloodsucker-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/vampire/index.html#verwandtschaft',
  overviewHref: '../../../wesen/gruppen/vampire/index.html#verwandtschaft',
  overviewLinkLabel: 'Zur Vampirhierarchie ↗',
  registerBackLabel: 'Vampirhierarchie',
  footerBackLabel: 'Zurück zur Vampirhierarchie ↗'
});

export function renderBloodsuckerProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, BLOODSUCKER_PROFILE_CONTEXT);
}

export function renderBloodsuckerGroup(record) {
  return renderFieldGuideProfile(record, {}, BLOODSUCKER_GROUP_CONTEXT);
}
