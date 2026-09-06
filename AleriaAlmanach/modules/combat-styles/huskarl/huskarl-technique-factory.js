import { createDrachentanzDamageProfile } from '../drachentanz/drachentanz-damage-progression.js';
import { techniqueCost, weaponDamageEffect, temporaryCondition, secondarySave } from '../drachentanz/techniques/drachentanz-technique-factory.js';
import { getHuskarlForms, HUSKARL_FORM_IDS as F } from './huskarl-forms.js';

export const HUSKARL_WEAPONS = Object.freeze({
  flexible: { name: 'Schwert, Axt oder Streitkolben', types: ['sword', 'axe', 'mace'] },
  shield: { name: 'Einhandwaffe und Schild', types: ['sword', 'axe', 'mace', 'spear'], shield: true },
  longblade: { name: 'Langschwert oder lange Streitaxt', types: ['sword', 'axe'], twoHanded: true },
  paired: { name: 'Zwei Äxte oder zwei Klingen', types: ['axe', 'sword'], dualWield: true },
  twinAxes: { name: 'Zwei Äxte', types: ['axe'], dualWield: true },
  greatAxe: { name: 'Lange Streitaxt', types: ['axe'], twoHanded: true },
  bow: { name: 'Langbogen, Jagdbogen oder Kurzbogen', types: ['bow'], ranged: true },
  spear: { name: 'Speer', types: ['spear'] },
  sidearm: { name: 'Schwert, Axt oder Sax', types: ['sword', 'axe', 'dagger'] },
  lance: { name: 'Lanze oder Reiterspieß', types: ['spear', 'polearm'] },
  rider: { name: 'Axt, Schwert, Streitkolben oder Keule', types: ['axe', 'sword', 'mace'] },
  deck: { name: 'Enteraxt, Hammer oder Streitkolben', types: ['axe', 'hammer', 'mace'] },
  throwing: { name: 'Wurfspeer oder Wurfaxt', types: ['spear', 'axe'], ranged: true },
  militia: { name: 'Speer, Schwert oder Axt', types: ['spear', 'sword', 'axe'] }
});
const costsByKind = Object.freeze({ light: ['bonus-action'], strike: ['action'], guard: ['reaction'],
  bind: ['action', 'reaction'], advance: ['action', 'bonus-action'], prepare: ['bonus-action', 'reaction'],
  specialStrike: ['action', 'special-action'], specialGuard: ['reaction', 'special-action'],
  specialFlow: ['bonus-action', 'special-action'], specialWeave: ['reaction', 'bonus-action', 'special-action'],
  allIn: ['action', 'reaction', 'bonus-action', 'special-action'],
  committed: ['action', 'bonus-action', 'reaction'], finisher: ['action', 'reaction', 'special-action'],
  master: ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus'] });
const forms = new Map(getHuskarlForms().map(form => [form.id, form]));

export function createHuskarlTechnique(classId, formId, spec) {
  const form = forms.get(formId);
  const weapon = HUSKARL_WEAPONS[spec.weapon];
  const costIds = costsByKind[spec.cost];
  if (!form || !weapon || !costIds) throw new Error(`Ungültige Huskarl-Technik: ${classId}/${spec.slug}`);
  const id = `combat-style-huskarl-${classId}-${spec.slug}`;
  const costs = costIds.map((cost, i) => techniqueCost(id, cost, i));
  const effects = spec.noDamage ? [] : [weaponDamageEffect(id)];
  if (spec.guard) effects.push(temporaryCondition(id, 'Feste Deckung', `+${spec.guard} RK für einen eigenen Beitrag. Gleichartige Deckung wird erneuert, nicht addiert.`,
    { armorClass: spec.guard }, { target: 'self', on: spec.noDamage ? 'always' : 'hit', tags: 'Huskarl-Waffenlehre' }));
  if (spec.aim) effects.push(temporaryCondition(id, 'Gesammelte Ruhe', '+1 Angriff für einen eigenen Beitrag; wiederholtes Vorbereiten erhöht den Bonus nicht.',
    { attack: 1 }, { target: 'self', on: 'always', tags: 'Huskarl-Waffenlehre', slug: 'aim' }));
  const band = formId === F.foundation ? 'foundation' : formId === F.advanced ? 'advanced' : formId === F.militia ? 'militia' : 'expert';
  const requirements = [weapon.name, weapon.shield ? 'Schild aktiv geführt.' : '',
    weapon.dualWield ? 'Zwei passende Waffen gleichzeitig in linker und rechter Hand. Ein gemeinsamer Technikwurf; beide Waffenwürfel werden nicht addiert.' : '',
    weapon.twoHanded ? 'Beide Hände für eine Waffe frei; kein zugleich geführter Schild.' : '',
    weapon.ranged ? 'Wurfwaffe einsatzbereit bzw. passende Munition vorhanden; Waffenreichweite beachten.' : '',
    spec.mounted ? 'Beritten; für einen Anritt mindestens 3 m freier Anlauf. Zu Fuß eine andere Technik wählen.' : '', spec.requirement || ''].filter(Boolean).join(' ');
  return { id, name: spec.name, minimumLevel: spec.level, status: 'draft', active: false, live: false,
    combatStyleId: 'huskarl-waffenlehre', combatStyleFormId: formId, trainingForm: form.name,
    category: 'technique', description: spec.description || spec.effect, effect: spec.effect,
    weaponLabel: weapon.name, weaponTypes: weapon.types, compatibleWeaponIds: [],
    activationType: costIds[0], costs, auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1 },
    ...(spec.noDamage ? { damageFormula: '', damageModel: { mode: 'fixed', scalingSteps: [] } }
      : createDrachentanzDamageProfile({ minimumLevel: spec.level, allowedClassIds: classId === 'hird-maid' ? ['milwr'] : [classId], maximumTargets: 1 }, costs)),
    attackBonus: spec.attackBonus || 0, damageBonus: 0, damageType: '', criticalThreshold: 20,
    targetDefenseModifier: 0, maximumTargets: 1, target: spec.noDamage ? 'Selbst' : 'Ein Gegner', range: 'Waffenreichweite', requirements,
    effects, secondarySave: spec.penalty ? secondarySave(id, 'Gebundene Waffenführung', '−1 Angriff für einen eigenen Beitrag nach misslungenem KRF-Rettungswurf; nicht additiv.', { attack: -1 }, { tags: 'Huskarl-Waffenlehre' }) : { enabled: false },
    followUpAttack: { enabled: false }, mechanics: {}, triggerRules: [],
    cultureTraining: { schemaVersion: 1, cultureIds: ['aldrimar'], allowedClassIds: [classId],
      branchId: `${classId}-${spec.weapon}`, slotBands: [band], requiresShield: Boolean(weapon.shield),
      requiresTwoHands: Boolean(weapon.twoHanded), requiresDualWield: Boolean(weapon.dualWield), requiresMounted: Boolean(spec.mounted) },
    mechanicNotes: ['Entwurf: Waffen-, Schild-, Reit- und Zustandsvoraussetzungen müssen bei der späteren Vergabe verbindlich geprüft werden.'],
    tags: `Huskarl-Waffenlehre · ${classId} · ${form.name}` };
}
