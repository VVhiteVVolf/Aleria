// Shared spell-level and spell-slot rules for profiles, scene combat and server validation.

export const COMBAT_SPELL_LEVEL_MINIMUM = 0;
export const COMBAT_SPELL_LEVEL_MAXIMUM = 10;

const ROMAN_SPELL_LEVELS = Object.freeze(['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X']);

export const COMBAT_SPELL_SLOT_DEFINITIONS = Object.freeze(
  Array.from({ length: COMBAT_SPELL_LEVEL_MAXIMUM }, (_entry, index) => {
    const level = index + 1;
    return Object.freeze({
      id: `spell-slot-${level}`,
      name: `Zauberplatz ${ROMAN_SPELL_LEVELS[level]}`,
      spellLevel: level,
      current: 0,
      maximum: 0,
      recovery: 'long-rest',
      scope: 'persistent',
      category: 'spell-slot',
      notes: `Wird von Zaubern des ${ROMAN_SPELL_LEVELS[level]}. Grades verbraucht und durch eine lange Rast aufgef\u00fcllt.`
    });
  })
);

function boundedSpellLevel(value, fallback = 0) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.max(COMBAT_SPELL_LEVEL_MINIMUM, Math.min(COMBAT_SPELL_LEVEL_MAXIMUM, Math.trunc(number)));
}

function romanToSpellLevel(value = '') {
  const normalized = String(value || '').trim().toUpperCase();
  const level = ROMAN_SPELL_LEVELS.indexOf(normalized);
  return level > 0 ? level : null;
}

export function getSpellLevelLabel(value = 0) {
  const level = boundedSpellLevel(value);
  return level === 0 ? 'Zaubertrick' : `Grad ${ROMAN_SPELL_LEVELS[level]}`;
}

export function getSpellSlotResourceId(value = 0) {
  const level = boundedSpellLevel(value);
  return level > 0 ? `spell-slot-${level}` : '';
}

export function getSpellSlotLevel(resource = {}) {
  const explicit = Number(resource?.spellLevel);
  if (Number.isFinite(explicit) && explicit >= 1 && explicit <= COMBAT_SPELL_LEVEL_MAXIMUM) return Math.trunc(explicit);

  const text = `${resource?.id || ''} ${resource?.name || ''}`;
  const numeric = text.match(/(?:spell[-_ ]?slot|zauber(?:platz|slot)|slot|grad)[^0-9]*(10|[1-9])\b/i);
  if (numeric) return Number(numeric[1]);

  const roman = text.toUpperCase().match(/\b(X|IX|VIII|VII|VI|V|IV|III|II|I)\b/);
  return roman ? romanToSpellLevel(roman[1]) : null;
}

export function isSpellSlotResource(resource = {}, configuredIds = []) {
  const resourceId = String(resource?.id || '');
  return resourceId === '__missing-spell-slot__'
    || (Array.isArray(configuredIds) && configuredIds.map(String).includes(resourceId))
    || String(resource?.category || '') === 'spell-slot'
    || getSpellSlotLevel(resource) != null;
}

export function findSpellSlotResourceId(resources = [], level = 0, fallbackToCanonical = true) {
  const normalizedLevel = boundedSpellLevel(level);
  if (normalizedLevel === 0) return '';
  const resource = (Array.isArray(resources) ? resources : [])
    .find(candidate => getSpellSlotLevel(candidate) === normalizedLevel);
  return resource?.id || (fallbackToCanonical ? getSpellSlotResourceId(normalizedLevel) : '');
}

export function ensureSpellSlotResources(resources = [], { enabled = false, spells = [], slotResourceIds = [], always = false } = {}) {
  const result = (Array.isArray(resources) ? resources : []).map(resource => ({ ...resource }));
  const configured = always
    || enabled
    || (Array.isArray(spells) && spells.length > 0)
    || (Array.isArray(slotResourceIds) && slotResourceIds.length > 0)
    || result.some(resource => isSpellSlotResource(resource, slotResourceIds));
  if (!configured) return result;

  COMBAT_SPELL_SLOT_DEFINITIONS.forEach(definition => {
    const existing = result.find(resource => getSpellSlotLevel(resource) === definition.spellLevel);
    if (existing) {
      existing.name ||= definition.name;
      existing.spellLevel = definition.spellLevel;
      existing.recovery = definition.recovery;
      existing.scope = definition.scope;
      existing.category = definition.category;
      existing.notes ||= definition.notes;
      return;
    }
    result.push({ ...definition });
  });
  return result;
}

export function getOrderedSpellSlotResources(resources = [], configuredIds = []) {
  return (Array.isArray(resources) ? resources : [])
    .filter(resource => isSpellSlotResource(resource, configuredIds))
    .map(resource => ({ ...resource }))
    .sort((first, second) => (getSpellSlotLevel(first) ?? 999) - (getSpellSlotLevel(second) ?? 999));
}

export const combatSpellSlotInternals = Object.freeze({
  ROMAN_SPELL_LEVELS,
  boundedSpellLevel,
  romanToSpellLevel
});
