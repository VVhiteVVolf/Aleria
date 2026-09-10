import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const GIANT_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Riesen',
  pageGroup: 'Riesenarten',
  archiveEdition: 'Archiv der gefallenen Größe',
  archiveBadge: 'Riesenarchiv',
  dossierName: 'Riesendossier',
  rootDataAttribute: 'data-giant-profile',
  buildScript: 'Bestiarium/scripts/build-giant-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/riesen/index.html',
  overviewHref: '../../../wesen/gruppen/riesen/index.html#verwandtschaft',
  overviewLinkLabel: 'Zu den Riesenarten ↗',
  registerBackLabel: 'Riesenarten',
  footerBackLabel: 'Zurück zu den Riesenarten ↗'
});

export function renderGiantProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, GIANT_PROFILE_CONTEXT);
}
