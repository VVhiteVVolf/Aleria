// Authored Aleria game expressions, not clinical descriptions or diagnoses.
const skill = (name, bonus) => ({ name, bonus });
const cap = maximum => ['intelligence', 'wisdom'].map(attributeKey => ({ attributeKey, maximum }));
export const PSYCHOLOGICAL_TRAIT_DEFINITIONS = Object.freeze([
  ['psychopath', 'Psychopath', 'Aleria-Spielprägung der emotionalen Distanz: +1 auf Rettungswürfe gegen Furcht; −1 auf Motiv erkennen und Flirten. Die Prägung vermittelt keine Ermittlerausbildung.',
    { skillModifiers: [skill('Motiv erkennen', -1), skill('Flirten', -1)], saveModifiers: [{ kind: 'fear', bonus: 1 }] }, 0],
  ['soziopath', 'Soziopath', 'Aleria-Spielprägung der sozialen Distanz: +1 auf CHA-Rettungswürfe; −1 auf Überzeugen und Motiv erkennen. Keine zusätzlichen Nachforschungs- oder Wahrnehmungskenntnisse.',
    { skillModifiers: [skill('Überzeugen', -1), skill('Motiv erkennen', -1)], saveAttributeModifiers: [{ attributeKey: 'charisma', bonus: 1 }] }, 0],
  ['narzisstisch', 'Narzisstisch', 'Ausgeprägte Selbstdarstellung: +1 auf Auftreten und CHA-Rettungswürfe; −1 auf Überzeugen und Motiv erkennen.',
    { skillModifiers: [skill('Auftreten', 1), skill('Überzeugen', -1), skill('Motiv erkennen', -1)], saveAttributeModifiers: [{ attributeKey: 'charisma', bonus: 1 }] }, 1],
  ['eidetisches-gedaechtnis', 'Eidetisches Gedächtnis', 'Sicheres Erinnern bereits wahrgenommener Informationen: +2 auf Geschichte und +1 auf Arkane Kunde, Naturkunde und Religion. Keine allgemeine INT-Erhöhung oder medizinische Ausbildung; unbekannte Informationen müssen weiterhin beschafft werden.',
    { skillModifiers: [skill('Geschichte', 2), ...['Arkane Kunde', 'Naturkunde', 'Religion'].map(name => skill(name, 1))] }, 4],
  ['geistig-beschraenkt', 'Geistig beschränkt', '−4 auf sämtliche Fertigkeitsproben. Die wirksamen Attributswerte INT und WEI sind auf höchstens 3 begrenzt, auch mit Boni oder freien Modifikatoren. Andere Handlungen werden nicht pauschal gesperrt.',
    { skill: -4, attributeCaps: cap(3) }, -8, { exclusiveGroup: 'cognitive-limitation', rank: 1 }],
  ['vollidiot', 'Vollidiot', 'Stärkere alternative Einschränkung: −6 auf sämtliche Fertigkeitsproben. INT und WEI höchstens 2, auch mit Boni oder freien Modifikatoren. Ersetzt die Ausprägung „Geistig beschränkt“; keine zusätzliche Punktgutschrift für beide.',
    { skill: -6, attributeCaps: cap(2) }, -10, { exclusiveGroup: 'cognitive-limitation', rank: 2 }],
  ['genie', 'Genie', '+2 auf den INT-Attributswert und +1 auf Nachforschungen. Der daraus entstehende INT-Modifikator gilt ebenfalls. Geistige Begabung erhöht keine körperlichen Attribute und vergibt keine automatische Ausbildung.',
    { attributeModifiers: [{ attributeKey: 'intelligence', bonus: 2 }], skillModifiers: [skill('Nachforschungen', 1)] }, 5]
]);
const origins = new Map(PSYCHOLOGICAL_TRAIT_DEFINITIONS.map(([id, name, , , , policy = {}]) =>
  [`development-trait-${id}`, Object.freeze({ id: `development-trait-${id}`, name, ...policy })]));
export function getPsychologicalTraitOrigin(entry) {
  return origins.get(typeof entry === 'string' ? entry : entry?.developmentTraitId || entry?.id) || null;
}
export const PSYCHOLOGICAL_TRAIT_NOTE = 'Feste, autorisch festgelegte Aleria-Spielprägungen; die Namen sind keine klinischen Diagnosen. Attributsboni verändern den wirksamen Wert, ohne Grundwerte zu überschreiben. Obergrenzen gelten nach allen Boni und auch für freie Modifikatoren. Die beiden kognitiven Einschränkungen sind alternative Ausprägungen; nur die stärkere wirkt und zählt zur Balance.';
