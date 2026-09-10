import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const OGROID_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Ogroiden',
  pageGroup: 'Ogroiden',
  archiveEdition: 'Archiv der infernalen Heere',
  archiveBadge: 'Ogroidenarchiv',
  dossierName: 'Ogroidendossier',
  rootDataAttribute: 'data-ogroid-profile',
  buildScript: 'Bestiarium/scripts/build-ogroid-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/ogroiden/index.html',
  overviewHref: '../../../wesen/gruppen/ogroiden/index.html#verwandtschaft',
  overviewLinkLabel: 'Zu den Ogroidenarten ↗',
  registerBackLabel: 'Ogroidenarten',
  footerBackLabel: 'Zurück zu den Ogroidenarten ↗'
});

export function renderOgroidProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, OGROID_PROFILE_CONTEXT);
}
