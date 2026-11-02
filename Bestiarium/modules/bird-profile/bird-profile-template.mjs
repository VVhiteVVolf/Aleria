import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const BIRD_CONTEXT = Object.freeze({
  categoryName: 'Flugwesen', pageGroup: 'Vögel', archiveEdition: 'Vogelkundliches Archiv',
  archiveBadge: 'Vogelarchiv', dossierName: 'Vogeldossier', rootDataAttribute: 'data-bird-profile',
  buildScript: 'Bestiarium/scripts/build-bird-profiles.mjs',
  categoryHref: '../index.html', overviewHref: '../index.html',
  overviewLinkLabel: 'Zu den Flugwesen ↗', registerBackLabel: 'Alle Flugwesen',
  footerBackLabel: 'Zurück zu den Flugwesen ↗'
});

export function renderBirdProfile(record) {
  return renderFieldGuideProfile(record, {}, BIRD_CONTEXT);
}
