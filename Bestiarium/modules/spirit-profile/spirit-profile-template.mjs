import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const SPIRIT_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Geister',
  pageGroup: 'Geister und Erscheinungen',
  archiveEdition: 'Archiv der Zwischenwelt',
  archiveBadge: 'Geisterarchiv',
  dossierName: 'Geisterdossier',
  rootDataAttribute: 'data-spirit-profile',
  buildScript: 'Bestiarium/scripts/build-spirit-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/geister/index.html',
  overviewHref: '../../../wesen/gruppen/geister/index.html#verwandtschaft',
  overviewLinkLabel: 'Zu den Geisterarten ↗',
  registerBackLabel: 'Geisterarten',
  footerBackLabel: 'Zurück zu den Geisterarten ↗'
});

export function renderSpiritProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, SPIRIT_PROFILE_CONTEXT);
}
