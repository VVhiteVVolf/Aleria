// Authored Aleria game expressions, not clinical descriptions or diagnoses.
const skill = (name, bonus) => ({ name, bonus });
const cap = maximum => ['intelligence', 'wisdom'].map(attributeKey => ({ attributeKey, maximum }));
export const PSYCHOLOGICAL_TRAIT_DEFINITIONS = Object.freeze([
  ['psychopath', 'Psychopath', 'Analytische Distanz: +4 Nachforschungen, +2 Motiv erkennen und +2 auf Rettungswürfe gegen Furcht; −2 Überzeugen und Flirten.',
    { skillModifiers: [skill('Nachforschungen', 4), skill('Motiv erkennen', 2), skill('Überzeugen', -2), skill('Flirten', -2)], saveModifiers: [{ kind: 'fear', bonus: 2 }] }, 4],
  ['soziopath', 'Soziopath', 'Starker analytischer Schwerpunkt: +4 Nachforschungen und +2 Wahrnehmung. −4 Überzeugen und Motiv erkennen; −3 Täuschen, Einschüchtern, Auftreten und Flirten.',
    { skillModifiers: [skill('Nachforschungen', 4), skill('Wahrnehmung', 2), skill('Überzeugen', -4), skill('Motiv erkennen', -4), ...['Täuschen', 'Einschüchtern', 'Auftreten', 'Flirten'].map(name => skill(name, -3))] }, -3],
  ['narzisstisch', 'Narzisstisch', 'Selbstdarstellung und Durchsetzung: +3 Auftreten, +2 Einschüchtern und +2 auf CHA-Rettungswürfe; −3 Überzeugen und Motiv erkennen, −2 Flirten.',
    { skillModifiers: [skill('Auftreten', 3), skill('Einschüchtern', 2), skill('Überzeugen', -3), skill('Motiv erkennen', -3), skill('Flirten', -2)], saveAttributeModifiers: [{ attributeKey: 'charisma', bonus: 2 }] }, 0],
  ['eidetisches-gedaechtnis', 'Eidetisches Gedächtnis', '+1 INT-Attributswert, +3 Geschichte und +2 auf Arkane Kunde, Naturkunde, Religion und Heilkunde. Erinnern setzt vorherige Wahrnehmung voraus; keine automatisch bekannten Geheimnisse.',
    { attributeModifiers: [{ attributeKey: 'intelligence', bonus: 1 }], skillModifiers: [skill('Geschichte', 3), ...['Arkane Kunde', 'Naturkunde', 'Religion', 'Heilkunde'].map(name => skill(name, 2))] }, 6],
  ['geistig-beschraenkt', 'Geistig beschränkt', '−4 auf sämtliche Fertigkeitsproben. Die wirksamen Attributswerte INT und WEI sind auf höchstens 3 begrenzt, auch mit Boni oder freien Modifikatoren. Andere Handlungen werden nicht pauschal gesperrt.',
    { skill: -4, attributeCaps: cap(3) }, -8, { exclusiveGroup: 'cognitive-limitation', rank: 1 }],
  ['vollidiot', 'Vollidiot', 'Stärkere alternative Einschränkung: −6 auf sämtliche Fertigkeitsproben. INT und WEI höchstens 2, auch mit Boni oder freien Modifikatoren. Ersetzt die Ausprägung „Geistig beschränkt“; keine zusätzliche Punktgutschrift für beide.',
    { skill: -6, attributeCaps: cap(2) }, -10, { exclusiveGroup: 'cognitive-limitation', rank: 2 }],
  ['genie', 'Genie', '+1 auf jeden der sechs Attributswerte und zusätzlich +1 auf sämtliche Fertigkeitsproben. Daraus entstehende Attributsmodifikatoren gelten ebenfalls. Keine automatische Ausbildung, Fähigkeiten oder Gegenstände.',
    { attributeModifiers: ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'].map(attributeKey => ({ attributeKey, bonus: 1 })), skill: 1 }, 10]
]);
const origins = new Map(PSYCHOLOGICAL_TRAIT_DEFINITIONS.map(([id, name, , , , policy = {}]) =>
  [`development-trait-${id}`, Object.freeze({ id: `development-trait-${id}`, name, ...policy })]));
export function getPsychologicalTraitOrigin(entry) {
  return origins.get(typeof entry === 'string' ? entry : entry?.developmentTraitId || entry?.id) || null;
}
export const PSYCHOLOGICAL_TRAIT_NOTE = 'Feste, autorisch festgelegte Aleria-Spielprägungen; die Namen sind keine klinischen Diagnosen. Attributsboni verändern den wirksamen Wert, ohne Grundwerte zu überschreiben. Obergrenzen gelten nach allen Boni und auch für freie Modifikatoren. Die beiden kognitiven Einschränkungen sind alternative Ausprägungen; nur die stärkere wirkt und zählt zur Balance.';
