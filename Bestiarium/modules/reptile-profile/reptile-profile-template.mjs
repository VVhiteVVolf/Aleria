import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const REPTILE_CONTEXT = Object.freeze({
  categoryName: 'Reptilien',
  pageGroup: 'Reptilien',
  archiveEdition: 'Herpetologisches Archiv',
  archiveBadge: 'Reptilienarchiv',
  dossierName: 'Reptiliendossier',
  relatedLabel: 'Varianten & Verwandte',
  relatedEyebrow: 'Stammbaum der Sumpfreptilien',
  rootDataAttribute: 'data-reptile-profile',
  buildScript: 'Bestiarium/scripts/build-reptile-profiles.mjs'
});

export function renderReptileProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, REPTILE_CONTEXT);
}
