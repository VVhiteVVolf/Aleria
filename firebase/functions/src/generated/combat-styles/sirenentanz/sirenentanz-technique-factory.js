// Wyrmtanz shares the Drachentanz damage budget and combat effect contracts.
// Derwyn techniques are selectable; the other Vennyr catalogues remain drafts.
import { createDrachentanzDamageProfile } from '../drachentanz/drachentanz-damage-progression.js';
import { techniqueCost, weaponDamageEffect, temporaryCondition, secondarySave } from '../drachentanz/techniques/drachentanz-technique-factory.js?v=20260909-dragon-parent-v2';
import { getSirenentanzForms, SIRENENTANZ_FORM_IDS as F, DERWYN_FORM_IDS as D } from './sirenentanz-forms.js?v=20260909-dragon-parent-v2';
import { DRACHENTANZ_FORM_IDS } from '../drachentanz/drachentanz-ids.js?v=20260909-dragon-parent-v2';

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
  derwynStaff: { name: 'Kampfstab oder nahkampftauglicher Zauberstab', types: ['staff'], profiles: ['staff', 'quarterstaff', 'magic-staff'], twoHanded: true },
  sword: { name: 'Schwert', types: ['sword'], profiles: ['sword'] },
  morningstar: { name: 'Morgenstern', types: ['mace', 'flail'], profiles: ['morningstar'] },
  mace: { name: 'Streitkolben', types: ['mace'], profiles: ['mace'] },
  rider: { name: 'Flegel, Rabenschnabel, Reiteraxt oder Streitkolben', types: ['flail', 'hammer', 'axe', 'mace'], profiles: [] },
  riderPolearm: { name: 'Glefe oder Reiterspieß', types: ['polearm', 'spear'], profiles: ['glaive', 'rider-spear'] },
  militia: { name: 'Speer, Axt, Streitkolben oder Schwert', types: ['spear', 'axe', 'mace', 'sword'], profiles: [] }
});
const formById = new Map(getSirenentanzForms().map(form => [form.id, form]));
formById.set(DRACHENTANZ_FORM_IDS.jungdrache, { id: DRACHENTANZ_FORM_IDS.jungdrache, name: 'Tanz des Jungdrachens' });

function conditionEffects(id, spec) {
  const effects = [];
  const self = { target: 'self', on: spec.noDamage ? 'always' : 'hit', tags: spec.styleName || 'Wyrmtanz', comments: 1 };
  if (spec.guard) effects.push(temporaryCondition(id, 'Gedeckte Wellenstellung', `+${spec.guard} RK bis zum Ende des nächsten eigenen Beitrags. Gleichartige Deckung wird nur erneuert, nicht addiert.`, { armorClass: spec.guard }, self));
  if (spec.aim) effects.push(temporaryCondition(id, 'Gesammelte Zielruhe', '+1 Angriff bis zum Ende des nächsten eigenen Beitrags; erneute Vorbereitung verlängert nur die Dauer.', { attack: 1 }, { ...self, slug: 'aim' }));
  if (spec.exposed) effects.push(temporaryCondition(id, 'Offene Flanke', '−1 RK bis zum Ende des nächsten eigenen Beitrags.', { armorClass: -1 }, { ...self, type: 'debuff', slug: 'exposed', on: 'always' }));
  if (spec.sharedConditions) effects.forEach(effect => {
    const mechanics = effect.condition.mechanics;
    const key = mechanics.attack ? 'aim' : mechanics.armorClass < 0 ? 'exposed' : 'guard';
    effect.condition.id = `wyrmtanz-derwyn-${key}`;
  });
  return effects;
}

export function createSirenentanzTechnique(classId, spec) {
  const form = formById.get(spec.formId);
  const weapon = SIRENENTANZ_WEAPONS[spec.weapon];
  if (!form || !weapon || !SIRENENTANZ_COSTS[spec.cost]) throw new Error(`Ungültige Wyrmtanz-Technik: ${spec.slug}`);
  const id = `combat-style-sirenentanz-${classId}-${spec.slug}`;
  const cenyrFoundation = form.id === DRACHENTANZ_FORM_IDS.jungdrache;
  const styleId = cenyrFoundation ? 'drachentanz' : 'sirenentanz';
  const styleName = cenyrFoundation ? 'Drachentanz' : 'Wyrmtanz';
  const slotBand = [F.foundation, DRACHENTANZ_FORM_IDS.jungdrache].includes(form.id) ? 'foundation'
    : form.id === D.creative ? 'duelist' : form.id === F.advanced ? 'advanced' : form.id === F.militia ? 'militia' : 'expert';
  const save = spec.penalty ? secondarySave(id, 'Gestörter Rhythmus', `−${spec.penalty} Angriff bis zum Ende des nächsten eigenen Beitrags; nicht additiv.`, { attack: -spec.penalty }, { tags: styleName }) : { enabled: false };
  if (classId === 'derwyn' && save.enabled) save.failureCondition.id = 'wyrmtanz-derwyn-rhythm-penalty';
  const costs = SIRENENTANZ_COSTS[spec.cost].map((cost, index) => techniqueCost(id, cost, index));
  const damage = spec.noDamage
    ? { damageFormula: '', damageModel: { mode: 'fixed', scalingSteps: [] } }
    : createDrachentanzDamageProfile({ minimumLevel: spec.level, allowedClassIds: [classId], maximumTargets: spec.targets || 1 }, costs);
  const requirements = [weapon.name, spec.mounted ? 'Beritten; für Anritte mindestens 3 m freier Anlauf.' : '',
    weapon.ranged ? 'Passende Munition bzw. einsatzbereite Wurfwaffe; Nachladen bleibt erforderlich.' : '',
    spec.requirement || ''].filter(Boolean).join(' · ');
  return {
    id, name: spec.name, combatStyleId: styleId, combatStyleFormId: form.id,
    trainingForm: `${styleName} · ${form.name}`, minimumLevel: spec.level,
    category: spec.noDamage ? 'support' : 'technique', status: classId === 'derwyn' ? 'confirmed' : 'draft', active: false, live: false,
    description: spec.description, effect: spec.effect, activationType: costs[0].resourceId,
    weaponTypes: weapon.types, compatibleWeaponIds: [], weaponLabel: weapon.name,
    ...damage, damageType: '', attackBonus: spec.attackBonus || 0, damageBonus: 0,
    targetDefenseModifier: spec.defenseModifier || 0, criticalThreshold: 20, rollMode: 'normal',
    maximumTargets: spec.targets || 1, range: spec.noDamage ? 'Selbst' : 'Waffenreichweite',
    target: spec.noDamage ? 'Selbst' : 'Ein Gegner', duration: spec.noDamage ? '1 eigener Beitrag' : 'Sofort',
    requirements, costs, auraBypass: { allowed: true, resourceId: 'aura-focus', cost: 1 },
    effects: [...(spec.noDamage ? [] : [weaponDamageEffect(id)]), ...conditionEffects(id, { ...spec, styleName, sharedConditions: classId === 'derwyn' })],
    secondarySave: save,
    followUpAttack: { enabled: false }, mechanics: {}, triggerRules: [],
    tags: [styleName, classId, form.name, weapon.name].join(' · '),
    mechanicNotes: [spec.manual ? `Situativ auszuwerten: ${spec.manual}` : '', 'Erlernen verbraucht einen passenden Attackenslot; keine automatische Aktivierung.'].filter(Boolean),
    ...(classId === 'derwyn' ? { cenyrTraining: {
      allowedClassIds: ['derwyn'], branchId: `derwyn-${spec.weapon === 'derwynStaff' ? 'staff' : spec.weapon}`, slotBands: [slotBand],
      classWeaponProfiles: { derwyn: weapon.profiles }, requiresTwoHands: Boolean(weapon.twoHanded),
      requiresMounted: false, weaponRuleSetId: ''
    } } : {}),
    cultureTraining: { schemaVersion: 1, cultureIds: ['milwr', 'derwyn'].includes(classId) ? ['cenyr', 'vennyr'] : ['vennyr'],
      allowedClassIds: [classId], branchId: `${classId}-${spec.weapon === 'derwynStaff' ? 'staff' : spec.weapon}`, weaponProfileIds: weapon.profiles,
      requiresMounted: Boolean(spec.mounted), requiresTwoHands: Boolean(weapon.twoHanded),
      slotBands: [slotBand] }
  };
}
