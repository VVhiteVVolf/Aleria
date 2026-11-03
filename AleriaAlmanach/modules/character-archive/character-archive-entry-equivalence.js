import { normalizeCombatAbility, normalizeCombatTechnique, normalizeCombatTrait } from '../combat/combat-profile-model.js';
import { getArchiveAbilityIconSource, getCharacterAbilityIconSource } from './character-archive-ability-icons.js';

// Equivalence is a read-model decision, never a persistence/delete identity.
// Only known bookkeeping fields are omitted. Unknown rule fields stay intact.
const BOOKKEEPING_FIELDS = new Set([
  'id', 'key', 'kind', 'name', 'label', 'description', 'schemaVersion',
  'catalogAbilityId', 'sourceAbilityId', 'catalogTechniqueId', 'developmentTraitId',
  'catalogReference', 'catalogOrigin', 'explicitVariant', 'userAuthored',
  'createdAt', 'updatedAt', 'archivedAt', 'lastUsedAt', 'lastActivatedAt',
  'sourceCharacter', 'sourceCharacterId', 'sourceClassId', 'sourceRecord',
  'sources', 'sourceRefs', 'provenance', 'builtin', 'archivedFromProfile',
  'icon', 'image', 'iconOverride', 'iconAssignmentVersion',
  'ownerCharacterId', 'ownerCharacterName', 'characterId', 'characterName',
  'grantedLevel', 'active', 'live', 'equipped', 'prepared', 'usesCurrent', 'usesUsed',
  'currentUses', 'remainingUses', 'recoveryDayKey', 'lastRecoveryDayKey'
]);
const LIVE_STATE_FIELDS = new Set([
  'active', 'live', 'equipped', 'prepared', 'usesCurrent', 'usesUsed',
  'currentUses', 'remainingUses', 'recoveryDayKey', 'lastRecoveryDayKey',
  'lastUsedAt', 'lastActivatedAt', 'updatedAt'
]);
const RULE_COLLECTIONS_WITH_INSTANCE_IDS = new Set(['costs', 'resourceCosts', 'activationCosts', 'effects', 'triggerRules']);
const COST_COLLECTIONS = new Set(['costs', 'resourceCosts', 'activationCosts']);
const text = value => String(value ?? '').normalize('NFKC').replace(/\s+/g, ' ').trim();
const nameKey = value => text(value).toLocaleLowerCase('de');
const dataOf = entry => entry.data && typeof entry.data === 'object' ? entry.data : entry;

function isListItem(path, collections) {
  return path.length >= 2 && typeof path.at(-1) === 'number' && collections.has(path.at(-2));
}

function omitField(key, path) {
  if (!path.length) return BOOKKEEPING_FIELDS.has(key);
  if (path.length === 1 && ['cenyrTraining', 'cultureTraining'].includes(path[0]) && ['selectedAtLevel', 'sourceStatus'].includes(key)) return true;
  if (key === 'id' && isListItem(path, RULE_COLLECTIONS_WITH_INSTANCE_IDS)) return true;
  if (key === 'name' && isListItem(path, COST_COLLECTIONS)) return true;
  if (path.length === 1 && ['state', 'runtime'].includes(path[0])) return LIVE_STATE_FIELDS.has(key);
  if (path.length === 1 && path[0] === 'uses') return ['current', 'used', 'remaining', 'usesCurrent', 'usesUsed'].includes(key);
  return false;
}

function semanticValue(value, path = []) {
  if (typeof value === 'string') return text(value);
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) {
    const values = value.map((item, index) => semanticValue(item, [...path, index]));
    // Paying two named resources is unordered; effect/trigger execution is not.
    return COST_COLLECTIONS.has(path.at(-1))
      ? values.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) : values;
  }
  const result = {};
  for (const key of Object.keys(value).sort()) {
    if (omitField(key, path)) continue;
    const projected = semanticValue(value[key], [...path, key]);
    if (projected !== undefined) result[key] = projected;
  }
  if (path.length === 1 && ['state', 'runtime', 'uses'].includes(path[0]) && !Object.keys(result).length) return undefined;
  return result;
}

// Fill the same defaults that character sheets use, retaining unfamiliar rule
// fields instead of dropping them through a catalog-specific whitelist.
function mergeNormalizedRules(original, normalized) {
  if (Array.isArray(normalized) && Array.isArray(original) && original.length && original.length !== normalized.length) return original;
  if (Array.isArray(normalized)) return normalized.map((item, index) =>
    mergeNormalizedRules(Array.isArray(original) ? original[index] : undefined, item));
  if (!normalized || typeof normalized !== 'object') return original === undefined || original === '' ? normalized : original;
  const result = { ...(original && typeof original === 'object' ? original : {}) };
  for (const [key, value] of Object.entries(normalized)) result[key] = mergeNormalizedRules(result[key], value);
  return result;
}

function effectiveData(entry, data) {
  const normalizer = { ability: normalizeCombatAbility, technique: normalizeCombatTechnique, trait: normalizeCombatTrait }[entry.kind];
  const defaults = normalizer ? mergeNormalizedRules(data, normalizer(data)) : data;
  return entry.kind === 'ability' ? { minimumLevel: 1, ...defaults } : defaults;
}

function stableValue(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(stableValue);
  return Object.fromEntries(Object.keys(value).sort().filter(key => value[key] !== undefined)
    .map(key => [key, stableValue(value[key])]));
}

function artworkAssignment(entry, data) {
  const override = String(entry.iconOverride || data.iconOverride || '').trim();
  if (override) return { assigned: true, source: override };
  if (Number(entry.iconAssignmentVersion || data.iconAssignmentVersion) > 0) {
    return { assigned: true, source: String(entry.icon || data.icon || '').trim() };
  }
  return undefined;
}

function ownerContext(entry, data) {
  const explicit = {
    id: data.ownerCharacterId || entry.ownerCharacterId || data.personalOwnerId || entry.personalOwnerId || '',
    name: data.ownerCharacterName || entry.ownerCharacterName || data.personalOwnerName
      || data.archivePlacement?.personName || ''
  };
  if (explicit.id || explicit.name) return { id: text(explicit.id), name: nameKey(explicit.name) };
  if (entry.kind === 'ability') {
    // Reuse the existing exact owner/ability policy. A shared icon resolves
    // without provenance; personal artwork resolves only with its real owner.
    const unillustrated = { ...data, name: entry.name || data.name, icon: '', iconOverride: '' };
    const ownerFree = { ...unillustrated };
    for (const key of ['ownerCharacterId', 'ownerCharacterName', 'sourceCharacterId', 'sourceCharacter',
      'characterId', 'characterName']) delete ownerFree[key];
    const shared = getCharacterAbilityIconSource(ownerFree);
    const personal = getArchiveAbilityIconSource({ ...entry, icon: '', iconOverride: '', data: unillustrated });
    if (personal && !shared) return { personalAbility: personal };
  }
  if (data.personal === true || data.ownerBound === true || entry.personal === true) {
    const people = (entry.sources || []).filter(source => ['character', 'creature'].includes(source.kind))
      .map(source => ({ id: text(source.id), name: nameKey(source.name) }));
    if (data.sourceCharacterId || data.sourceCharacter) people.push({ id: text(data.sourceCharacterId), name: nameKey(data.sourceCharacter) });
    return { personal: true, people: people.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))) };
  }
  return undefined;
}

function instanceContext(entry, data) {
  if (data.section === 'offer') return { section: 'offer', id: String(data.id || data.offerId || entry.id || ''), provider: String(data.listId || '') };
  if (data.section === 'owned' || data.inventoryItemId || data.instanceId) {
    return { section: 'owned', id: String(data.instanceId || data.inventoryItemId || data.id || entry.id || ''),
      owner: String(data.ownerCharacterId || data.listId || ''), creature: String(data.creatureId || '') };
  }
  return undefined;
}

function logicalContext(entry, data) {
  return {
    kind: String(entry.kind || '').trim(), catalogIdentity: entry.kind === 'combat-style' ? data.id : undefined, name: nameKey(entry.name || data.name || data.label),
    form: stableValue({ style: data.combatStyleId, form: data.combatStyleFormId,
      trainingForm: data.trainingForm, parentStyle: data.parentStyleId, parentPath: data.parentPathId,
      placement: data.archivePlacement }),
    ...(entry.kind === 'spell' ? { spellReference: stableValue(data.catalogReference || data.catalogOrigin),
      supplementaryOrigin: data.catalogReference && data.catalogOrigin ? stableValue(data.catalogOrigin) : undefined } : {}),
    owner: ownerContext(entry, data), instance: instanceContext(entry, data)
  };
}

/** Logical family only. Different signatures in this family remain variants. */
export function getCharacterArchiveLogicalIdentity(entry = {}) {
  return JSON.stringify(stableValue(logicalContext(entry, dataOf(entry))));
}

/** Manual authorship/artwork protects source refresh; it is not a rule difference. */
export function isExplicitCharacterArchiveVariant(entry = {}) {
  const data = dataOf(entry);
  return Boolean(artworkAssignment(entry, data)
    || String(entry.id || '').startsWith('custom--')
    || entry.explicitVariant === true || entry.userAuthored === true
    || data.explicitVariant === true || data.userAuthored === true
    || (data.catalogOrigin && !data.catalogReference)
    // Older explicit saves had no authorship marker. A timestamp on an
    // automatically archived profile alone is deliberately insufficient.
    || (entry.builtin === false && entry.archivedFromProfile !== true && Boolean(entry.updatedAt || entry.createdAt)));
}

/**
 * Semantic signature, not an instance key or authorization to delete records.
 * It retains prose rules, unknown mechanics, form scope and catalog revisions.
 * Transport UUIDs, provenance and current activation/use state are irrelevant.
 */
export function getCharacterArchiveEntrySignature(entry = {}) {
  const data = dataOf(entry);
  return JSON.stringify(stableValue({ identity: logicalContext(entry, data),
    description: text(entry.description || data.description || data.effect || data.notes || data.subtitle || data.appliesWhen),
    rules: semanticValue(effectiveData(entry, data)) }));
}
