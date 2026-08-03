import {
  ensureCombatActionResources,
  getDefaultActivationCosts,
  normalizeCombatResourceCosts
} from './combat-action-economy.js?v=20260803-economy-audit-v1';
import {
  ensureSpellSlotResources,
  findSpellSlotResourceId,
  getOrderedSpellSlotResources,
  getSpellSlotLevel
} from './combat-spell-slots.js?v=20260803-economy-audit-v1';
import { sanitizeCombatTriggerRules } from './combat-trigger-rules.js?v=20260803-rule-integrity-v1';

export const COMBAT_PROFILE_SCHEMA_VERSION = 6;

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
  { id: 'mana-focus', name: 'Mana / Fokus', current: 0, maximum: 0, recovery: 'day', scope: 'persistent', category: 'magic' },
  { id: 'celestial-points', name: 'Celestiale Punkte', current: 0, maximum: 0, recovery: 'day', scope: 'persistent', category: 'celestial' },
  { id: 'infernal-points', name: 'Infernale Punkte', current: 0, maximum: 0, recovery: 'day', scope: 'persistent', category: 'infernal' }
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
    passivePerception: normalizeNumber(source.passivePerception, 0, -99, 99),
    attackRollMode: ROLL_MODES.has(rollMode) ? rollMode : 'normal'
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
  if (/langschwert|kurzschwert|schwert|säbel|degen|klinge/.test(text)) return 'sword';
  if (/dolch|messer/.test(text)) return 'dagger';
  if (/axt|beil/.test(text)) return 'axe';
  if (/hammer|keule|morgenstern|streitkolben/.test(text)) return 'mace';
  if (/speer|lanze/.test(text)) return 'spear';
  if (/hellebarde|glefe|stangenwaffe/.test(text)) return 'polearm';
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
    weaponType: WEAPON_TYPES.has(weaponType) ? weaponType : (source.rangeType === 'ranged' ? 'bow' : 'unarmed'),
    training: WEAPON_TRAINING.has(training) ? training : 'simple',
    damageFormula: normalizeCombatDamageFormula(source.damageFormula),
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
    kind: ['armor', 'shield', 'ward'].includes(kind) ? kind : 'armor',
    baseArmorClass: normalizeOptionalNumber(source.baseArmorClass, 0, 99),
    armorClassBonus: normalizeNumber(source.armorClassBonus ?? source.defenseBonus, 0, -99, 99),
    dexterityMode: DEXTERITY_MODES.has(dexterityMode) ? dexterityMode : 'full',
    dexterityCap: normalizeNumber(source.dexterityCap, 2, -20, 20),
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
  DEFAULT_RESOURCES.filter(definition => definition.id !== 'inspiration').forEach(definition => {
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

function sanitizeAbility(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const recovery = normalizeText(source.recovery, 20);
  const activationType = normalizeText(source.activationType, 30);
  const delivery = normalizeText(source.delivery, 30);
  return {
    id: normalizeId(source.id, `ability-${index + 1}`),
    name: normalizeText(source.name, 120),
    description: normalizeText(source.description, 1600),
    usesCurrent: normalizeNumber(source.usesCurrent, 0, 0, 999),
    usesMaximum: normalizeNumber(source.usesMaximum, 0, 0, 999),
    recovery: RECOVERY_TYPES.has(recovery) ? recovery : 'none',
    rollFormula: normalizeCombatDamageFormula(source.rollFormula),
    damageType: normalizeText(source.damageType || 'physisch', 80),
    activationType: ACTIVATION_TYPES.has(activationType) ? activationType : 'action',
    delivery: ABILITY_DELIVERIES.has(delivery) ? delivery : 'ability',
    combatUsable: normalizeBoolean(source.combatUsable),
    target: normalizeText(source.target, 160),
    range: normalizeText(source.range, 160),
    duration: normalizeText(source.duration, 160),
    requirements: normalizeText(source.requirements, 1000),
    tags: normalizeText(source.tags, 500),
    aiInstructions: normalizeText(source.aiInstructions, 1600),
    costs: normalizeCombatResourceCosts(source.costs?.length ? source.costs : getDefaultActivationCosts(activationType || 'action')),
    auraBypass: {
      allowed: normalizeBoolean(source.auraBypass?.allowed, true),
      resourceId: normalizeText(source.auraBypass?.resourceId, 120),
      cost: normalizeNumber(source.auraBypass?.cost, 1, 1, 999)
    },
    active: normalizeBoolean(source.active, true),
    mechanics: sanitizeMechanicalModifiers(source.mechanics),
    triggerRules: sanitizeCombatTriggerRules(source.triggerRules || (source.triggerRule ? [source.triggerRule] : []))
  };
}

function sanitizeSpell(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const activationType = normalizeText(source.activationType, 30);
  const resolutionType = normalizeText(source.resolutionType, 30);
  const inferredLegacyLevel = getSpellSlotLevel({ id: source.slotResourceId, name: source.slotResourceId })
    || (Number(source.manaCost) > 0 || Number(source.slotCost) > 0 ? 1 : 0);
  const level = normalizeNumber(source.level, inferredLegacyLevel, 0, 10);
  const cantrip = level === 0;
  return {
    id: normalizeId(source.id, `spell-${index + 1}`),
    name: normalizeText(source.name, 120),
    level,
    manaCost: cantrip ? 0 : normalizeNumber(source.manaCost, 0, 0, 999),
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
    costs: normalizeCombatResourceCosts(source.costs?.length ? source.costs : getDefaultActivationCosts(activationType || 'action')),
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

function sanitizeTechnique(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const activationType = normalizeText(source.activationType, 30);
  const rollMode = normalizeText(source.rollMode, 20);
  const weaponTypes = (Array.isArray(source.weaponTypes) ? source.weaponTypes : String(source.weaponTypes || '').split(','))
    .map(item => normalizeText(item, 30))
    .filter(item => WEAPON_TYPES.has(item));
  return {
    id: normalizeId(source.id, `technique-${index + 1}`),
    name: normalizeText(source.name, 140),
    category: ['technique', 'form', 'reaction', 'bonus', 'special'].includes(normalizeText(source.category, 30))
      ? normalizeText(source.category, 30)
      : 'technique',
    description: normalizeText(source.description, 2000),
    effect: normalizeText(source.effect, 1600),
    activationType: ACTIVATION_TYPES.has(activationType) ? activationType : 'action',
    weaponTypes: [...new Set(weaponTypes)].slice(0, 20),
    compatibleWeaponIds: sanitizeList(source.compatibleWeaponIds, item => normalizeText(item, 120), 40).filter(Boolean),
    damageFormula: normalizeCombatDamageFormula(source.damageFormula),
    damageType: normalizeText(source.damageType, 80),
    attackBonus: normalizeNumber(source.attackBonus, 0, -99, 99),
    damageBonus: normalizeNumber(source.damageBonus, 0, -99, 99),
    rollMode: ROLL_MODES.has(rollMode) ? rollMode : 'normal',
    range: normalizeText(source.range, 160),
    target: normalizeText(source.target, 160),
    duration: normalizeText(source.duration, 160),
    requirements: normalizeText(source.requirements, 1200),
    tags: normalizeText(source.tags, 500),
    aiInstructions: normalizeText(source.aiInstructions, 1600),
    costs: normalizeCombatResourceCosts(source.costs?.length ? source.costs : getDefaultActivationCosts(activationType || 'action')),
    auraBypass: {
      allowed: normalizeBoolean(source.auraBypass?.allowed, true),
      resourceId: normalizeText(source.auraBypass?.resourceId, 120),
      cost: normalizeNumber(source.auraBypass?.cost, 1, 1, 999)
    },
    active: normalizeBoolean(source.active, true),
    mechanics: sanitizeMechanicalModifiers(source.mechanics),
    triggerRules: sanitizeCombatTriggerRules(source.triggerRules || (source.triggerRule ? [source.triggerRule] : []))
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
  const source = value && typeof value === 'object' ? value : {};
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
  const sanitizedSpells = sanitizeList(magic.spells, sanitizeSpell);
  const configuredSlotResourceIds = sanitizeList(magic.slotResourceIds, item => normalizeText(item, 120), 20).filter(Boolean);
  const resourceSources = ensureSpellSlotResources(
    ensureCombatActionResources(ensureDefaultCoreResources(Array.isArray(source.resources) ? source.resources : DEFAULT_RESOURCES)),
    { enabled: magicEnabled, spells: sanitizedSpells, slotResourceIds: configuredSlotResourceIds }
  );
  const sanitizedResources = sanitizeList(resourceSources, sanitizeResource, 100);
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
    identity: {
      ancestry: normalizeText(source.identity?.ancestry || source.ancestry, 100),
      archetype: normalizeText(source.identity?.archetype || source.archetype, 120),
      background: normalizeText(source.identity?.background || source.background, 120)
    },
    progression: {
      level: normalizeNumber(progression.level ?? source.level, 1, 1, 20),
      specialLevels: normalizeNumber(progression.specialLevels ?? source.specialLevels, 0, 0, 10),
      experience: normalizeNumber(progression.experience ?? source.experience, 0, 0, 999999999),
      nextLevelExperience: normalizeOptionalNumber(progression.nextLevelExperience, 1, 999999999),
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
      override: normalizeOptionalNumber(armorClass.override, 0, 999)
    },
    combat: {
      movement: normalizeNumber(combat.movement, 9, 0, 999),
      initiativeBonus: normalizeNumber(combat.initiativeBonus, 0, -99, 99),
      attackBonus: normalizeNumber(combat.attackBonus ?? source.baseAttackBonus, 0, -99, 99),
      damageBonus: normalizeNumber(combat.damageBonus ?? source.baseDamageBonus, 0, -99, 99),
      passivePerceptionBonus: normalizeNumber(combat.passivePerceptionBonus, 0, -99, 99),
      canActAtZeroHitPoints: normalizeBoolean(combat.canActAtZeroHitPoints)
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
    quirks: sanitizeList(source.quirks || source.traits, sanitizeQuirk),
    conditions: sanitizeList(source.conditions, sanitizeCondition),
    abilities: sanitizeList(source.abilities, sanitizeAbility),
    magic: {
      enabled: magicEnabled,
      castingAttribute: getAttributeKey(magic.castingAttribute, 'intelligence'),
      spellAttackOverride: normalizeOptionalNumber(magic.spellAttackOverride, -99, 99),
      spellSaveDcOverride: normalizeOptionalNumber(magic.spellSaveDcOverride, 0, 999),
      manaResourceId: normalizeText(magic.manaResourceId, 120),
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

function mergeMechanicalModifiers(sources = []) {
  return sources.reduce((result, source) => {
    Object.keys(sanitizeMechanicalModifiers()).forEach(key => {
      if (key === 'attackRollMode') return;
      result[key] = (Number(result[key]) || 0) + (Number(source?.[key]) || 0);
    });
    const modes = [result.attackRollMode, source?.attackRollMode].filter(mode => mode && mode !== 'normal');
    result.attackRollMode = modes.includes('advantage') && modes.includes('disadvantage')
      ? 'normal'
      : (modes[0] || 'normal');
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
  if (normalized.armorClass.override != null) return normalized.armorClass.override;
  const equipped = normalized.armorItems.filter(item => item.equipped);
  const bodyArmor = equipped
    .filter(item => item.kind === 'armor' && item.baseArmorClass != null)
    .sort((a, b) => b.baseArmorClass - a.baseArmorClass)[0] || null;
  const base = bodyArmor?.baseArmorClass ?? normalized.armorClass.base;
  const dexterityMode = bodyArmor?.dexterityMode ?? normalized.armorClass.dexterityMode;
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
          damageFormula: combat.damageFormula,
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
        kind: combat.kind,
        baseArmorClass: combat.baseArmorClass,
        armorClassBonus: combat.armorClassBonus ?? combat.defenseBonus ?? readNamedAttribute(item, /schutz|verteidigung|r[uü]stung/i),
        dexterityMode: combat.dexterityMode,
        dexterityCap: combat.dexterityCap,
        properties: combat.properties,
        notes: combat.notes || item.description,
        equipped: false
      }, index);
    });
}

export function resolveCharacterCombatProfile(character = {}) {
  const profile = sanitizeCharacterCombatProfile(character.combatProfile, { ensureRequiredSkills: character.entityType !== 'creature' });
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
