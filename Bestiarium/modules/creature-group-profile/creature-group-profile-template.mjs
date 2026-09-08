import { renderFieldGuideProfile } from '../field-guide-profile/field-guide-profile-template.mjs';

const CREATURE_GROUP_CONTEXT = Object.freeze({
  categoryName: 'Kreaturen',
  pageGroup: 'Kreaturen',
  archiveEdition: 'Kreaturenkundliches Archiv',
  archiveBadge: 'Kreaturenarchiv',
  dossierName: 'Gattungsdossier',
  relatedLabel: 'Bekannte Unterarten',
  relatedEyebrow: 'Überlieferte Erscheinungsformen',
  rootDataAttribute: 'data-creature-group-profile',
  buildScript: 'Bestiarium/scripts/build-creature-group-profiles.mjs',
  categoryHref: '../../../index.html#kreaturen',
  overviewHref: '../../../index.html#kreaturen',
  overviewLinkLabel: 'Zu den Kreaturengruppen ↗',
  registerBackLabel: 'Kreaturengruppen',
  footerBackLabel: 'Zurück zu den Kreaturengruppen ↗'
});

export function renderCreatureGroupProfile(record, navigation = {}) {
  return renderFieldGuideProfile(record, navigation, CREATURE_GROUP_CONTEXT);
}
