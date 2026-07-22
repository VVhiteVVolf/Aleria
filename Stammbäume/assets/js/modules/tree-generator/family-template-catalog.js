export const FAMILY_TEMPLATE_DEFINITIONS = Object.freeze([
  Object.freeze({
    id: 'compact',
    label: 'Kompakt',
    description: 'Eine schmale Hauptlinie mit wenigen Seitenästen.',
    minimumChildren: 1,
    maximumChildren: 2,
    maximumContinuingLines: 1,
    additionalLineChance: 0,
    sideMarriageChance: 0.12,
    twinChance: 0.04,
    adoptionChance: 0.03,
    bastardChance: 0.04,
    specialAgingChance: 0.01,
    siblingYearSpread: 3
  }),
  Object.freeze({
    id: 'balanced',
    label: 'Ausgewogen',
    description: 'Eine gut lesbare Dynastie mit Haupt- und einzelnen Nebenlinien.',
    minimumChildren: 2,
    maximumChildren: 4,
    maximumContinuingLines: 2,
    additionalLineChance: 0.48,
    sideMarriageChance: 0.28,
    twinChance: 0.08,
    adoptionChance: 0.05,
    bastardChance: 0.08,
    specialAgingChance: 0.02,
    siblingYearSpread: 5
  }),
  Object.freeze({
    id: 'large',
    label: 'Groß',
    description: 'Eine breite Großfamilie mit mehreren fortgeführten Linien.',
    minimumChildren: 3,
    maximumChildren: 6,
    maximumContinuingLines: 3,
    additionalLineChance: 0.76,
    sideMarriageChance: 0.42,
    twinChance: 0.12,
    adoptionChance: 0.07,
    bastardChance: 0.11,
    specialAgingChance: 0.03,
    siblingYearSpread: 7
  })
]);

const TEMPLATE_BY_ID = new Map(FAMILY_TEMPLATE_DEFINITIONS.map(template => [template.id, template]));

export function getFamilyTemplateDefinition(templateId) {
  return TEMPLATE_BY_ID.get(String(templateId || '')) || TEMPLATE_BY_ID.get('balanced');
}
