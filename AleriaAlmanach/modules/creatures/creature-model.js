import {
  COMBAT_ATTRIBUTE_DEFINITIONS,
  sanitizeCharacterCombatProfile
} from '../combat/combat-profile-model.js';

export const CREATURE_SCHEMA_VERSION = 3;
export const CREATURE_EXPORT_TYPE = 'aleria-creature';
export const CREATURE_ARCHIVE_EXPORT_TYPE = 'aleria-creature-archive';
export const MAX_CREATURE_AVATARS = 10;

const ROMAN_DIGITS = Object.freeze([
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']
]);

function normalizeText(value, maximumLength = 240) {
  return String(value || '').trim().slice(0, maximumLength);
}

function normalizeNumber(value, fallback = 0, minimum = -999, maximum = 9999) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(minimum, Math.min(maximum, Math.trunc(parsed)));
}

function normalizeId(value, fallback) {
  return normalizeText(value, 120) || fallback;
}

function sanitizeLootItem(item = {}, index = 0) {
  return {
    id: normalizeId(item.id, `loot-${index + 1}`),
    name: normalizeText(item.name, 140),
    quantity: normalizeNumber(item.quantity, 1, 0, 9999),
    chance: normalizeNumber(item.chance, 100, 0, 100),
    notes: normalizeText(item.notes, 800)
  };
}

function sanitizeCreatureAvatar(avatar = {}, index = 0) {
  const source = avatar && typeof avatar === 'object' ? avatar : {};
  return {
    id: normalizeId(source.id, `avatar-${index + 1}`),
    img: normalizeText(source.img || source.url || source.image, 4000),
    label: normalizeText(source.label || source.name, 80)
  };
}

function createCreatureCombatDefaults() {
  return {
    progression: { level: 1, specialLevels: 0 },
    attributes: COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => ({ ...attribute, score: 10 })),
    hitPoints: { current: 10, maximumOverride: 10, temporary: 0, hitDie: 8 },
    armorClass: { override: 10 },
    skills: [],
    weapons: [],
    armorItems: [],
    resources: [{ id: 'mana-focus', name: 'Mana / Fokus', current: 0, maximum: 0, recovery: 'long-rest', scope: 'persistent', category: 'magic' }],
    techniques: [],
    quirks: [],
    conditions: [],
    abilities: []
  };
}

function applyCreatureLevel(profile, level) {
  const effectiveLevel = normalizeNumber(level, 1, 1, 30);
  profile.progression.level = Math.min(20, effectiveLevel);
  profile.progression.specialLevels = Math.max(0, effectiveLevel - 20);
  return profile;
}

export function createCreatureDraft(overrides = {}) {
  return sanitizeCreature({
    name: 'Neue Kreatur',
    type: 'Kreatur',
    species: '',
    habitat: '',
    challengeRating: 1,
    size: 'Mittel',
    level: 1,
    portrait: '',
    portraitCaption: '',
    avatars: [],
    combatProfile: createCreatureCombatDefaults(),
    loot: { currency: '', notes: '', items: [] },
    notes: '',
    ...overrides
  });
}

export function sanitizeCreature(value = {}) {
  const source = value && typeof value === 'object' ? value : {};
  const level = normalizeNumber(source.level, 1, 1, 30);
  const combatSource = source.combatProfile && typeof source.combatProfile === 'object'
    ? source.combatProfile
    : createCreatureCombatDefaults();
  const combatProfile = applyCreatureLevel(sanitizeCharacterCombatProfile({
    ...combatSource,
    skills: Array.isArray(combatSource.skills) ? combatSource.skills : [],
    resources: Array.isArray(combatSource.resources) ? combatSource.resources : [],
    notes: source.notes || combatSource.notes,
    identity: {
      ancestry: source.species || combatSource.identity?.ancestry,
      archetype: source.type || combatSource.identity?.archetype,
      background: source.habitat || combatSource.identity?.background
    }
  }, { ensureRequiredSkills: false }), level);
  const loot = source.loot && typeof source.loot === 'object' ? source.loot : {};
  const result = {
    schemaVersion: CREATURE_SCHEMA_VERSION,
    entityType: 'creature',
    name: normalizeText(source.name || 'Unbenannte Kreatur', 140),
    type: normalizeText(source.type || 'Kreatur', 100),
    species: normalizeText(source.species, 120),
    habitat: normalizeText(source.habitat, 160),
    challengeRating: normalizeNumber(source.challengeRating, 1, 0, 30),
    size: normalizeText(source.size || 'Mittel', 60),
    level,
    portrait: normalizeText(source.portrait, 4000),
    portraitCaption: normalizeText(source.portraitCaption, 500),
    avatars: (Array.isArray(source.avatars) ? source.avatars : (Array.isArray(source.emotes) ? source.emotes : []))
      .slice(0, MAX_CREATURE_AVATARS)
      .map(sanitizeCreatureAvatar)
      .filter(avatar => avatar.img),
    templateId: normalizeText(source.templateId, 120),
    instanceOrdinal: normalizeNumber(source.instanceOrdinal, 0, 0, 3999),
    combatProfile,
    loot: {
      currency: normalizeText(loot.currency, 200),
      notes: normalizeText(loot.notes, 1600),
      items: (Array.isArray(loot.items) ? loot.items : []).slice(0, 80).map(sanitizeLootItem)
    },
    notes: normalizeText(source.notes, 6000)
  };
  if (source.id) result.id = normalizeText(source.id, 120);
  if (source.createdAt != null) result.createdAt = source.createdAt;
  if (source.updatedAt != null) result.updatedAt = source.updatedAt;
  return result;
}

export function makeCreatureSceneActor(value = {}) {
  const creature = sanitizeCreature(value);
  return {
    ...creature,
    entityType: 'creature',
    title: [creature.type, creature.species].filter(Boolean).join(' · '),
    aliases: [],
    emotes: creature.avatars.map(avatar => ({ img: avatar.img, label: avatar.label })),
    playerOwner: '',
    _builtin: !!value._builtin
  };
}

export function toRomanNumeral(value) {
  let remaining = normalizeNumber(value, 1, 1, 3999);
  let result = '';
  ROMAN_DIGITS.forEach(([amount, digit]) => {
    while (remaining >= amount) {
      result += digit;
      remaining -= amount;
    }
  });
  return result;
}

export function getCreatureBaseName(name) {
  return normalizeText(name || 'Kreatur', 140)
    .replace(/\s+(?:[IVXLCDM]+|\d+)\.?\s*$/i, '')
    .trim() || 'Kreatur';
}

export function createCreatureDuplicate(source, allCreatures = []) {
  const original = sanitizeCreature(source);
  const templateId = normalizeText(original.templateId || original.id, 120);
  const baseName = getCreatureBaseName(original.name);
  const related = (Array.isArray(allCreatures) ? allCreatures : [])
    .map(sanitizeCreature)
    .filter(item => {
      if (templateId && (item.id === templateId || item.templateId === templateId)) return true;
      return getCreatureBaseName(item.name).toLocaleLowerCase('de') === baseName.toLocaleLowerCase('de');
    });
  const used = related.map(item => item.instanceOrdinal).filter(value => value > 0);
  const ordinal = Math.max(0, ...used) + 1;
  const duplicate = sanitizeCreature({
    ...original,
    id: '',
    name: `${baseName} ${toRomanNumeral(ordinal)}.`,
    templateId,
    instanceOrdinal: ordinal,
    createdAt: undefined,
    updatedAt: undefined
  });
  delete duplicate.id;
  delete duplicate.createdAt;
  delete duplicate.updatedAt;
  return duplicate;
}

export function makeCreatureExportPayload(creature) {
  return {
    type: CREATURE_EXPORT_TYPE,
    version: CREATURE_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    creature: sanitizeCreature(creature)
  };
}

export function normalizeCreatureImportPayload(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Die Kreaturendatei ist ungültig.');
  if (payload.type === CREATURE_EXPORT_TYPE) return [sanitizeCreature(payload.creature)];
  if (payload.type === CREATURE_ARCHIVE_EXPORT_TYPE) {
    return (Array.isArray(payload.creatures) ? payload.creatures : []).map(sanitizeCreature);
  }
  if (payload.type === 'aleria-almanach-backup') {
    return (Array.isArray(payload.creatures) ? payload.creatures : []).map(sanitizeCreature);
  }
  if (Array.isArray(payload)) return payload.map(sanitizeCreature);
  if (Array.isArray(payload.creatures)) return payload.creatures.map(sanitizeCreature);
  return [sanitizeCreature(payload)];
}
