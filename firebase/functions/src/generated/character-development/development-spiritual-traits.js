// Authored spiritual states. These intentionally carry no mechanical effects.
import { effectiveGroupedTraits, selectGroupedTrait } from './development-trait-groups.js';
import { getDevelopmentTraitId } from './development-entry-reference.js';

const stages = [
  ['I', 'Erste Zweifel', 'Erste Zweifel trüben das bisher selbstverständliche Vertrauen in die Verbindung zur Gottheit.'],
  ['II', 'Innere Unruhe', 'Das eigene Handeln und die Ideale der Gottheit geraten spürbar in Widerspruch.'],
  ['III', 'Gestörte Einkehr', 'Gebet und innere Einkehr sind von der wiederkehrenden Erfahrung der Entfremdung geprägt.'],
  ['IV', 'Tiefe Entfremdung', 'Die Entfernung von den Tugenden und Idealen der Gottheit prägt das geistliche Selbstverständnis.'],
  ['V', 'Am Rand des Bruchs', 'Die Verbindung zur Gottheit steht erzählerisch kurz vor dem völligen Bruch.'],
  ['VI', 'Spiritueller Bruch', 'Die Entfremdung erreicht ihren Endpunkt. Der im Konzept vorgesehene Verlust der Klerikerkräfte wird erst später ausgearbeitet; derzeit bleiben sie vollständig nutzbar.']
];
const dissonanceContext = 'Für Kleriker nach wiederholtem oder schwerwiegendem Handeln gegen die Tugenden und Ideale ihrer Gottheit. Abbau durch Buße und entsprechende Taten, nicht durch bloßes Schlafen; die Stufe wird gemeinsam mit der Spielleitung manuell festgelegt.';
const noEffects = 'Vorerst rein beschreibend: keine Boni, Mali, Kraftsperren oder Balancekosten.';

export const SPIRITUAL_TRAIT_DEFINITIONS = Object.freeze([
  ...stages.map(([roman, title, description], index) => [
    `spirituelle-dissonanz-${index + 1}`, `Spirituelle Dissonanz ${roman}`,
    `${title}: ${description} ${dissonanceContext} ${noEffects}`, {}, 0,
    { tags: 'Geistlicher Zustand · Kleriker', rank: index + 1, exclusiveGroup: 'spiritual-dissonance',
      appliesWhen: 'Manuell festgelegte Dissonanzstufe; bleibt bis zur bewussten Änderung bestehen' }
  ]),
  ['eidbruch', 'Eidbruch',
    `Für Eiferer, Paladine und Schwurritter: Du hast einen für deinen Weg bindenden Eid oder Schwur gebrochen. Welches Gelübde verletzt wurde und wie eine Wiedergutmachung aussehen kann, wird mit der Spielleitung festgehalten. Der Eintrag bleibt bis zur bewussten Änderung bestehen. ${noEffects}`,
    {}, 0, { tags: 'Geistlicher Zustand · Eiferer · Paladin · Schwurritter',
      appliesWhen: 'Manuell festgehaltener Bruch eines bindenden Eids oder Schwurs' }]
]);
const origins = new Map(SPIRITUAL_TRAIT_DEFINITIONS.map(([id, name, , , , policy]) =>
  [`development-trait-${id}`, Object.freeze({ id: `development-trait-${id}`, name, ...policy })]));
export function getSpiritualTraitOrigin(entry) {
  return origins.get(typeof entry === 'string' ? entry : getDevelopmentTraitId(entry)) || null;
}
export function selectSpiritualTrait(ids, id) {
  return selectGroupedTrait(ids, id, getSpiritualTraitOrigin);
}
// Only the strongest rank survives malformed or previously duplicated plans.
export function normalizeSpiritualTraitSelection(ids) {
  return effectiveGroupedTraits(ids.map(id => ({ id })), getSpiritualTraitOrigin).map(entry => entry.id);
}
export const SPIRITUAL_TRAIT_NOTE = 'Spirituelle Dissonanz I–VI beschreibt die wachsende Entfremdung eines Klerikers von seiner Gottheit. Wähle genau die aktuell vereinbarte Stufe; ein Stufenwechsel ersetzt die vorige Auswahl. Buße und Taten im Sinne der Gottheit ermöglichen den Abbau, bloßes Schlafen nicht. Eidbruch ist ein gemeinsamer Eintrag für Eiferer, Paladine und Schwurritter. Alle sieben Einträge sind vorerst rein beschreibend, kosten 0 Punkte und haben keinerlei mechanische Effekte. Auch Stufe VI sperrt derzeit keine Kräfte. Änderungen erfolgen manuell mit der Spielleitung.';
