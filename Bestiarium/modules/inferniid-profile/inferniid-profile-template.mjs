import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const INFERNIID_PROFILE_CONTEXT = Object.freeze({
  categoryName: 'Inferniiden',
  pageGroup: 'Inferniiden',
  archiveEdition: 'Archiv der infernalen Hierarchien',
  archiveBadge: 'Inferniidenarchiv',
  dossierName: 'Inferniidendossier',
  rootDataAttribute: 'data-inferniid-profile',
  buildScript: 'Bestiarium/scripts/build-inferniid-profiles.mjs',
  categoryHref: '../../../wesen/gruppen/inferniiden/index.html',
  overviewHref: '../../../wesen/gruppen/inferniiden/index.html#verwandtschaft',
  overviewLinkLabel: 'Zur infernalen Hierarchie ↗',
  registerBackLabel: 'Inferniiden',
  footerBackLabel: 'Zurück zu den Inferniiden ↗'
});

const ARCHDEVIL_OVERVIEW_CONTEXT = Object.freeze({
  categoryName: 'Inferniiden',
  pageGroup: 'Erzteufel',
  archiveEdition: 'Dagons Prinzenarchiv',
  archiveBadge: 'Erzteufelarchiv',
  dossierName: 'Fürstenregister',
  relatedLabel: 'Die sechs Prinzen',
  relatedEyebrow: 'Inkarnationen Dagons',
  rootDataAttribute: 'data-archdevil-overview',
  buildScript: 'Bestiarium/scripts/build-inferniid-profiles.mjs',
  categoryHref: '../inferniiden/index.html',
  overviewHref: '../inferniiden/index.html#verwandtschaft',
  overviewLinkLabel: 'Zur Hierarchie der Inferniiden ↗',
  registerBackLabel: 'Inferniiden',
  footerBackLabel: 'Zurück zur Hierarchie der Inferniiden ↗'
});

export function renderInferniidProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, INFERNIID_PROFILE_CONTEXT);
}

export function renderArchdevilOverview(record) {
  return renderFieldGuideProfile(record, {}, ARCHDEVIL_OVERVIEW_CONTEXT);
}
