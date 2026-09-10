import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const PSIONID_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Psioniden',
  pageGroup: 'Psioniden',
  archiveEdition: 'Archiv der Verborgenen Wahrheit',
  archiveBadge: 'Gedankenarchiv',
  dossierName: 'Psionidendossier',
  rootDataAttribute: 'data-psionid-profile',
  buildScript: 'Bestiarium/scripts/build-psionid-profiles.mjs',
  bestiaryChapterHref: '../../../index.html#infernale',
  categoryHref: '../../../wesen/gruppen/psioniden/index.html',
  overviewHref: '../../../wesen/gruppen/psioniden/index.html#verwandtschaft',
  overviewLinkLabel: 'Zur Ordnung der Psioniden ↗',
  registerBackLabel: 'Psioniden',
  footerBackLabel: 'Zurück zu den Psioniden ↗'
});

export function renderPsionidProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, PSIONID_PROFILE_CONTEXT);
}
