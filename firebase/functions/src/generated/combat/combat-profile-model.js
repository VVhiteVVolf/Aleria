import { reconcileClassDamageRevisions } from '../classes/class-damage-revisions.js?v=20260905-damage-balance-v1';
import {
  ensureCombatActionResources,
  getDefaultActivationCosts,
  normalizeCombatResourceCosts
} from './combat-action-economy.js?v=20260905-resource-balance-v2';
import { normalizeActionPoolChoices, fillActionPoolChoices, COMBAT_RESOURCE_RULES_VERSION } from './combat-action-progression.js?v=20260905-resource-balance-v2';
import {
  ensureSpellSlotResources,
  findSpellSlotResourceId,
  getOrderedSpellSlotResources,
  getSpellSlotLevel
} from './combat-spell-slots.js?v=20260803-character-creation-v1';
import { sanitizeCombatTriggerRules } from './combat-trigger-rules.js?v=20260905-party-combat-v1';
import {
  normalizeCombatEffects,
  normalizeDamageAffinity
} from './combat-effect-model.js?v=20260905-party-combat-v1';
import {
  CASTER_TIERS,
  MANA_BYPASS_RESOURCE_IDS,
  getAuraFocusMaximum,
  getCasterManaMaximum,
  getDivineOrInfernalPointsMaximum,
  getFocusMaximum,
  getHighestUnlockedSpellGrade,
  getPactPointsMaximum,
  getSpellManaCost
} from './combat-resource-progression.js?v=20260905-resource-balance-v2';

const PACT_POINTS_RESOURCE_ID = 'pact-points';

export const COMBAT_PROFILE_SCHEMA_VERSION = 11;

export const COMBAT_ATTRIBUTE_DEFINITIONS = Object.freeze([
  { key: 'strength', label: 'Kraft', shortLabel: 'KRF' },
  { key: 'dexterity', label: 'Geschick', shortLabel: 'GES' },
  { key: 'constitution', label: 'Konstitution', shortLabel: 'KON' },
  { key: 'intelligence', label: 'Intelligenz', shortLabel: 'INT' },
  { key: 'wisdom', label: 'Weisheit', shortLabel: 'WEI' },
  { key: 'charisma', label: 'Charisma', shortLabel: 'CHA' }
]);

const ATTRIBUTE_KEYS = new Set(COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => attribute.key));
const DEXTERITY_MODES = new Set(['full', 'capped', 'none']);
const PROFICIENCY_LEVELS = new Set(['none', 'trained', 'expertise']);
const ROLL_MODES = new Set(['normal', 'advantage', 'disadvantage']);
const RECOVERY_TYPES = new Set(['none', 'short-rest', 'long-rest', 'scene', 'day', 'manual']);
const RESOURCE_SCOPES = new Set(['persistent', 'comment']);
const WEAPON_TYPES = new Set(['unarmed', 'sword', 'dagger', 'axe', 'mace', 'spear', 'polearm', 'bow', 'crossbow', 'firearm', 'staff', 'shield', 'improvised', 'natural', 'arcane', 'other']);
const WEAPON_TRAINING = new Set(['simple', 'martial', 'special']);
const ACTIVATION_TYPES = new Set(['action', 'bonus-action', 'reaction', 'special-action', 'passive']);
const ABILITY_DELIVERIES = new Set(['ability', 'weapon', 'spell', 'prayer', 'song']);
const SPELL_RESOLUTION_TYPES = new Set(['spell-attack', 'saving-throw', 'automatic']);
const SPELL_PRESENTATION_KINDS = new Set(['spell', 'prayer', 'song']);
export const COMBAT_WEAPON_TYPE_OPTIONS = Object.freeze([
  ['unarmed', 'Nahkampf / waffenlos'], ['sword', 'Schwert'], ['dagger', 'Dolch'], ['axe', 'Axt'],
  ['mace', 'Keule / Hammer'], ['spear', 'Speer'], ['polearm', 'Stangenwaffe'], ['bow', 'Bogen'],
  ['crossbow', 'Armbrust'], ['firearm', 'Feuerwaffe'], ['staff', 'Stab'], ['shield', 'Schild'],
  ['improvised', 'Improvisiert'], ['natural', 'Natürlicher Angriff'], ['arcane', 'Arkaner Fokus'], ['other', 'Sonstige']
].map(([id, label]) => ({ id, label })));
const DEFAULT_SKILLS = Object.freeze([
  ['Athletik', 'strength'], ['Akrobatik', 'dexterity'], ['Fingerfertigkeit', 'dexterity'],
  ['Heimlichkeit', 'dexterity'], ['Arkane Kunde', 'intelligence'], ['Geschichte', 'intelligence'],
  ['Nachforschungen', 'intelligence'], ['Naturkunde', 'intelligence'], ['Religion', 'intelligence'],
  ['Heilkunde', 'wisdom'], ['Mit Tieren umgehen', 'wisdom'], ['Motiv erkennen', 'wisdom'],
  ['Überleben', 'wisdom'], ['Wahrnehmung', 'wisdom'], ['Auftreten', 'charisma'],
  ['Einschüchtern', 'charisma'], ['Täuschen', 'charisma'], ['Überreden', 'charisma'],
  ['Flirten', 'charisma'], ['Körperbeherrschung', 'constitution']
].map(([name, attributeKey], index) => ({ id: `default-skill-${index + 1}`, name, attributeKey })));
const REQUIRED_SKILLS = Object.freeze([
  { id: 'default-skill-flirt', name: 'Flirten', attributeKey: 'charisma', aliases: ['flirten', 'verführen', 'verfuehren'] },
  { id: 'default-skill-body-control', name: 'Körperbeherrschung', attributeKey: 'constitution', aliases: ['körperbeherrschung', 'koerperbeherrschung'] }
]);
const DEFAULT_RESOURCES = Object.freeze([
  { id: 'inspiration', name: 'Inspiration', current: 0, maximum: 1, recovery: 'manual' },
  { id: 'mana-focus', name: 'Mana', current: 0, maximum: 0, recovery: 'day', scope: 'persistent', category: 'magic' },
  { id: 'focus', name: 'Fokus', current: 0, maximum: 0, recovery: 'day', scope: 'persistent', category: 'focus' },
  { id: 'celestial-points', name: 'Celestiale Punkte', current: 0, maximum: 0, recovery: 'day', scope: 'persistent', category: 'celestial' },
  { id: 'infernal-points', name: 'Infernale Punkte', current: 0, maximum: 0, recovery: 'day', scope: 'persistent', category: 'infernal' },
  { id: 'pact-points', name: 'Paktpunkte', current: 0, maximum: 0, recovery: 'day', scope: 'persistent', category: 'pact' }
]);
const DEFAULT_MELEE_WEAPON = Object.freeze({
  id: 'default-unarmed-melee',
  name: 'Nahkampf',
  weaponType: 'unarmed',
  training: 'simple',
  damageFormula: '1d4',
  damageType: 'Wucht',
  attackAttribute: 'strength',
  proficient: true,
  range: 'Nahkampf',
  properties: 'Schlicht · simpel · immer verfügbar',
  notes: 'Grundlegender waffenloser Nahkampfangriff.',
  equipped: true
});

function normalizeText(value, maximumLength = 160) {
  return String(value || '').trim().slice(0, maximumLength);
}

function normalizeNumber(value, fallback = 0, minimum = -999, maximum = 9999) {
  if (value === '' || value == null) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function normalizeOptionalNumber(value, minimum = 0, maximum = 9999) {
  if (value === '' || value == null) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function normalizeBoolean(value, fallback = false) {
  if (value == null) return fallback;
  if (typeof value === 'string') return value === 'true' || value === '1' || value === 'on';
  return Boolean(value);
}

function normalizeId(value, fallback) {
  return normalizeText(value, 120) || fallback;
}

function sanitizeList(value, sanitizer, maximumLength = 60) {
  return (Array.isArray(value) ? value : []).slice(0, maximumLength).map(sanitizer);
}

function getAttributeKey(value, fallback = 'strength') {
  const key = normalizeText(value, 40).toLowerCase();
  return ATTRIBUTE_KEYS.has(key) ? key : fallback;
}

export function normalizeCombatDamageFormula(value) {
  return normalizeText(value, 40).toLowerCase().replace(/\s+/g, '').replace(/w/g, 'd');
}

function sanitizeAttributeKeyList(value) {
  return [...new Set((Array.isArray(value) ? value : [])
    .map(item => normalizeText(item, 20).toLowerCase())
    .filter(key => ATTRIBUTE_KEYS.has(key)))];
}

function sanitizeMechanicalModifiers(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const rollMode = normalizeText(source.attackRollMode || source.rollMode, 20);
  return {
    attack: normalizeNumber(source.attack, 0, -99, 99),
    damage: normalizeNumber(source.damage, 0, -99, 99),
    armorClass: normalizeNumber(source.armorClass, 0, -99, 99),
    initiative: normalizeNumber(source.initiative, 0, -99, 99),
    skill: normalizeNumber(source.skill, 0, -99, 99),
    savingThrow: normalizeNumber(source.savingThrow, 0, -99, 99),
    spellAttack: normalizeNumber(source.spellAttack, 0, -99, 99),
    spellSaveDc: normalizeNumber(source.spellSaveDc, 0, -99, 99),
    movement: normalizeNumber(source.movement, 0, -999, 999),
    maximumHitPoints: normalizeNumber(source.maximumHitPoints, 0, -9999, 9999),
    combatStartTemporaryHitPoints: normalizeNumber(source.combatStartTemporaryHitPoints, 0, 0, 9999),
    passivePerception: normalizeNumber(source.passivePerception, 0, -99, 99),
    attackRollMode: ROLL_MODES.has(rollMode) ? rollMode : 'normal',
    // Ein zusätzlicher Würfel (z.B. "1w6"), der on-hit an den regulären Schaden angehängt wird,
    // solange diese Quelle aktiv ist - anders als `damage` (fester Bonus) ist das ein echter
    // Extrawurf mit eigener Varianz, z.B. für Rage-Schaden.
    bonusDamageFormula: normalizeCombatDamageFormula(source.bonusDamageFormula),
    // Attributspezifischer Vor-/Nachteil auf Rettungswürfe, unabhängig vom pauschalen `savingThrow`-Bonus.
    savingThrowAdvantageAttributes: sanitizeAttributeKeyList(source.savingThrowAdvantageAttributes),
    savingThrowDisadvantageAttributes: sanitizeAttributeKeyList(source.savingThrowDisadvantageAttributes)
  };
}

function sanitizeAttribute(value = {}, definition) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    key: definition.key,
    label: normalizeText(source.label || definition.label, 40),
    shortLabel: normalizeText(source.shortLabel || definition.shortLabel, 8),
    score: normalizeNumber(source.score, 10, 1, 40),
    modifierOverride: normalizeOptionalNumber(source.modifierOverride, -20, 20)
  };
}

function sanitizeSavingThrow(value = {}, definition) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    attributeKey: definition.key,
    proficient: normalizeBoolean(source.proficient),
    expertise: normalizeBoolean(source.expertise),
    bonus: normalizeNumber(source.bonus, 0, -99, 99)
  };
}

function sanitizeSkill(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const proficiency = normalizeText(source.proficiency, 20);
  return {
    id: normalizeId(source.id, `skill-${index + 1}`),
    name: normalizeText(source.name, 100),
    attributeKey: getAttributeKey(source.attributeKey || source.attribute, 'dexterity'),
    proficiency: PROFICIENCY_LEVELS.has(proficiency) ? proficiency : 'none',
    bonus: normalizeNumber(source.bonus, 0, -99, 99),
    notes: normalizeText(source.notes, 500)
  };
}

function normalizeSkillName(value = '') {
  return String(value || '').trim().toLocaleLowerCase('de').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function ensureRequiredSkills(skills = []) {
  const result = (Array.isArray(skills) ? skills : []).map(skill => ({ ...skill }));
  REQUIRED_SKILLS.forEach(definition => {
    const accepted = new Set(definition.aliases.map(normalizeSkillName));
    const existing = result.find(skill => accepted.has(normalizeSkillName(skill?.name)));
    if (existing) {
      existing.name = definition.name;
      existing.attributeKey ||= definition.attributeKey;
      return;
    }
    result.push({ id: definition.id, name: definition.name, attributeKey: definition.attributeKey });
  });
  return result;
}

function inferWeaponType(source = {}) {
  const explicit = normalizeText(source.weaponType || source.type, 30);
  if (WEAPON_TYPES.has(explicit)) return explicit;
  const text = `${source.name || ''} ${source.properties || ''}`.toLocaleLowerCase('de');
  if (/langschwert|kurzschwert|schwert|säbel|degen|rapier|klinge/.test(text)) return 'sword';
  if (/dolch|messer/.test(text)) return 'dagger';
  if (/axt|beil/.test(text)) return 'axe';
  if (/hammer|keule|morgenstern|streitkolben/.test(text)) return 'mace';
  if (/speer|lanze|dreizack/.test(text)) return 'spear';
  if (/hellebarde|partisane|glefe|stangenwaffe/.test(text)) return 'polearm';
  if (/armbrust/.test(text)) return 'crossbow';
  if (/bogen/.test(text)) return 'bow';
  if (/pistole|muskete|gewehr/.test(text)) return 'firearm';
  if (/stab|stock/.test(text)) return 'staff';
  if (/schild/.test(text)) return 'shield';
  if (/biss|klaue|kralle|stachel|schwanz/.test(text)) return 'natural';
  if (/zauber|arkan|magie/.test(text)) return 'arcane';
  return source.rangeType === 'ranged' ? 'bow' : 'unarmed';
}

function sanitizeWeapon(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const weaponType = inferWeaponType(source);
  const training = normalizeText(source.training || source.category, 30);
  const activationType = normalizeText(source.activationType, 30);
  return {
    id: normalizeId(source.id, `weapon-${index + 1}`),
    inventoryItemId: normalizeText(source.inventoryItemId, 120),
    name: normalizeText(source.name, 120),
    image: normalizeText(source.image || source.icon, 1000),
    weaponProfileId: normalizeText(source.weaponProfileId, 80).toLowerCase(),
    weaponType: WEAPON_TYPES.has(weaponType) ? weaponType : (source.rangeType === 'ranged' ? 'bow' : 'unarmed'),
    training: WEAPON_TRAINING.has(training) ? training : 'simple',
    damageFormula: normalizeCombatDamageFormula(source.damageFormula),
    versatileDamageFormula: normalizeCombatDamageFormula(source.versatileDamageFormula),
    damageType: normalizeText(source.damageType || 'physisch', 80),
    attackAttribute: getAttributeKey(source.attackAttribute, source.rangeType === 'ranged' ? 'dexterity' : 'strength'),
    proficient: normalizeBoolean(source.proficient, true),
    attackBonus: normalizeNumber(source.attackBonus, 0, -99, 99),
    damageBonus: normalizeNumber(source.damageBonus, 0, -99, 99),
    range: normalizeText(source.range || (source.rangeType === 'ranged' ? 'Fernkampf' : 'Nahkampf'), 80),
    properties: normalizeText(source.properties, 500),
    notes: normalizeText(source.notes, 800),
    requirements: normalizeText(source.requirements, 1000),
    aiInstructions: normalizeText(source.aiInstructions, 1600),
    effects: normalizeCombatEffects(source.effects),
    ammunition: source.ammunition && typeof source.ammunition === 'object' ? {
      inventoryItemId: normalizeText(source.ammunition.inventoryItemId, 120),
      amountPerUse: normalizeNumber(source.ammunition.amountPerUse, 1, 1, 99),
      reloadAfter: normalizeNumber(source.ammunition.reloadAfter, 0, 0, 999),
      required: normalizeBoolean(source.ammunition.required)
    } : null,
    activationType: ACTIVATION_TYPES.has(activationType) ? activationType : 'action',
    costs: normalizeCombatResourceCosts(source.costs?.length ? source.costs : getDefaultActivationCosts(activationType || 'action')),
    auraBypass: {
      allowed: normalizeBoolean(source.auraBypass?.allowed, true),
      resourceId: normalizeText(source.auraBypass?.resourceId, 120),
      cost: normalizeNumber(source.auraBypass?.cost, 1, 1, 999)
    },
    equipped: normalizeBoolean(source.equipped, index === 0)
  };
}

function sanitizeWeaponsWithDefault(value = []) {
  const weapons = sanitizeList(value, sanitizeWeapon);
  const existingDefault = weapons.find(weapon => weapon.id === DEFAULT_MELEE_WEAPON.id)
    || weapons.find(weapon => weapon.weaponType === 'unarmed' && weapon.name.toLocaleLowerCase('de') === 'nahkampf');
  if (existingDefault) return weapons;
  if (weapons.length >= 60) weapons.length = 59;
  weapons.push(sanitizeWeapon({
    ...DEFAULT_MELEE_WEAPON,
    equipped: weapons.length === 0
  }, weapons.length));
  return weapons;
}

function sanitizeArmor(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const kind = normalizeText(source.kind, 20);
  const dexterityMode = normalizeText(source.dexterityMode, 20);
  return {
    id: normalizeId(source.id, `armor-${index + 1}`),
    inventoryItemId: normalizeText(source.inventoryItemId, 120),
    name: normalizeText(source.name, 120),
    image: normalizeText(source.image || source.icon, 1000),
    kind: ['armor', 'shield', 'ward'].includes(kind) ? kind : 'armor',
    baseArmorClass: normalizeOptionalNumber(source.baseArmorClass, 0, 99),
    armorClassBonus: normalizeNumber(source.armorClassBonus ?? source.defenseBonus, 0, -99, 99),
    dexterityMode: DEXTERITY_MODES.has(dexterityMode) ? dexterityMode : 'full',
    dexterityCap: normalizeNumber(source.dexterityCap, 2, -20, 20),
    dexterityUnlockLevel: normalizeNumber(source.dexterityUnlockLevel, 0, 0, 30),
    properties: normalizeText(source.properties, 500),
    notes: normalizeText(source.notes, 800),
    equipped: normalizeBoolean(source.equipped, index === 0)
  };
}

function sanitizeResource(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const recovery = normalizeText(source.recovery, 20);
  const scope = normalizeText(source.scope, 20);
  const spellLevel = normalizeOptionalNumber(source.spellLevel, 1, 10);
  return {
    id: normalizeId(source.id, `resource-${index + 1}`),
    name: normalizeText(source.name, 100),
    current: normalizeNumber(source.current, 0, -9999, 9999),
    maximum: normalizeNumber(source.maximum, 0, 0, 9999),
    recovery: RECOVERY_TYPES.has(recovery) ? recovery : 'manual',
    scope: RESOURCE_SCOPES.has(scope) ? scope : 'persistent',
    category: normalizeText(source.category, 40),
    ...(normalizeText(source.paymentRole, 40) ? { paymentRole: normalizeText(source.paymentRole, 40) } : {}),
    icon: normalizeText(source.icon, 1000),
    ...(spellLevel != null ? { spellLevel } : {}),
    ...(normalizeText(source.recoveryDayKey, 160) ? { recoveryDayKey: normalizeText(source.recoveryDayKey, 160) } : {}),
    notes: normalizeText(source.notes, 500)
  };
}

function ensureDefaultCoreResources(resources = []) {
  const result = (Array.isArray(resources) ? resources : []).map(resource => ({ ...resource }));
  const legacyFate = result.find(resource => resource.id === 'fate-points' || /schicksalspunkte/i.test(String(resource.name || '')));
  if (legacyFate && !result.some(resource => resource.id === 'celestial-points')) {
    legacyFate.id = 'celestial-points';
    legacyFate.name = 'Celestiale Punkte';
    legacyFate.recovery = 'day';
    legacyFate.scope = 'persistent';
    legacyFate.category = 'celestial';
  }
  DEFAULT_RESOURCES.forEach(definition => {
    const existing = result.find(resource => resource.id === definition.id);
    if (existing) {
      existing.name = definition.name;
      existing.recovery = definition.recovery;
      existing.scope = definition.scope;
      existing.category ||= definition.category;
      return;
    }
    result.push({ ...definition });
  });
  return result.filter((resource, index, source) => source.findIndex(candidate => candidate.id === resource.id) === index);
}

// Whenever a level-derived table implies a higher maximum than what was last persisted,
// treat the increase as a level-up top-up (mirrors how maximum hit points grow): raise the
// maximum and carry current up by the same delta, but never lower an already-higher value
// (e.g. a manually boosted resource, or a value the DM deliberately set higher).
function applyLevelDerivedResourceCeiling(resources, resourceId, targetMaximum) {
  const resource = resources.find(entry => entry.id === resourceId);
  if (!resource || targetMaximum <= resource.maximum) return;
  const delta = targetMaximum - resource.maximum;
  resource.maximum = targetMaximum;
  resource.current = Math.max(0, Math.min(targetMaximum, resource.current + delta));
}

function sanitizeTemplateSelections(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    schemaVersion: normalizeNumber(source.schemaVersion, 1, 1, 99),
    ancestryId: normalizeText(source.ancestryId, 120),
    backgroundId: normalizeText(source.backgroundId, 120),
    classId: normalizeText(source.classId || source.archetypeId, 120),
    attributeMethod: ['standard-array', 'point-buy', 'rolled', 'free'].includes(normalizeText(source.attributeMethod, 30))
      ? normalizeText(source.attributeMethod, 30)
      : '',
    appliedAt: normalizeText(source.appliedAt, 80)
  };
}

function sanitizeProficiencies(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const list = (items, maximum = 80) => [...new Set((Array.isArray(items) ? items : [])
    .map(item => normalizeText(item, 120))
    .filter(Boolean))].slice(0, maximum);
  return {
    armor: list(source.armor),
    weapons: list(source.weapons),
    tools: list(source.tools),
    languages: list(source.languages),
    notes: normalizeText(source.notes, 1600)
  };
}

function sanitizeQuirk(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const type = normalizeText(source.type, 20);
  return {
    id: normalizeId(source.id, `quirk-${index + 1}`),
    name: normalizeText(source.name, 100),
    type: ['quirk', 'trait', 'ideal', 'bond', 'flaw', 'rule'].includes(type) ? type : 'quirk',
    description: normalizeText(source.description, 1200),
    appliesWhen: normalizeText(source.appliesWhen, 500),
    trigger: normalizeText(source.trigger, 500),
    target: normalizeText(source.target || 'self', 80),
    duration: normalizeText(source.duration, 120),
    stacking: normalizeText(source.stacking || 'normal', 80),
    tags: normalizeText(source.tags, 500),
    limitations: normalizeText(source.limitations, 1000),
    aiInstructions: normalizeText(source.aiInstructions, 1600),
    priority: normalizeNumber(source.priority, 0, -99, 99),
    active: normalizeBoolean(source.active, true),
    mechanics: sanitizeMechanicalModifiers(source.mechanics),
    triggerRules: sanitizeCombatTriggerRules(source.triggerRules || (source.triggerRule ? [source.triggerRule] : []))
  };
}

function sanitizeCondition(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    id: normalizeId(source.id, `condition-${index + 1}`),
    name: normalizeText(source.name, 100),
    duration: normalizeText(source.duration, 100),
    source: normalizeText(source.source, 160),
    description: normalizeText(source.description, 1200),
    active: normalizeBoolean(source.active, true),
    mechanics: sanitizeMechanicalModifiers(source.mechanics),
    triggerRules: sanitizeCombatTriggerRules(source.triggerRules || (source.triggerRule ? [source.triggerRule] : []))
  };
}

function sanitizeInventoryUseTrigger(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const itemTags = (Array.isArray(source.itemTags) ? source.itemTags : String(source.itemTags || '').split(','))
    .map(item => normalizeText(item, 80).toLocaleLowerCase('de'))
    .filter(Boolean);
  const restoreResources = (Array.isArray(source.restoreResources) ? source.restoreResources : [])
    .map((entry, index) => ({
      id: normalizeId(entry?.id, `inventory-restore-${index + 1}`),
      resourceId: normalizeText(entry?.resourceId, 120),
      amount: normalizeNumber(entry?.amount, 1, 1, 999)
    }))
    .filter(entry => entry.resourceId)
    .slice(0, 12);
  return {
    enabled: normalizeBoolean(source.enabled),
    itemTags: [...new Set(itemTags)].slice(0, 20),
    restoreResources,
    requireActualRecovery: normalizeBoolean(source.requireActualRecovery, true)
  };
}

function sanitizeAbility(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const recovery = normalizeText(source.recovery, 20);
  const activationType = normalizeText(source.activationType, 30);
  const delivery = normalizeText(source.delivery, 30);
  const resolutionType = normalizeText(source.resolutionType, 30);
  return {
    id: normalizeId(source.id, `ability-${index + 1}`),
    name: normalizeText(source.name, 120),
    description: normalizeText(source.description, 1600),
    usesCurrent: normalizeNumber(source.usesCurrent, 0, 0, 999),
    usesMaximum: normalizeNumber(source.usesMaximum, 0, 0, 999),
    recovery: RECOVERY_TYPES.has(recovery) ? recovery : 'none',
    recoveryDayKey: normalizeText(source.recoveryDayKey, 160),
    rollFormula: normalizeCombatDamageFormula(source.rollFormula),
    damageType: normalizeText(source.damageType || 'physisch', 80),
    activationType: ACTIVATION_TYPES.has(activationType) ? activationType : 'action',
    delivery: ABILITY_DELIVERIES.has(delivery) ? delivery : 'ability',
    // Erlaubt Fähigkeiten wie Spells eine Rettungswurf-Auflösung (z.B. Arkaner Schrei gegen
    // Konstitution) statt nur automatischer oder angriffswurfbasierter Auflösung.
    resolutionType: SPELL_RESOLUTION_TYPES.has(resolutionType) ? resolutionType : '',
    saveAttribute: getAttributeKey(source.saveAttribute, 'dexterity'),
    halfDamageOnSave: normalizeBoolean(source.halfDamageOnSave),
    combatUsable: normalizeBoolean(source.combatUsable),
    target: normalizeText(source.target, 160),
    range: normalizeText(source.range, 160),
    duration: normalizeText(source.duration, 160),
    requirements: normalizeText(source.requirements, 1000),
    tags: normalizeText(source.tags, 500),
    aiInstructions: normalizeText(source.aiInstructions, 1600),
    effects: normalizeCombatEffects(source.effects),
    concentration: normalizeBoolean(source.concentration),
    channelComments: normalizeNumber(source.channelComments, 0, 0, 99),
    costs: normalizeCombatResourceCosts(source.costs?.length ? source.costs : getDefaultActivationCosts(activationType || 'action')),
    auraBypass: {
      allowed: normalizeBoolean(source.auraBypass?.allowed, true),
      resourceId: normalizeText(source.auraBypass?.resourceId, 120),
      cost: normalizeNumber(source.auraBypass?.cost, 1, 1, 999)
    },
    active: normalizeBoolean(source.active, true),
    mechanics: sanitizeMechanicalModifiers(source.mechanics),
    triggerRules: sanitizeCombatTriggerRules(source.triggerRules || (source.triggerRule ? [source.triggerRule] : [])),
    inventoryUseTrigger: sanitizeInventoryUseTrigger(source.inventoryUseTrigger)
  };
}

function sanitizeSpell(value = {}, index = 0, manaResourceId = 'mana-focus') {
  const source = value && typeof value === 'object' ? value : {};
  const activationType = normalizeText(source.activationType, 30);
  const resolutionType = normalizeText(source.resolutionType, 30);
  const inferredLegacyLevel = getSpellSlotLevel({ id: source.slotResourceId, name: source.slotResourceId })
    || (Number(source.manaCost) > 0 || Number(source.slotCost) > 0 ? 1 : 0);
  const level = normalizeNumber(source.level, inferredLegacyLevel, 0, 10);
  const cantrip = level === 0;
  const id = normalizeId(source.id, `spell-${index + 1}`);
  const manaCost = getSpellManaCost(level);
  const resolvedManaResourceId = normalizeText(manaResourceId, 120) || 'mana-focus';
  const baseCosts = normalizeCombatResourceCosts(source.costs?.length ? source.costs : getDefaultActivationCosts(activationType || 'action'))
    .filter(cost => ![resolvedManaResourceId, 'mana-focus', 'pact-points'].includes(cost.resourceId));
  return {
    id,
    name: normalizeText(source.name, 120),
    school: normalizeText(source.school, 60),
    icon: normalizeText(source.icon, 1000),
    level,
    manaCost,
    slotResourceId: cantrip ? '' : normalizeText(source.slotResourceId, 120),
    slotCost: cantrip ? 0 : normalizeNumber(source.slotCost, 1, 1, 99),
    presentationKind: SPELL_PRESENTATION_KINDS.has(normalizeText(source.presentationKind, 20)) ? normalizeText(source.presentationKind, 20) : 'spell',
    activationType: ACTIVATION_TYPES.has(activationType) ? activationType : 'action',
    resolutionType: SPELL_RESOLUTION_TYPES.has(resolutionType) ? resolutionType : 'spell-attack',
    saveAttribute: getAttributeKey(source.saveAttribute, 'dexterity'),
    halfDamageOnSave: normalizeBoolean(source.halfDamageOnSave),
    damageType: normalizeText(source.damageType || 'Magie', 80),
    range: normalizeText(source.range || 'Zauber', 160),
    duration: normalizeText(source.duration, 160),
    requirements: normalizeText(source.requirements, 1000),
    tags: normalizeText(source.tags, 500),
    aiInstructions: normalizeText(source.aiInstructions, 1600),
    effects: normalizeCombatEffects(source.effects),
    concentration: normalizeBoolean(source.concentration),
    channelComments: normalizeNumber(source.channelComments, 0, 0, 99),
    upcast: source.upcast && typeof source.upcast === 'object' ? {
      enabled: normalizeBoolean(source.upcast.enabled),
      formulaPerLevel: normalizeCombatDamageFormula(source.upcast.formulaPerLevel),
      amountPerLevel: normalizeNumber(source.upcast.amountPerLevel, 0, 0, 999),
      maximumLevel: normalizeNumber(source.upcast.maximumLevel, 10, 1, 10)
    } : { enabled: false, formulaPerLevel: '', amountPerLevel: 0, maximumLevel: 10 },
    costs: [
      ...baseCosts,
      { id: `${id}-mana-cost`, resourceId: resolvedManaResourceId, name: resolvedManaResourceId === 'pact-points' ? 'Paktpunkte' : 'Mana', amount: manaCost, scope: 'persistent' }
    ],
    auraBypass: {
      allowed: normalizeBoolean(source.auraBypass?.allowed, true),
      resourceId: normalizeText(source.auraBypass?.resourceId, 120),
      cost: normalizeNumber(source.auraBypass?.cost, 1, 1, 999)
    },
    rollFormula: normalizeCombatDamageFormula(source.rollFormula),
    description: normalizeText(source.description, 1600),
    prepared: normalizeBoolean(source.prepared, true)
  };
}

function sanitizeTechniqueSecondarySave(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const failure = source.failureCondition && typeof source.failureCondition === 'object' ? source.failureCondition : {};
  return {
    enabled: normalizeBoolean(source.enabled),
    attributeKey: getAttributeKey(source.attributeKey, 'constitution'),
    dcBase: normalizeNumber(source.dcBase, 8, 0, 99),
    dcAttributeKey: getAttributeKey(source.dcAttributeKey, 'strength'),
    addProficiency: normalizeBoolean(source.addProficiency, true),
    failureCondition: {
      id: normalizeId(failure.id, 'technique-save-condition'),
      name: normalizeText(failure.name, 120),
      duration: normalizeText(failure.duration, 160),
      description: normalizeText(failure.description, 1200),
      mechanics: sanitizeMechanicalModifiers(failure.mechanics)
    }
  };
}

function sanitizeTechniqueFollowUp(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    enabled: normalizeBoolean(source.enabled),
    sameTarget: normalizeBoolean(source.sameTarget, true),
    damageFormula: normalizeCombatDamageFormula(source.damageFormula),
    damageType: normalizeText(source.damageType, 80),
    attackBonus: normalizeNumber(source.attackBonus, 0, -99, 99),
    damageBonus: normalizeNumber(source.damageBonus, 0, -99, 99),
    inheritDamageModifier: normalizeBoolean(source.inheritDamageModifier, true),
    inheritBonusDamage: normalizeBoolean(source.inheritBonusDamage, true),
    // Wie oft dieser Folgeangriff separat gewürfelt wird (z.B. 2 für insgesamt drei Angriffe
    // in einer Handlung: Hauptangriff + zwei Folgeangriffe, jeder für sich Treffer/Fehlschlag).
    repeatCount: normalizeNumber(source.repeatCount, 1, 1, 5),
    triggerReactions: normalizeBoolean(source.triggerReactions, true),
    repeatPerAttackRules: normalizeBoolean(source.repeatPerAttackRules, true),
    triggerFurtherEffects: normalizeBoolean(source.triggerFurtherEffects, false)
  };
}

function sanitizeTechniqueDamageModel(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    mode: source.mode === 'weapon-dice' ? 'weapon-dice' : 'fixed',
    weaponDiceMultiplier: normalizeNumber(source.weaponDiceMultiplier, 1, 1, 8),
    bonusFormula: normalizeCombatDamageFormula(source.bonusFormula),
    bonusWeaponDice: normalizeNumber(source.bonusWeaponDice, 0, 0, 3),
    bonusWeaponDieCap: [4, 6, 8, 10, 12].includes(Number(source.bonusWeaponDieCap)) ? Number(source.bonusWeaponDieCap) : 12,
    scalingSteps: sanitizeList(source.scalingSteps, step => ({
      level: normalizeNumber(step?.level, 1, 1, 20),
      formula: normalizeCombatDamageFormula(step?.formula)
    }), 6).filter(step => step.formula)
  };
}

function sanitizeCenyrTechniqueTraining(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const classWeaponProfiles = Object.fromEntries(Object.entries(source.classWeaponProfiles || {})
    .slice(0, 20)
    .map(([classId, profileIds]) => [
      normalizeText(classId, 80).toLowerCase(),
      sanitizeList(profileIds, item => normalizeText(item, 80).toLowerCase(), 20).filter(Boolean)
    ])
    .filter(([classId, profileIds]) => classId && profileIds.length));
  return {
    branchId: normalizeText(source.branchId, 120),
    weaponRuleSetId: normalizeText(source.weaponRuleSetId, 120),
    uchelwyrCompatible: normalizeBoolean(source.uchelwyrCompatible),
    requiresMounted: normalizeBoolean(source.requiresMounted),
    allowedClassIds: sanitizeList(source.allowedClassIds, item => normalizeText(item, 80).toLowerCase(), 20).filter(Boolean),
    classWeaponProfiles,
    slotBands: sanitizeList(source.slotBands, item => normalizeText(item, 80), 20).filter(Boolean),
    designNotes: normalizeText(source.designNotes, 1000),
    assignedSlotId: normalizeText(source.assignedSlotId, 120),
    selectedAtLevel: normalizeOptionalNumber(source.selectedAtLevel, 1, 20),
    sourceStatus: ['confirmed', 'draft'].includes(normalizeText(source.sourceStatus, 30))
      ? normalizeText(source.sourceStatus, 30)
      : ''
  };
}

function sanitizeClassTraining(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const selections = sanitizeList(source.selections, (selection = {}) => ({
    kind: ['path', 'branch'].includes(normalizeText(selection.kind, 20)) ? normalizeText(selection.kind, 20) : '',
    selectionId: normalizeText(selection.selectionId, 120),
    selectedAtLevel: normalizeNumber(selection.selectedAtLevel, 1, 1, 20),
    spentTechniqueSlotId: normalizeText(selection.spentTechniqueSlotId, 120)
  }), 40).filter(selection => selection.kind && selection.selectionId);
  const techniqueSelections = sanitizeList(source.techniqueSelections, (selection = {}) => ({
    slotId: normalizeText(selection.slotId, 120),
    techniqueId: normalizeText(selection.techniqueId, 180),
    selectedAtLevel: normalizeNumber(selection.selectedAtLevel, 1, 1, 20)
  }), 40).filter(selection => selection.slotId && selection.techniqueId);
  return {
    schemaVersion: 2,
    curriculumId: normalizeText(source.curriculumId, 120),
    selections: selections.filter((selection, index) => selections.findIndex(candidate => (
      candidate.kind === selection.kind && candidate.selectionId === selection.selectionId
    )) === index),
    techniqueSelections: techniqueSelections.filter((selection, index) => techniqueSelections.findIndex(candidate => (
      candidate.slotId === selection.slotId || candidate.techniqueId === selection.techniqueId
    )) === index)
  };
}

function sanitizeTechnique(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const activationType = normalizeText(source.activationType, 30);
  const rollMode = normalizeText(source.rollMode, 20);
  const weaponTypes = (Array.isArray(source.weaponTypes) ? source.weaponTypes : String(source.weaponTypes || '').split(','))
    .map(item => normalizeText(item, 30))
    .filter(item => WEAPON_TYPES.has(item));
  const effects = normalizeCombatEffects(source.effects);
  const inferredMaximumTargets = effects.some(effect => ['selected', 'allies', 'enemies', 'all'].includes(effect.target)) ? 20 : 1;
  return {
    id: normalizeId(source.id, `technique-${index + 1}`),
    name: normalizeText(source.name, 140),
    status: ['confirmed', 'draft', 'deprecated'].includes(normalizeText(source.status, 30)) ? normalizeText(source.status, 30) : 'confirmed',
    trainingForm: normalizeText(source.trainingForm, 140),
    ...(normalizeText(source.combatStyleId, 120) ? { combatStyleId: normalizeText(source.combatStyleId, 120) } : {}),
    ...(normalizeText(source.combatStyleFormId, 120) ? { combatStyleFormId: normalizeText(source.combatStyleFormId, 120) } : {}),
    minimumLevel: normalizeNumber(source.minimumLevel, 1, 1, 30),
    category: ['technique', 'form', 'reaction', 'bonus', 'special'].includes(normalizeText(source.category, 30))
      ? normalizeText(source.category, 30)
      : 'technique',
    description: normalizeText(source.description, 2000),
    effect: normalizeText(source.effect, 1600),
    activationType: ACTIVATION_TYPES.has(activationType) ? activationType : 'action',
    weaponTypes: [...new Set(weaponTypes)].slice(0, 20),
    compatibleWeaponIds: sanitizeList(source.compatibleWeaponIds, item => normalizeText(item, 120), 40).filter(Boolean),
    damageFormula: normalizeCombatDamageFormula(source.damageFormula),
    damageModel: sanitizeTechniqueDamageModel(source.damageModel),
    damageType: normalizeText(source.damageType, 80),
    attackBonus: normalizeNumber(source.attackBonus, 0, -99, 99),
    damageBonus: normalizeNumber(source.damageBonus, 0, -99, 99),
    targetDefenseModifier: normalizeNumber(source.targetDefenseModifier, 0, -99, 99),
    rollMode: ROLL_MODES.has(rollMode) ? rollMode : 'normal',
    criticalThreshold: normalizeNumber(source.criticalThreshold, 20, 2, 20),
    maximumTargets: normalizeNumber(source.maximumTargets, inferredMaximumTargets, 1, 20),
    range: normalizeText(source.range, 160),
    target: normalizeText(source.target, 160),
    duration: normalizeText(source.duration, 160),
    requirements: normalizeText(source.requirements, 1200),
    tags: normalizeText(source.tags, 500),
    aiInstructions: normalizeText(source.aiInstructions, 1600),
    mechanicNotes: sanitizeList(source.mechanicNotes, item => normalizeText(item, 600), 8).filter(Boolean),
    effects,
    costs: normalizeCombatResourceCosts(source.costs?.length ? source.costs : getDefaultActivationCosts(activationType || 'action')),
    auraBypass: {
      allowed: normalizeBoolean(source.auraBypass?.allowed, true),
      resourceId: normalizeText(source.auraBypass?.resourceId, 120),
      cost: normalizeNumber(source.auraBypass?.cost, 1, 1, 999)
    },
    active: normalizeBoolean(source.active, true),
    mechanics: sanitizeMechanicalModifiers(source.mechanics),
    triggerRules: sanitizeCombatTriggerRules(source.triggerRules || (source.triggerRule ? [source.triggerRule] : [])),
    secondarySave: sanitizeTechniqueSecondarySave(source.secondarySave),
    followUpAttack: sanitizeTechniqueFollowUp(source.followUpAttack),
    cenyrTraining: sanitizeCenyrTechniqueTraining(source.cenyrTraining)
  };
}

function sanitizeAuraComponent(value = {}, defaults = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    enabled: normalizeBoolean(source.enabled, defaults.enabled ?? false),
    active: normalizeBoolean(source.active, defaults.active ?? false),
    name: normalizeText(source.name || defaults.name, 140),
    description: normalizeText(source.description, 2400),
    radius: normalizeText(source.radius, 160),
    target: normalizeText(source.target || defaults.target, 160),
    trigger: normalizeText(source.trigger, 600),
    duration: normalizeText(source.duration, 160),
    requirements: normalizeText(source.requirements, 1200),
    aiInstructions: normalizeText(source.aiInstructions, 1800),
    selfMechanics: sanitizeMechanicalModifiers(source.selfMechanics),
    allyMechanics: sanitizeMechanicalModifiers(source.allyMechanics),
    enemyMechanics: sanitizeMechanicalModifiers(source.enemyMechanics)
  };
}

function sanitizeAura(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    enabled: normalizeBoolean(source.enabled),
    name: normalizeText(source.name || 'Aura', 140),
    domain: normalizeText(source.domain, 600),
    focusResourceId: normalizeText(source.focusResourceId || 'aura-focus', 120),
    focusBypassCost: normalizeNumber(source.focusBypassCost, 1, 1, 999),
    notes: normalizeText(source.notes, 2400),
    activeForm: sanitizeAuraComponent(source.activeForm, { name: 'Aktive Form', target: 'Selbst und gewählte Ziele' }),
    latentPresence: sanitizeAuraComponent(source.latentPresence, { name: 'Latente Präsenz', target: 'Umgebung, Verbündete und Gegner', enabled: true, active: true })
  };
}

function getLegacyWeapons(source) {
  if (Array.isArray(source.weapons)) return source.weapons;
  const weapon = source.weapon || source.equippedWeapon;
  if (!weapon || (!weapon.name && !weapon.damageFormula && !weapon.inventoryItemId)) return [];
  return [{
    ...weapon,
    id: 'legacy-weapon',
    inventoryItemId: weapon.inventoryItemId || source.equippedWeaponId,
    proficient: weapon.proficient ?? false,
    equipped: true
  }];
}

function getLegacyArmor(source) {
  if (Array.isArray(source.armorItems)) return source.armorItems;
  if (Array.isArray(source.armor)) return source.armor;
  const armor = source.armor;
  if (!armor || (!armor.name && armor.defenseBonus == null && !armor.inventoryItemId)) return [];
  return [{ ...armor, id: 'legacy-armor', armorClassBonus: armor.defenseBonus, equipped: true }];
}

export function sanitizeCharacterCombatProfile(value = {}, options = {}) {
  const source = reconcileClassDamageRevisions(value && typeof value === 'object' ? value : {});
  const sourceAttributes = new Map((Array.isArray(source.attributes) ? source.attributes : [])
    .map(attribute => [getAttributeKey(attribute?.key, ''), attribute]));
  const sourceSaves = new Map((Array.isArray(source.savingThrows) ? source.savingThrows : [])
    .map(save => [getAttributeKey(save?.attributeKey, ''), save]));
  const progression = source.progression || {};
  const hitPoints = source.hitPoints || {};
  const armorClass = source.armorClass || {};
  const combat = source.combat || {};
  const magic = source.magic || {};
  const legacyMaximumHitPoints = normalizeOptionalNumber(source.maximumHitPoints, 1, 9999);
  const legacyBaseDefense = normalizeOptionalNumber(source.baseDefense ?? source.defense, 1, 999);
  const magicEnabled = normalizeBoolean(magic.enabled);
  const normalizedCasterTier = CASTER_TIERS.includes(normalizeText(magic.casterTier, 10)) ? normalizeText(magic.casterTier, 10) : 'full';
  const normalizedManaResourceId = normalizeText(magic.manaResourceId, 120) || 'mana-focus';
  const normalizedBypassResourceId = MANA_BYPASS_RESOURCE_IDS.includes(normalizeText(magic.bypassResourceId, 40))
    ? normalizeText(magic.bypassResourceId, 40)
    : '';
  const normalizedFocusEnabled = normalizeBoolean(magic.focusEnabled);
  const normalizedFocusResourceId = normalizeText(magic.focusResourceId, 120) || 'focus';
  const sanitizedSpells = (Array.isArray(magic.spells) ? magic.spells : [])
    .slice(0, 60)
    .map((spell, index) => sanitizeSpell(spell, index, normalizedManaResourceId));
  const configuredSlotResourceIds = sanitizeList(magic.slotResourceIds, item => normalizeText(item, 120), 20).filter(Boolean);
  const normalizedNormalLevel = normalizeNumber(progression.level ?? source.level, 1, 1, 20);
  const normalizedSpecialLevels = normalizeNumber(progression.specialLevels ?? source.specialLevels, 0, 0, 10);
  const actionPoolChoices = Array.isArray(progression.actionPoolChoices)
    ? normalizeActionPoolChoices(progression.actionPoolChoices, normalizedNormalLevel)
    : fillActionPoolChoices([], normalizedNormalLevel);
  const resourceSources = ensureSpellSlotResources(
    ensureCombatActionResources(
      ensureDefaultCoreResources(Array.isArray(source.resources) ? source.resources : DEFAULT_RESOURCES),
      { level: normalizedNormalLevel, specialLevels: normalizedSpecialLevels, actionPoolChoices }
    ),
    {
      enabled: magicEnabled,
      spells: sanitizedSpells,
      slotResourceIds: configuredSlotResourceIds,
      always: options.ensureSpellSlots !== false
    }
  );
  const sanitizedResources = sanitizeList(resourceSources, sanitizeResource, 100);
  const auraFocus = sanitizedResources.find(resource => resource.id === 'aura-focus');
  if (auraFocus) {
    const spent = Math.max(0, auraFocus.maximum - auraFocus.current);
    auraFocus.maximum = getAuraFocusMaximum(normalizedNormalLevel, normalizedSpecialLevels);
    auraFocus.current = Math.max(0, auraFocus.maximum - spent);
  }
  if (magicEnabled) {
    // Paktpunkte (Hexer) replace Mana entirely rather than growing like a full/half caster
    // pool - they deliberately follow the smaller Celestial/Infernal-style curve for now.
    const manaMaximum = normalizedManaResourceId === PACT_POINTS_RESOURCE_ID
      ? getPactPointsMaximum(normalizedNormalLevel, normalizedSpecialLevels)
      : getCasterManaMaximum(normalizedCasterTier, normalizedNormalLevel, normalizedSpecialLevels);
    applyLevelDerivedResourceCeiling(sanitizedResources, normalizedManaResourceId, manaMaximum);
    // Grades no longer gate casts by consuming a limited slot count - mana does - but the
    // slot resources stay as a simple "is this grade unlocked yet" flag (maximum >= 1),
    // which is also what the composer UI already checks to enable higher spell grades.
    const highestUnlockedGrade = getHighestUnlockedSpellGrade(normalizedCasterTier, normalizedNormalLevel);
    for (let grade = 1; grade <= 10; grade += 1) {
      const resource = sanitizedResources.find(entry => entry.id === `spell-slot-${grade}`);
      if (!resource) continue;
      resource.maximum = grade <= highestUnlockedGrade ? 1 : 0;
      resource.current = Math.min(resource.current, resource.maximum);
    }
  }
  if (normalizedBypassResourceId) {
    applyLevelDerivedResourceCeiling(
      sanitizedResources,
      normalizedBypassResourceId,
      getDivineOrInfernalPointsMaximum(normalizedNormalLevel, normalizedSpecialLevels)
    );
  }
  if (normalizedFocusEnabled) {
    // Fokus (Asket und ähnliche) ist strukturell von Mana getrennt: eigene Ressource, eigene
    // Wachstumskurve, unabhängig davon ob die Figur außerdem magic.enabled gesetzt hat.
    applyLevelDerivedResourceCeiling(
      sanitizedResources,
      normalizedFocusResourceId,
      getFocusMaximum(normalizedNormalLevel, normalizedSpecialLevels)
    );
  }
  const finalizedSpells = sanitizedSpells.map(spell => ({
    ...spell,
    slotResourceId: spell.level === 0
      ? ''
      : (spell.slotResourceId || findSpellSlotResourceId(sanitizedResources, spell.level))
  }));
  const spellSlotResourceIds = getOrderedSpellSlotResources(sanitizedResources, configuredSlotResourceIds)
    .map(resource => resource.id);

  return {
    schemaVersion: COMBAT_PROFILE_SCHEMA_VERSION,
    // Monotone Kennzahl gegen versehentliches Zurücküberschreiben durch veraltete Browser-Tabs
    // (z. B. ein Tab, der vor einem Charakterimport geladen wurde). saveCharacter() in firebase.js
    // vergleicht diesen Wert mit dem serverseitig gespeicherten, bevor ein Kampfprofil ersetzt wird.
    revision: Math.max(0, Math.trunc(Number(source.revision) || 0)),
    identity: {
      ancestry: normalizeText(source.identity?.ancestry || source.ancestry, 100),
      archetype: normalizeText(source.identity?.archetype || source.archetype, 120),
      background: normalizeText(source.identity?.background || source.background, 120)
    },
    templateSelections: sanitizeTemplateSelections(source.templateSelections || source.templates),
    proficiencies: sanitizeProficiencies(source.proficiencies),
    progression: {
      level: normalizedNormalLevel,
      specialLevels: normalizedSpecialLevels,
      resourceRulesVersion: COMBAT_RESOURCE_RULES_VERSION,
      actionPoolChoices,
      experience: normalizeNumber(progression.experience ?? source.experience, 0, 0, 999999999),
      nextLevelExperience: normalizeOptionalNumber(progression.nextLevelExperience, 1, 999999999),
      experienceReward: normalizeOptionalNumber(progression.experienceReward, 0, 999999999),
      proficiencyBonusOverride: normalizeOptionalNumber(progression.proficiencyBonusOverride, -20, 30)
    },
    attributes: COMBAT_ATTRIBUTE_DEFINITIONS.map(definition =>
      sanitizeAttribute(sourceAttributes.get(definition.key), definition)),
    hitPoints: {
      current: normalizeOptionalNumber(hitPoints.current ?? source.currentHitPoints, 0, 9999),
      temporary: normalizeNumber(hitPoints.temporary, 0, 0, 9999),
      hitDie: [6, 8, 10, 12].includes(Number(hitPoints.hitDie)) ? Number(hitPoints.hitDie) : 8,
      averagePerLevelOverride: normalizeOptionalNumber(hitPoints.averagePerLevelOverride, 1, 999),
      maximumOverride: normalizeOptionalNumber(hitPoints.maximumOverride ?? legacyMaximumHitPoints, 1, 9999)
    },
    armorClass: {
      base: normalizeNumber(armorClass.base ?? legacyBaseDefense, 10, 0, 99),
      dexterityMode: DEXTERITY_MODES.has(armorClass.dexterityMode) ? armorClass.dexterityMode : 'full',
      dexterityCap: normalizeNumber(armorClass.dexterityCap, 2, -20, 20),
      shieldBonus: normalizeNumber(armorClass.shieldBonus, 0, -99, 99),
      magicModifier: normalizeNumber(armorClass.magicModifier, 0, -99, 99),
      otherModifier: normalizeNumber(armorClass.otherModifier, 0, -99, 99),
      override: normalizeOptionalNumber(armorClass.override, 0, 999),
      overrideMode: armorClass.overrideMode === 'base' ? 'base' : 'total'
    },
    combat: {
      movement: normalizeNumber(combat.movement, 9, 0, 999),
      initiativeBonus: normalizeNumber(combat.initiativeBonus, 0, -99, 99),
      attackBonus: normalizeNumber(combat.attackBonus ?? source.baseAttackBonus, 0, -99, 99),
      damageBonus: normalizeNumber(combat.damageBonus ?? source.baseDamageBonus, 0, -99, 99),
      passivePerceptionBonus: normalizeNumber(combat.passivePerceptionBonus, 0, -99, 99),
      canActAtZeroHitPoints: normalizeBoolean(combat.canActAtZeroHitPoints),
      mounted: normalizeBoolean(combat.mounted)
    },
    savingThrows: COMBAT_ATTRIBUTE_DEFINITIONS.map(definition =>
      sanitizeSavingThrow(sourceSaves.get(definition.key), definition)),
    skills: sanitizeList(options.ensureRequiredSkills === false
      ? (Array.isArray(source.skills) ? source.skills : [])
      : ensureRequiredSkills(Array.isArray(source.skills) ? source.skills : DEFAULT_SKILLS), sanitizeSkill),
    weapons: sanitizeWeaponsWithDefault(getLegacyWeapons(source)),
    armorItems: sanitizeList(getLegacyArmor(source), sanitizeArmor),
    resources: sanitizedResources,
    techniques: sanitizeList(source.techniques, sanitizeTechnique),
    classTraining: sanitizeClassTraining(source.classTraining),
    quirks: sanitizeList(source.quirks || source.traits, sanitizeQuirk),
    conditions: sanitizeList(source.conditions, sanitizeCondition),
    damageAffinities: sanitizeList(source.damageAffinities, normalizeDamageAffinity, 100),
    abilities: sanitizeList(source.abilities, sanitizeAbility),
    magic: {
      enabled: magicEnabled,
      casterTier: normalizedCasterTier,
      bypassResourceId: normalizedBypassResourceId,
      focusEnabled: normalizedFocusEnabled,
      focusResourceId: normalizedFocusResourceId,
      castingAttribute: getAttributeKey(magic.castingAttribute, 'intelligence'),
      spellAttackOverride: normalizeOptionalNumber(magic.spellAttackOverride, -99, 99),
      spellSaveDcOverride: normalizeOptionalNumber(magic.spellSaveDcOverride, 0, 999),
      manaResourceId: normalizedManaResourceId,
      slotResourceIds: spellSlotResourceIds,
      notes: normalizeText(magic.notes, 1600),
      spells: finalizedSpells
    },
    aura: sanitizeAura(source.aura),
    cheats: {
      enabled: normalizeBoolean(source.cheats?.enabled),
      automaticCritical: normalizeBoolean(source.cheats?.automaticCritical)
    },
    notes: normalizeText(source.notes, 6000)
  };
}

export function getAttributeModifier(attribute = {}) {
  if (attribute.modifierOverride != null) return Number(attribute.modifierOverride) || 0;
  return Math.floor(((Number(attribute.score) || 10) - 10) / 2);
}

export function getEffectiveCombatLevel(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  return normalized.progression.level + normalized.progression.specialLevels;
}

export function getProficiencyBonus(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  if (normalized.progression.proficiencyBonusOverride != null) return normalized.progression.proficiencyBonusOverride;
  return 2 + Math.floor((getEffectiveCombatLevel(normalized) - 1) / 4);
}

function getAttribute(profile, key) {
  return profile.attributes.find(attribute => attribute.key === key)
    || sanitizeAttribute({}, COMBAT_ATTRIBUTE_DEFINITIONS[0]);
}

function collectActiveMechanicalSources(profile) {
  const auraSources = [];
  if (profile.aura?.enabled && profile.aura.latentPresence?.enabled && profile.aura.latentPresence?.active) {
    auraSources.push({ active: true, mechanics: profile.aura.latentPresence.selfMechanics });
  }
  if (profile.aura?.enabled && profile.aura.activeForm?.enabled && profile.aura.activeForm?.active) {
    auraSources.push({ active: true, mechanics: profile.aura.activeForm.selfMechanics });
  }
  return [...profile.quirks, ...profile.conditions, ...profile.abilities, ...auraSources]
    .filter(entry => entry.active)
    .map(entry => entry.mechanics);
}

const NON_NUMERIC_MECHANICAL_KEYS = new Set(['attackRollMode', 'bonusDamageFormula', 'savingThrowAdvantageAttributes', 'savingThrowDisadvantageAttributes']);

function mergeMechanicalModifiers(sources = []) {
  return sources.reduce((result, source) => {
    Object.keys(sanitizeMechanicalModifiers()).forEach(key => {
      if (NON_NUMERIC_MECHANICAL_KEYS.has(key)) return;
      result[key] = (Number(result[key]) || 0) + (Number(source?.[key]) || 0);
    });
    const modes = [result.attackRollMode, source?.attackRollMode].filter(mode => mode && mode !== 'normal');
    result.attackRollMode = modes.includes('advantage') && modes.includes('disadvantage')
      ? 'normal'
      : (modes[0] || 'normal');
    result.bonusDamageFormula = [result.bonusDamageFormula, source?.bonusDamageFormula].filter(Boolean).join('+');
    result.savingThrowAdvantageAttributes = [...new Set([...(result.savingThrowAdvantageAttributes || []), ...(source?.savingThrowAdvantageAttributes || [])])];
    result.savingThrowDisadvantageAttributes = [...new Set([...(result.savingThrowDisadvantageAttributes || []), ...(source?.savingThrowDisadvantageAttributes || [])])];
    return result;
  }, sanitizeMechanicalModifiers());
}

export function getAuraOpponentMechanics(profile = {}) {
  return getAuraTargetMechanics(profile, { relation: 'enemy', ignoreRange: true });
}

export function parseAuraRadiusMeters(value) {
  const text = String(value || '').trim().toLocaleLowerCase('de').replace(',', '.');
  const match = text.match(/(\d+(?:\.\d+)?)\s*(m|meter|ft|fu(?:ß|ss))?/);
  if (!match) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount < 0) return null;
  return ['ft', 'fuß', 'fuss'].includes(match[2]) ? amount * 0.3048 : amount;
}

function auraTargetAllowsRelation(target, relation) {
  const text = String(target || '').toLocaleLowerCase('de');
  if (!text) return true;
  const mentionsEnemy = /gegner|feind/.test(text);
  const mentionsAlly = /verbünd|verbuend|gefährt|gruppe/.test(text);
  const mentionsSelf = /selbst|eigene/.test(text);
  if (relation === 'self') return mentionsSelf || (!mentionsEnemy && !mentionsAlly);
  if (relation === 'ally') return mentionsAlly || (!mentionsEnemy && !mentionsSelf);
  return mentionsEnemy || (!mentionsAlly && !mentionsSelf);
}

export function getAuraTargetMechanics(profile = {}, context = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  if (!normalized.aura.enabled) return sanitizeMechanicalModifiers();
  const relation = ['self', 'ally', 'enemy'].includes(context.relation) ? context.relation : 'enemy';
  const distance = context.distanceMeters == null || context.distanceMeters === '' ? null : Number(context.distanceMeters);
  const sources = [normalized.aura.latentPresence, normalized.aura.activeForm]
    .filter(component => component.enabled && component.active)
    .filter(component => auraTargetAllowsRelation(component.target, relation))
    .filter(component => {
      const radius = parseAuraRadiusMeters(component.radius);
      if (radius == null || context.ignoreRange === true) return true;
      return Number.isFinite(distance) && distance >= 0 && distance <= radius;
    })
    .map(component => relation === 'self'
      ? component.selfMechanics
      : (relation === 'ally' ? component.allyMechanics : component.enemyMechanics));
  return mergeMechanicalModifiers(sources);
}

function sumMechanicalModifier(profile, key) {
  return collectActiveMechanicalSources(profile)
    .reduce((total, mechanics) => total + (Number(mechanics?.[key]) || 0), 0);
}

export function getMaximumHitPoints(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  if (normalized.hitPoints.maximumOverride != null) return normalized.hitPoints.maximumOverride;
  const constitutionModifier = getAttributeModifier(getAttribute(normalized, 'constitution'));
  const level = getEffectiveCombatLevel(normalized);
  const firstLevel = Math.max(1, normalized.hitPoints.hitDie + constitutionModifier);
  const average = normalized.hitPoints.averagePerLevelOverride ?? (Math.floor(normalized.hitPoints.hitDie / 2) + 1);
  return Math.max(1, firstLevel + Math.max(0, level - 1) * Math.max(1, average + constitutionModifier)
    + sumMechanicalModifier(normalized, 'maximumHitPoints'));
}

function getAppliedDexterityModifier(modifier, mode, cap) {
  if (mode === 'none') return 0;
  if (mode === 'capped') return Math.min(modifier, cap);
  return modifier;
}

export function getArmorClass(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  if (normalized.armorClass.override != null && normalized.armorClass.overrideMode === 'total') {
    return normalized.armorClass.override;
  }
  const equipped = normalized.armorItems.filter(item => item.equipped);
  const bodyArmor = equipped
    .filter(item => item.kind === 'armor' && item.baseArmorClass != null)
    .sort((a, b) => b.baseArmorClass - a.baseArmorClass)[0] || null;
  const base = normalized.armorClass.override != null
    ? normalized.armorClass.override
    : (bodyArmor?.baseArmorClass ?? normalized.armorClass.base);
  const dexterityUnlocked = !bodyArmor?.dexterityUnlockLevel
    || getEffectiveCombatLevel(normalized) >= bodyArmor.dexterityUnlockLevel;
  const dexterityMode = dexterityUnlocked
    ? (bodyArmor?.dexterityMode ?? normalized.armorClass.dexterityMode)
    : 'none';
  const dexterityCap = bodyArmor?.dexterityCap ?? normalized.armorClass.dexterityCap;
  const dexterityModifier = getAttributeModifier(getAttribute(normalized, 'dexterity'));
  const equipmentBonus = equipped.reduce((total, item) => total + item.armorClassBonus, 0);
  return base
    + getAppliedDexterityModifier(dexterityModifier, dexterityMode, dexterityCap)
    + equipmentBonus
    + normalized.armorClass.shieldBonus
    + normalized.armorClass.magicModifier
    + normalized.armorClass.otherModifier
    + sumMechanicalModifier(normalized, 'armorClass');
}

export function getSavingThrowTotal(profile = {}, attributeKey) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const key = getAttributeKey(attributeKey);
  const save = normalized.savingThrows.find(entry => entry.attributeKey === key);
  const proficiencyMultiplier = save?.expertise ? 2 : (save?.proficient ? 1 : 0);
  return getAttributeModifier(getAttribute(normalized, key))
    + proficiencyMultiplier * getProficiencyBonus(normalized)
    + Number(save?.bonus || 0)
    + sumMechanicalModifier(normalized, 'savingThrow');
}

export function getSkillTotal(profile = {}, skillOrId = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const skill = typeof skillOrId === 'string'
    ? normalized.skills.find(entry => entry.id === skillOrId)
    : sanitizeSkill(skillOrId);
  if (!skill) return 0;
  const proficiencyMultiplier = skill.proficiency === 'expertise' ? 2 : (skill.proficiency === 'trained' ? 1 : 0);
  return getAttributeModifier(getAttribute(normalized, skill.attributeKey))
    + proficiencyMultiplier * getProficiencyBonus(normalized)
    + skill.bonus
    + sumMechanicalModifier(normalized, 'skill');
}

export function getPassivePerception(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const perception = normalized.skills.find(skill => skill.id === 'default-skill-14')
    || normalized.skills.find(skill => /wahrnehm/i.test(skill.name));
  const perceptionTotal = perception
    ? getSkillTotal(normalized, perception)
    : getSkillTotal(normalized, {
      id: 'derived-passive-perception',
      name: 'Wahrnehmung',
      attributeKey: 'wisdom',
      proficiency: 'none',
      bonus: 0
    });
  return 10 + perceptionTotal + normalized.combat.passivePerceptionBonus + sumMechanicalModifier(normalized, 'passivePerception');
}

export function resolveAttackRollMode(profile = {}, requestedMode = 'normal') {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const modes = [ROLL_MODES.has(requestedMode) ? requestedMode : 'normal']
    .concat(collectActiveMechanicalSources(normalized).map(mechanics => mechanics.attackRollMode));
  const hasAdvantage = modes.includes('advantage');
  const hasDisadvantage = modes.includes('disadvantage');
  if (hasAdvantage === hasDisadvantage) return 'normal';
  return hasAdvantage ? 'advantage' : 'disadvantage';
}

// Anders als resolveAttackRollMode ist das je Attribut unterschiedlich (z.B. Vorteil bei
// Stärke-Rettungswürfen, aber Nachteil bei Weisheit während desselben Zustands).
export function resolveSavingThrowRollMode(profile = {}, attributeKey, requestedMode = 'normal') {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const key = getAttributeKey(attributeKey);
  const sources = collectActiveMechanicalSources(normalized);
  const hasAdvantage = (ROLL_MODES.has(requestedMode) && requestedMode === 'advantage')
    || sources.some(mechanics => (mechanics.savingThrowAdvantageAttributes || []).includes(key));
  const hasDisadvantage = (ROLL_MODES.has(requestedMode) && requestedMode === 'disadvantage')
    || sources.some(mechanics => (mechanics.savingThrowDisadvantageAttributes || []).includes(key));
  if (hasAdvantage === hasDisadvantage) return 'normal';
  return hasAdvantage ? 'advantage' : 'disadvantage';
}

// Sammelt alle aktiven Bonus-Schadenswürfel-Formeln (z.B. Rage-Schaden), die zusätzlich zur
// regulären Waffen-/Technikformel gewürfelt werden, sobald ein Treffer bestätigt ist.
export function getBonusDamageFormulas(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  return collectActiveMechanicalSources(normalized)
    .map(mechanics => mechanics.bonusDamageFormula)
    .filter(Boolean);
}

export function getWeaponAttackModifier(profile = {}, weaponOrId = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const weapon = typeof weaponOrId === 'string'
    ? normalized.weapons.find(entry => entry.id === weaponOrId)
    : sanitizeWeapon(weaponOrId);
  if (!weapon) return 0;
  return getAttributeModifier(getAttribute(normalized, weapon.attackAttribute))
    + (weapon.proficient ? getProficiencyBonus(normalized) : 0)
    + weapon.attackBonus
    + normalized.combat.attackBonus
    + sumMechanicalModifier(normalized, 'attack');
}

export function getWeaponDamageModifier(profile = {}, weaponOrId = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const weapon = typeof weaponOrId === 'string'
    ? normalized.weapons.find(entry => entry.id === weaponOrId)
    : sanitizeWeapon(weaponOrId);
  if (!weapon) return 0;
  return getAttributeModifier(getAttribute(normalized, weapon.attackAttribute))
    + weapon.damageBonus
    + normalized.combat.damageBonus
    + sumMechanicalModifier(normalized, 'damage');
}

export function getSpellcastingValues(profile = {}) {
  const normalized = sanitizeCharacterCombatProfile(profile);
  const abilityModifier = getAttributeModifier(getAttribute(normalized, normalized.magic.castingAttribute));
  const proficiency = getProficiencyBonus(normalized);
  return {
    attack: normalized.magic.spellAttackOverride
      ?? abilityModifier + proficiency + sumMechanicalModifier(normalized, 'spellAttack'),
    saveDc: normalized.magic.spellSaveDcOverride
      ?? 8 + abilityModifier + proficiency + sumMechanicalModifier(normalized, 'spellSaveDc')
  };
}

export function isTechniqueCompatibleWithWeapon(technique = {}, weapon = {}) {
  const normalizedTechnique = sanitizeTechnique(technique);
  const normalizedWeapon = sanitizeWeapon(weapon);
  if (!normalizedTechnique.weaponTypes.length && !normalizedTechnique.compatibleWeaponIds.length) return true;
  if (normalizedTechnique.compatibleWeaponIds.includes(normalizedWeapon.id)) return true;
  return normalizedTechnique.weaponTypes.includes(normalizedWeapon.weaponType);
}

function getInventoryItems(character = {}) {
  return Array.isArray(character?.inventory?.items) ? character.inventory.items : [];
}

function matchesEquipmentKind(item = {}, kind) {
  const haystack = `${item.category || ''} ${item.type || ''} ${item.name || ''}`.toLowerCase();
  if (kind === 'weapon') return item.category === 'weapon' || /waffe|schwert|dolch|bogen|armbrust|speer|axt|keule|stab/.test(haystack);
  return item.category === 'armor' || /r[uü]stung|schild|panzer|harnisch|schutz/.test(haystack);
}

function readNamedAttribute(item = {}, pattern) {
  const attribute = (Array.isArray(item.attributes) ? item.attributes : [])
    .find(entry => pattern.test(String(entry?.label || '')));
  const parsed = Number(attribute?.value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getCharacterCombatInventoryOptions(character = {}, kind = 'weapon') {
  return getInventoryItems(character)
    .filter(item => matchesEquipmentKind(item, kind))
    .map((item, index) => {
      const combat = item.combatDefinition || item.combat || {};
      if (kind === 'weapon') {
        return sanitizeWeapon({
          id: `inventory-weapon-${index + 1}`,
          inventoryItemId: item.id,
          name: item.name,
          image: item.image || item.icon,
          damageFormula: combat.damageFormula,
          versatileDamageFormula: combat.versatileDamageFormula,
          weaponType: combat.weaponType,
          training: combat.training,
          attackAttribute: combat.attackAttribute,
          proficient: combat.proficient,
          attackBonus: combat.attackBonus,
          damageBonus: combat.damageBonus,
          damageType: combat.damageType,
          range: combat.range,
          rangeType: combat.rangeType,
          properties: combat.properties,
          notes: combat.notes || item.description,
          equipped: false
        }, index);
      }
      return sanitizeArmor({
        id: `inventory-armor-${index + 1}`,
        inventoryItemId: item.id,
        name: item.name,
        image: item.image || item.icon,
        kind: combat.kind,
          baseArmorClass: combat.baseArmorClass,
          armorClassBonus: combat.armorClassBonus ?? combat.defenseBonus ?? readNamedAttribute(item, /schutz|verteidigung|r[uü]stung/i),
          dexterityMode: combat.dexterityMode,
          dexterityCap: combat.dexterityCap,
          dexterityUnlockLevel: combat.dexterityUnlockLevel,
        properties: combat.properties,
        notes: combat.notes || item.description,
        equipped: false
      }, index);
    });
}

export function resolveCharacterCombatProfile(character = {}) {
  const profile = sanitizeCharacterCombatProfile(character.combatProfile, {
    ensureRequiredSkills: character.entityType !== 'creature',
    ensureSpellSlots: character.entityType !== 'creature'
  });
  const inventoryById = new Map(getInventoryItems(character)
    .map(item => [String(item?.id || ''), item])
    .filter(([id]) => id));
  profile.weapons = profile.weapons.map(weapon => {
    const item = inventoryById.get(String(weapon.inventoryItemId || ''));
    return item && !weapon.image
      ? { ...weapon, image: normalizeText(item.image || item.icon, 1000) }
      : weapon;
  });
  profile.armorItems = profile.armorItems.map(armor => {
    const item = inventoryById.get(String(armor.inventoryItemId || ''));
    return item && !armor.image
      ? { ...armor, image: normalizeText(item.image || item.icon, 1000) }
      : armor;
  });
  const activeWeapon = profile.weapons.find(weapon => weapon.equipped) || profile.weapons[0] || sanitizeWeapon({});
  const equippedArmor = profile.armorItems.filter(item => item.equipped);
  const primaryArmor = equippedArmor[0] || profile.armorItems[0] || sanitizeArmor({});
  const maximumHitPoints = getMaximumHitPoints(profile);
  const totalDefense = getArmorClass(profile);
  const spellcasting = getSpellcastingValues(profile);
  const dexterityModifier = getAttributeModifier(getAttribute(profile, 'dexterity'));
  return {
    ...profile,
    effectiveLevel: getEffectiveCombatLevel(profile),
    proficiencyBonus: getProficiencyBonus(profile),
    maximumHitPoints,
    currentHitPoints: profile.hitPoints.current ?? maximumHitPoints,
    temporaryHitPoints: profile.hitPoints.temporary,
    totalDefense,
    armorClassTotal: totalDefense,
    initiative: dexterityModifier + profile.combat.initiativeBonus + sumMechanicalModifier(profile, 'initiative'),
    movement: Math.max(0, profile.combat.movement + sumMechanicalModifier(profile, 'movement')),
    passivePerception: getPassivePerception(profile),
    weapon: activeWeapon,
    armor: primaryArmor,
    attackModifier: getWeaponAttackModifier(profile, activeWeapon),
    damageModifier: getWeaponDamageModifier(profile, activeWeapon),
    spellAttackModifier: spellcasting.attack,
    spellSaveDc: spellcasting.saveDc
  };
}

export const combatProfileModelInternals = Object.freeze({
  normalizeNumber,
  normalizeOptionalNumber,
  matchesEquipmentKind,
  readNamedAttribute,
  getAppliedDexterityModifier,
  sumMechanicalModifier,
  sanitizeMechanicalModifiers,
  sanitizeTechnique,
  sanitizeAura
});
