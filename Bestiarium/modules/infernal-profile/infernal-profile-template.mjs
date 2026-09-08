import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const INFERNAL_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Infernale Wesen',
  pageGroup: 'Infernale Wesen',
  archiveEdition: 'Archiv infernaler Wesen',
  archiveBadge: 'Infernales Archiv',
  dossierName: 'Wesensdossier',
  rootDataAttribute: 'data-infernal-profile',
  buildScript: 'Bestiarium/scripts/build-infernal-profiles.mjs',
  categoryHref: '../../../index.html#infernale',
  overviewHref: '../../../index.html#infernale',
  overviewLinkLabel: 'Zu den infernalen Wesen ↗',
  registerBackLabel: 'Infernale Wesen',
  footerBackLabel: 'Zurück zu den infernalen Wesen ↗'
});

export function renderInfernalProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, INFERNAL_PROFILE_CONTEXT);
}
