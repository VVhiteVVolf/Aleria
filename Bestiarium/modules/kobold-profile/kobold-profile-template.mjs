import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const KOBOLD_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Kobolde',
  pageGroup: 'Kobolde, Wichtel & Goblins',
  archiveEdition: 'Archiv der niederen Infernalwesen',
  archiveBadge: 'Koboldarchiv',
  dossierName: 'Kobolddossier',
  rootDataAttribute: 'data-kobold-profile',
  buildScript: 'Bestiarium/scripts/build-kobold-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/kobolde/index.html',
  overviewHref: '../../../wesen/gruppen/kobolde/index.html#verwandtschaft',
  overviewLinkLabel: 'Zu den Koboldarten ↗',
  registerBackLabel: 'Koboldarten',
  footerBackLabel: 'Zurück zu den Koboldarten ↗'
});

export function renderKoboldProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, KOBOLD_PROFILE_CONTEXT);
}
