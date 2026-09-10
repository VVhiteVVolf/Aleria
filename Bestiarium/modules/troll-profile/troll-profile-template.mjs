import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const TROLL_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Trolle',
  pageGroup: 'Trollarten',
  archiveEdition: 'Archiv der verwunschenen Riesen',
  archiveBadge: 'Trollarchiv',
  dossierName: 'Trolldossier',
  rootDataAttribute: 'data-troll-profile',
  buildScript: 'Bestiarium/scripts/build-troll-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/trolle/index.html',
  overviewHref: '../../../wesen/gruppen/trolle/index.html#verwandtschaft',
  overviewLinkLabel: 'Zu den Trollarten ↗',
  registerBackLabel: 'Trollarten',
  footerBackLabel: 'Zurück zu den Trollarten ↗'
});

export function renderTrollProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, TROLL_PROFILE_CONTEXT);
}
