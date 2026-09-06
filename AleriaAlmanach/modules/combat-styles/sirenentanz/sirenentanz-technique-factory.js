// Sirenentanz deliberately shares the approved Drachentanz damage budget and
// combat effect shapes. This catalogue is a draft, never an automatic grant.
import { createDrachentanzDamageProfile } from '../drachentanz/drachentanz-damage-progression.js';
import { techniqueCost, weaponDamageEffect, temporaryCondition, secondarySave } from '../drachentanz/techniques/drachentanz-technique-factory.js';
import { getSirenentanzForms, SIRENENTANZ_FORM_IDS as F } from './sirenentanz-forms.js';

export const SIRENENTANZ_COSTS = Object.freeze({
  light: ['bonus-action'], strike: ['action'], guard: ['reaction'],
  pressure: ['action', 'reaction'], flowing: ['action', 'bonus-action'],
  preparation: ['reaction', 'bonus-action'], committed: ['action', 'bonus-action', 'reaction'],
  specialStrike: ['action', 'special-action'], specialGuard: ['reaction', 'special-action'],
  specialFlow: ['bonus-action', 'special-action'], specialWeave: ['reaction', 'bonus-action', 'special-action'],
  allIn: ['action', 'reaction', 'bonus-action', 'special-action'],
  finisher: ['action', 'reaction', 'special-action'],
  master: ['action', 'bonus-action', 'reaction', 'special-action', 'aura-focus']
});
export const SIRENENTANZ_WEAPONS = Object.freeze({
  polearm: { name: 'Partisane', types: ['polearm', 'spear'], profiles: ['partisan'] },
  axe: { name: 'Enteraxt', types: ['axe'], profiles: ['axe', 'boarding-axe'] },
  harpoon: { name: 'Harpunenspeer', types: ['spear'], profiles: ['harpoon'], ranged: true },
  heavy: { name: 'Großaxt, Kriegshammer, Morgenstern, Streitkolben oder Flegel', types: ['axe', 'mace', 'hammer', 'flail'], profiles: ['battleaxe', 'greataxe', 'warhammer', 'morningstar', 'mace', 'flail'] },
  heavyOrSword: { name: 'Schwere Hiebwaffe oder Ritterschwert', types: ['axe', 'mace', 'hammer', 'flail', 'sword'], profiles: [] },
  shortbow: { name: 'Kurzbogen', types: ['bow'], profiles: ['shortbow'], ranged: true },
  crossbow: { name: 'Armbrust', types: ['crossbow'], profiles: ['crossbow'], ranged: true },
  sabre: { name: 'Säbel', types: ['sword'], profiles: ['sabre'] },
  trident: { name: 'Dreizack', types: ['spear', 'polearm'], profiles: ['trident'] },
  staff: { name: 'Stab oder Saphirstab', types: ['staff'], profiles: ['staff'], twoHanded: true },
  mace: { name: 'Streitkolben', types: ['mace'], profiles: ['mace'] },
  rider: { name: 'Flegel, Rabenschnabel, Reiteraxt oder Streitkolben', types: ['flail', 'hammer', 'axe', 'mace'], profiles: [] },
  riderPolearm: { name: 'Glefe oder Reiterspieß', types: ['polearm', 'spear'], profiles: ['glaive', 'rider-spear'] },
  militia: { name: 'Speer, Axt, Streitkolben oder Schwert', types: ['spear', 'axe', 'mace', 'sword'], profiles: [] }
});
const formById = new Map(getSirenentanzForms().map(form => [form.id, form]));

function conditionEffects(id, spec) {
  const effects = [];
  const self = { target: 'self', on: spec.noDamage ? 'always' : 'hit', tags: 'Sirenentanz', comments: 1 };
  if (spec.guard) effects.push(temporaryCondition(id, 'Gedeckte Wellenstellung', `+${spec.guard} RK bis zum Ende des nächsten eigenen Beitrags. Gleichartige Deckung wird nur erneuert, nicht addiert.`, { armorClass: spec.guard }, self));
  if (spec.aim) effects.push(temporaryCondition(id, 'Gesammelte Zielruhe', '+1 Angriff bis zum Ende des nächsten eigenen Beitrags; erneute Vorbereitung verlängert nur die Dauer.', { attack: 1 }, { ...self, slug: 'aim' }));
  if (spec.exposed) effects.push(temporaryCondition(id, 'Offene Flanke', '−1 RK bis zum Ende des nächsten eigenen Beitrags.', { armorClass: -1 }, { ...self, type: 'debuff', slug: 'exposed', on: 'always' }));
  return effects;
}

export function createSirenentanzTechnique(classId, spec) {
  const form = formById.get(spec.formId);
  const weapon = SIRENENTANZ_WEAPONS[spec.weapon];
  if (!form || !weapon || !SIRENENTANZ_COSTS[spec.cost]) throw new Error(`Ungültige Sirenentanz-Technik: ${spec.slug}`);
  const id = `combat-style-sirenentanz-${classId}-${spec.slug}`;
  const costs = SIRENENTANZ_COSTS[spec.cost].map((cost, index) => techniqueCost(id, cost, index));
  const damage = spec.noDamage
    ? { damageFormula: '', damageModel: { mode: 'fixed', scalingSteps: [] } }
    : createDrachentanzDamageProfile({ minimumLevel: spec.level, allowedClassIds: [classId], maximumTargets: spec.targets || 1 }, costs);
  const requirements = [weapon.name, spec.mounted ? 'Beritten; für Anritte mindestens 3 m freier Anlauf.' : '',
    weapon.ranged ? 'Passende Munition bzw. einsatzbereite Wurfwaffe; Nachladen bleibt erforderlich.' : '',
    spec.requirement || ''].filter(Boolean).join(' · ');
  return {
    id, name: spec.name, combatStyleId: 'sirenentanz', combatStyleFormId: form.id,
    trainingForm: `Sirenentanz · ${form.name}`, minimumLevel: spec.level,
    category: spec.noDamage ? 'support' : 'technique', status: 'draft', active: false, live: false,
    description: spec.description, effect: spec.effect, activationType: costs[0].resourceId,
    weaponTypes: weapon.types, compatibleWeaponIds: [], weaponLabel: weapon.name,
    ...damage, damageType: '', attackBonus: spec.attackBonus || 0, damageBonus: 0,
    targetDefenseModifier: spec.defenseModifier || 0, criticalThreshold: 20, rollMode: 'normal',
    maximumTargets: spec.targets || 1, range: spec.noDamage ? 'Selbst' : 'Waffenreichweite',
    target: spec.noDamage ? 'Selbst' : 'Ein Gegner', duration: spec.noDamage ? '1 eigener Beitrag' : 'Sofort',
    requirements, costs, auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1 },
    effects: [...(spec.noDamage ? [] : [weaponDamageEffect(id)]), ...conditionEffects(id, spec)],
    secondarySave: spec.penalty ? secondarySave(id, 'Gestörter Rhythmus', `−${spec.penalty} Angriff bis zum Ende des nächsten eigenen Beitrags; nicht additiv.`, { attack: -spec.penalty }, { tags: 'Sirenentanz' }) : { enabled: false },
    followUpAttack: { enabled: false }, mechanics: {}, triggerRules: [],
    tags: ['Sirenentanz', classId, form.name, weapon.name, 'Waffenpfad-Entwurf'].join(' · '),
    mechanicNotes: [spec.manual ? `Situativ auszuwerten: ${spec.manual}` : '', 'Entwurfsstatus: keine automatische Vergabe oder Aktivierung im Charakterbogen.'].filter(Boolean),
    cultureTraining: { schemaVersion: 1, cultureIds: ['milwr', 'derwyn'].includes(classId) ? ['cenyr', 'vennyr'] : ['vennyr'],
      allowedClassIds: [classId], branchId: `${classId}-${spec.weapon}`, weaponProfileIds: weapon.profiles,
      requiresMounted: Boolean(spec.mounted), requiresTwoHands: Boolean(weapon.twoHanded),
      slotBands: [form.id === F.foundation ? 'foundation' : form.id === F.advanced ? 'advanced' : form.id === F.militia ? 'militia' : 'expert'] }
  };
}
