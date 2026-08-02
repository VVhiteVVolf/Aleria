export const COMBAT_PROFILE_SCHEMA_VERSION = 3;

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
const DEFAULT_SKILLS = Object.freeze([
  ['Athletik', 'strength'], ['Akrobatik', 'dexterity'], ['Fingerfertigkeit', 'dexterity'],
  ['Heimlichkeit', 'dexterity'], ['Arkane Kunde', 'intelligence'], ['Geschichte', 'intelligence'],
  ['Nachforschungen', 'intelligence'], ['Naturkunde', 'intelligence'], ['Religion', 'intelligence'],
  ['Heilkunde', 'wisdom'], ['Mit Tieren umgehen', 'wisdom'], ['Motiv erkennen', 'wisdom'],
  ['Überleben', 'wisdom'], ['Wahrnehmung', 'wisdom'], ['Auftreten', 'charisma'],
  ['Einschüchtern', 'charisma'], ['Täuschen', 'charisma'], ['Überreden', 'charisma']
].map(([name, attributeKey], index) => ({ id: `default-skill-${index + 1}`, name, attributeKey })));
const DEFAULT_RESOURCES = Object.freeze([
  { id: 'inspiration', name: 'Inspiration', current: 0, maximum: 1, recovery: 'manual' },
  { id: 'mana-focus', name: 'Mana / Fokus', current: 0, maximum: 0, recovery: 'long-rest' },
  { id: 'fate-points', name: 'Schicksalspunkte', current: 0, maximum: 0, recovery: 'manual' }
]);

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

function sanitizeWeapon(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    id: normalizeId(source.id, `weapon-${index + 1}`),
    inventoryItemId: normalizeText(source.inventoryItemId, 120),
    name: normalizeText(source.name, 120),
    damageFormula: normalizeCombatDamageFormula(source.damageFormula),
    damageType: normalizeText(source.damageType || 'physisch', 80),
    attackAttribute: getAttributeKey(source.attackAttribute, source.rangeType === 'ranged' ? 'dexterity' : 'strength'),
    proficient: normalizeBoolean(source.proficient, true),
    attackBonus: normalizeNumber(source.attackBonus, 0, -99, 99),
    damageBonus: normalizeNumber(source.damageBonus, 0, -99, 99),
    range: normalizeText(source.range || (source.rangeType === 'ranged' ? 'Fernkampf' : 'Nahkampf'), 80),
    properties: normalizeText(source.properties, 500),
    notes: normalizeText(source.notes, 800),
    equipped: normalizeBoolean(source.equipped, index === 0)
  };
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
  return {
    id: normalizeId(source.id, `resource-${index + 1}`),
    name: normalizeText(source.name, 100),
    current: normalizeNumber(source.current, 0, -9999, 9999),
    maximum: normalizeNumber(source.maximum, 0, 0, 9999),
    recovery: RECOVERY_TYPES.has(recovery) ? recovery : 'manual',
    notes: normalizeText(source.notes, 500)
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
    active: normalizeBoolean(source.active, true),
    mechanics: sanitizeMechanicalModifiers(source.mechanics)
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
    mechanics: sanitizeMechanicalModifiers(source.mechanics)
  };
}

function sanitizeAbility(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  const recovery = normalizeText(source.recovery, 20);
  return {
    id: normalizeId(source.id, `ability-${index + 1}`),
    name: normalizeText(source.name, 120),
    description: normalizeText(source.description, 1600),
    usesCurrent: normalizeNumber(source.usesCurrent, 0, 0, 999),
    usesMaximum: normalizeNumber(source.usesMaximum, 0, 0, 999),
    recovery: RECOVERY_TYPES.has(recovery) ? recovery : 'none',
    rollFormula: normalizeCombatDamageFormula(source.rollFormula),
    active: normalizeBoolean(source.active, true),
    mechanics: sanitizeMechanicalModifiers(source.mechanics)
  };
}

function sanitizeSpell(value = {}, index = 0) {
  const source = value && typeof value === 'object' ? value : {};
  return {
    id: normalizeId(source.id, `spell-${index + 1}`),
    name: normalizeText(source.name, 120),
    level: normalizeNumber(source.level, 0, 0, 20),
    manaCost: normalizeNumber(source.manaCost, 0, 0, 999),
    rollFormula: normalizeCombatDamageFormula(source.rollFormula),
    description: normalizeText(source.description, 1600),
    prepared: normalizeBoolean(source.prepared, true)
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

export function sanitizeCharacterCombatProfile(value = {}) {
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
      passivePerceptionBonus: normalizeNumber(combat.passivePerceptionBonus, 0, -99, 99)
    },
    savingThrows: COMBAT_ATTRIBUTE_DEFINITIONS.map(definition =>
      sanitizeSavingThrow(sourceSaves.get(definition.key), definition)),
    skills: sanitizeList(Array.isArray(source.skills) ? source.skills : DEFAULT_SKILLS, sanitizeSkill),
    weapons: sanitizeList(getLegacyWeapons(source), sanitizeWeapon),
    armorItems: sanitizeList(getLegacyArmor(source), sanitizeArmor),
    resources: sanitizeList(Array.isArray(source.resources) ? source.resources : DEFAULT_RESOURCES, sanitizeResource),
    quirks: sanitizeList(source.quirks || source.traits, sanitizeQuirk),
    conditions: sanitizeList(source.conditions, sanitizeCondition),
    abilities: sanitizeList(source.abilities, sanitizeAbility),
    magic: {
      enabled: normalizeBoolean(magic.enabled),
      castingAttribute: getAttributeKey(magic.castingAttribute, 'intelligence'),
      spellAttackOverride: normalizeOptionalNumber(magic.spellAttackOverride, -99, 99),
      spellSaveDcOverride: normalizeOptionalNumber(magic.spellSaveDcOverride, 0, 999),
      manaResourceId: normalizeText(magic.manaResourceId, 120),
      notes: normalizeText(magic.notes, 1600),
      spells: sanitizeList(magic.spells, sanitizeSpell)
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
  return [...profile.quirks, ...profile.conditions, ...profile.abilities]
    .filter(entry => entry.active)
    .map(entry => entry.mechanics);
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
  return firstLevel + Math.max(0, level - 1) * Math.max(1, average + constitutionModifier);
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
  return 10 + perceptionTotal + normalized.combat.passivePerceptionBonus;
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
  const profile = sanitizeCharacterCombatProfile(character.combatProfile);
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
    currentHitPoints: profile.hitPoints.current,
    temporaryHitPoints: profile.hitPoints.temporary,
    totalDefense,
    armorClassTotal: totalDefense,
    initiative: dexterityModifier + profile.combat.initiativeBonus + sumMechanicalModifier(profile, 'initiative'),
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
  sanitizeMechanicalModifiers
});
