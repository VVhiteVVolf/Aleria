import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const VAMPIRE_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Vampire',
  pageGroup: 'Vampire',
  archiveEdition: 'Archiv der blutgebundenen Ordnung',
  archiveBadge: 'Vampirarchiv',
  dossierName: 'Vampirdossier',
  rootDataAttribute: 'data-vampire-profile',
  buildScript: 'Bestiarium/scripts/build-vampire-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/vampire/index.html',
  overviewHref: '../../../wesen/gruppen/vampire/index.html#verwandtschaft',
  overviewLinkLabel: 'Zu den Vampirgattungen ↗',
  registerBackLabel: 'Vampirgattungen',
  footerBackLabel: 'Zurück zu den Vampirgattungen ↗'
});

export function renderVampireProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, VAMPIRE_PROFILE_CONTEXT);
}
