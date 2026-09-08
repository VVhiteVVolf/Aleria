import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const INSECT_CONTEXT = Object.freeze({
  categoryName: 'Rieseninsekten & Spinnen',
  pageGroup: 'Gliedertiere',
  archiveEdition: 'Entomologisches Archiv',
  archiveBadge: 'Gliedertierarchiv',
  dossierName: 'Gliedertierdossier',
  relatedLabel: 'Kasten & Unterarten',
  relatedEyebrow: 'Kasten und regionale Linien',
  rootDataAttribute: 'data-insect-profile',
  buildScript: 'Bestiarium/scripts/build-insect-profiles.mjs'
});

export function renderInsectProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, INSECT_CONTEXT);
}
