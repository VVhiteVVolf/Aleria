// Deliberately uses the combat model's existing numerical modifiers and rules.
import { BODY_TRAIT_DEFINITIONS } from './development-body-traits.js';
import { EXTRA_TRAIT_DEFINITIONS } from './development-extra-traits.js';
import { INSPIRED_TRAIT_DEFINITIONS } from './development-inspired-traits.js';
import { UNIQUE_TRAIT_DEFINITIONS } from './development-unique-traits.js';
import { APTITUDE_TRAIT_DEFINITIONS } from './development-aptitude-traits.js';
import { BLOODLINE_TRAIT_DEFINITIONS, getBloodlineTraitOrigin } from './development-bloodline-traits.js';
import { THERIANTHROPY_TRAIT_DEFINITIONS, SYMBIOSIS_TRAIT_DEFINITIONS, getTransformationTraitOrigin } from './development-theriantrophie-traits.js';
import { traitSaveDisadvantage, traitDamageAffinities } from './development-trait-rules.js';
import { HEALTH_TRAIT_DEFINITIONS } from '../character-health/health-trait-catalog.js';
import { healthMagicSaveRules } from '../character-health/health-trait-rules.js';
import { PSYCHOLOGICAL_TRAIT_DEFINITIONS, getPsychologicalTraitOrigin } from './development-psychological-traits.js';
const skill = (name, bonus) => ({ name, bonus });
const definitions = [
  ['feuer-phobie', 'Feuer Phobie', 'Doppelter Feuerschaden und Nachteil bei Rettungswürfen gegen feuerbasierte Angriffe.', {}, -3,
    { damageAffinities: [{ damageType: 'feuer', response: 'vulnerable' }], triggerRules: traitSaveDisadvantage('feuerangst',{damageTypes:['feuer','fire']}) }],
  ['naturkind', 'In der Natur aufgewachsen', 'Expertise in Naturkunde und +2 auf Mit Tieren umgehen.', { skillProficiencies: [{ name: 'Naturkunde', proficiency: 'expertise' }], skillModifiers: [skill('Mit Tieren umgehen', 2)] }, 4],
  ['flink', 'Flinke Füße', '+2 m Bewegung, −1 RK.', { movement: 2, armorClass: -1 }, 0],
  ['standfest', 'Standfest', '+1 RK, −1 m Bewegung.', { armorClass: 1, movement: -1 }, 2],
  ['wachsam', 'Wachsamer Blick', '+2 passive Wahrnehmung und +1 Initiative.', { passivePerception: 2, initiative: 1 }, 2],
  ['vertraeumt', 'Verträumt', '−2 Initiative; +2 auf Arkane Kunde.', { initiative: -2, skillModifiers: [skill('Arkane Kunde', 2)] }, -1],
  ['zaeh', 'Zäh wie Leder', '+4 maximale TP; aktuelle TP werden nicht aufgefüllt.', { maximumHitPoints: 4 }, 2],
  ['zerbrechlich', 'Zerbrechlich', '−3 maximale TP, +2 auf Akrobatik.', { maximumHitPoints: -3, skillModifiers: [skill('Akrobatik', 2)] }, -1],
  ['mutig', 'Mutiges Herz', '+2 auf Rettungswürfe gegen Furcht.', { saveModifiers: [{ kind: 'fear', bonus: 2 }] }, 1],
  ['aengstlich', 'Leicht zu erschrecken', '−2 auf Rettungswürfe gegen Furcht; +2 auf Heimlichkeit.', { saveModifiers: [{ kind: 'fear', bonus: -2 }], skillModifiers: [skill('Heimlichkeit', 2)] }, -1],
  ['giftfest', 'Giftfeste Konstitution', 'Resistenz gegen Giftschaden; +1 auf Rettungswürfe gegen Gift.', { saveModifiers: [{ kind: 'poison', bonus: 1 }] }, 4, { damageAffinities: [{ damageType: 'gift', response: 'resistant' }] }],
  ['frostempfindlich', 'Frostempfindlich', 'Doppelter Kälteschaden.', {}, -2, { damageAffinities: [{ damageType: 'kälte', response: 'vulnerable' }] }],
  ['glutgewoehnt', 'An Glut gewöhnt', 'Resistenz gegen Feuerschaden; −1 Initiative.', { initiative: -1 }, 2, { damageAffinities: [{ damageType: 'feuer', response: 'resistant' }] }],
  ['gelehrt', 'Bücherwurm', 'Expertise in Geschichte; −1 auf Athletik.', { skillProficiencies: [{ name: 'Geschichte', proficiency: 'expertise' }], skillModifiers: [skill('Athletik', -1)] }, 2],
  ['empathisch', 'Menschenkenner', '+2 auf Motiv erkennen und Überzeugen.', { skillModifiers: [skill('Motiv erkennen', 2), skill('Überzeugen', 2)] }, 2],
  ['schroff', 'Schroffe Ehrlichkeit', '+2 auf Einschüchtern, −2 auf Täuschen.', { skillModifiers: [skill('Einschüchtern', 2), skill('Täuschen', -2)] }, 0],
  ['silberzunge', 'Silberzunge', 'Expertise in Überzeugen; −1 auf Motiv erkennen.', { skillProficiencies: [{ name: 'Überzeugen', proficiency: 'expertise' }], skillModifiers: [skill('Motiv erkennen', -1)] }, 2],
  ['ungeschickt', 'Zwei linke Hände', '−2 auf Fingerfertigkeit; +1 maximale TP.', { maximumHitPoints: 1, skillModifiers: [skill('Fingerfertigkeit', -2)] }, -1],
  ['scharfschuetze', 'Ruhige Sehne', '+1 Angriff mit Bögen und Armbrüsten; −1 Initiative.', { weaponModifiers: [{ weaponTypes: ['bow', 'crossbow'], attack: 1 }], initiative: -1 }, 1],
  ['klingenmut', 'Klingenmut', '+1 Schaden mit Schwertern und Dolchen; −1 RK.', { weaponModifiers: [{ weaponTypes: ['sword', 'dagger'], damage: 1 }], armorClass: -1 }, 0],
  ['arkaner-fokus', 'Arkaner Fokus', '+1 Zauberangriff, −1 Waffenangriff.', { spellAttack: 1, attack: -1, attackScope: 'weapon' }, 1],
  ['zaehe-magie', 'Zähe Magie', '+1 Zauber-SG; −1 m Bewegung.', { spellSaveDc: 1, movement: -1 }, 2],
  ['magiescheu', 'Magiescheu', '−1 Zauberangriff und −1 Zauber-SG.', { spellAttack: -1, spellSaveDc: -1 }, -2],
  ['glueckspilz', 'Glückspilz', '+1 auf alle Rettungswürfe.', { savingThrow: 1 }, 3],
  ['pechvogel', 'Pechvogel', '−1 auf alle Rettungswürfe.', { savingThrow: -1 }, -3],
  ['kampfbereit', 'Immer kampfbereit', 'Zu Kampfbeginn 3 temporäre TP; −1 passive Wahrnehmung.', { combatStartTemporaryHitPoints: 3, passivePerception: -1 }, 1],
  ['konzentriert', 'Eiserne Konzentration', 'Vorteil auf KON-Rettungswürfe; −1 auf Initiative.', { savingThrowAdvantageAttributes: ['constitution'], initiative: -1 }, 2],
  ['lebhafter-geist', 'Lebhafter Geist', '+1 auf alle Fertigkeitsproben; −1 RK.', { skill: 1, armorClass: -1 }, 3],
  ['kraftpaket', 'Kraftpaket', '+2 auf Athletik und +1 Schaden mit Äxten und Keulen; −1 auf Heimlichkeit.', { skillModifiers: [skill('Athletik', 2), skill('Heimlichkeit', -1)], weaponModifiers: [{ weaponTypes: ['axe', 'mace'], damage: 1 }] }, 2],
  ['duennhaeutig', 'Dünnhäutig', 'Nachteil auf CHA-Rettungswürfe; +2 auf Auftreten.', { savingThrowDisadvantageAttributes: ['charisma'], skillModifiers: [skill('Auftreten', 2)] }, -1]
];
const bodyIds = new Set(BODY_TRAIT_DEFINITIONS.map(trait => trait[0]));
const uniqueIds = new Set(UNIQUE_TRAIT_DEFINITIONS.map(trait => trait[0]));
const aptitudeIds = new Set(APTITUDE_TRAIT_DEFINITIONS.map(trait => trait[0]));
function transformationTags(id) {
  const origin = getTransformationTraitOrigin(`development-trait-${id}`);
  if (!origin) return '';
  return origin.kind === 'symbiosis' ? 'Silvanische Symbiose · Angeboren · Tierverbundenheit'
    : `Zatracher Theriantrophie · ${origin.state === 'curse' ? 'Fluchform' : 'Jüngersegen'}`;
}
const traitTags = id => ['Charakterentwicklung', bodyIds.has(id) ? 'Körper' : '',
  uniqueIds.has(id) ? 'Besondere Eigenheit' : '', aptitudeIds.has(id) ? 'Begabung' : '',
  getBloodlineTraitOrigin(`development-trait-${id}`) ? 'Blutträger · Angeboren' : '', transformationTags(id),
  getPsychologicalTraitOrigin(`development-trait-${id}`) ? 'Psychologische Prägung' : ''].filter(Boolean).join(' · ');
export const DEVELOPMENT_TRAITS = Object.freeze([...definitions, ...BODY_TRAIT_DEFINITIONS, ...EXTRA_TRAIT_DEFINITIONS, ...INSPIRED_TRAIT_DEFINITIONS,
  ...UNIQUE_TRAIT_DEFINITIONS, ...APTITUDE_TRAIT_DEFINITIONS, ...BLOODLINE_TRAIT_DEFINITIONS,
  ...THERIANTHROPY_TRAIT_DEFINITIONS, ...SYMBIOSIS_TRAIT_DEFINITIONS, ...PSYCHOLOGICAL_TRAIT_DEFINITIONS].map(([id, name, description, mechanics, cost, extra = {}]) => ({
  id: `development-trait-${id}`, name, description, cost,
  icon: `/AleriaAlmanach/assets/development-traits/web/${id}.webp`,
  type: 'trait', active: true, target: 'Selbst', duration: 'Dauerhaft', appliesWhen: getBloodlineTraitOrigin(`development-trait-${id}`) ? 'Angeborenes menschliches Erbe eines infernalen oder celestialen Vorfahren' : 'Solange ausgewählt und aktiv',
  tags: traitTags(id), mechanics: { ...mechanics, ...(extra.damageAffinities ? { damageAffinities: traitDamageAffinities(extra.damageAffinities) } : {}) },
  triggerRules: extra.triggerRules || []
})).concat(HEALTH_TRAIT_DEFINITIONS.map(trait => ({
  id: trait.id, name: trait.name, description: trait.description, cost: trait.cost, icon: trait.icon,
  type: 'trait', active: true, target: 'Selbst', duration: 'Dauerhaft',
  appliesWhen: trait.group === 'addiction' ? 'Entzugsabzüge nur ohne den passenden aktiven Rausch' : 'Dauerhaft; nicht durch Heilung oder Rast entfernt',
  limitations: trait.limitations,
  tags: `Charakterentwicklung · ${({ affliction: 'Dauerhaftes Leiden', fever: 'Arkanistenfieber', addiction: 'Abhängigkeit', tolerance: 'Substanztoleranz' })[trait.group]}${trait.innate ? ' · Angeboren' : ''}`,
  mechanics: trait.mechanics, triggerRules: trait.magicSavePenalty ? healthMagicSaveRules(trait.id, trait.magicSavePenalty) : []
}))));
