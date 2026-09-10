import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const NECROPHAGE_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Nekrophagen',
  pageGroup: 'Nekrophagen und Untote',
  archiveEdition: 'Archiv der gestörten Totenruhe',
  archiveBadge: 'Nekrophagenarchiv',
  dossierName: 'Nekrophagendossier',
  rootDataAttribute: 'data-necrophage-profile',
  buildScript: 'Bestiarium/scripts/build-necrophage-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/nekrophagen/index.html',
  overviewHref: '../../../wesen/gruppen/nekrophagen/index.html#verwandtschaft',
  overviewLinkLabel: 'Zu den Nekrophagenarten ↗',
  registerBackLabel: 'Nekrophagenarten',
  footerBackLabel: 'Zurück zu den Nekrophagenarten ↗'
});

export function renderNecrophageProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, NECROPHAGE_PROFILE_CONTEXT);
}
