import { STANDARD_ITEMS } from '../item-register/item-register-standard.js';
import { itemDefinitionKey, normalizeItemDefinitionRef } from '../item-definitions/item-definition-model.js';
import { normalizeCharacterArchiveEntry } from './character-archive-model.js';
import { getCharacterArchiveEntrySignature } from './character-archive-entry-equivalence.js';
import { buildStandardWeaponArchiveEntries } from './character-archive-standard-weapons.js';
import { coalesceRegisterArchiveEntries, selectRegisterProjectionArtwork } from './character-archive-register-projection.js';

const standards = new Map(STANDARD_ITEMS.filter(item => item.category === 'waffen'
  && item.combatDefinition?.kind === 'weapon').map(item => [item.id, item]));
const canonicalWeapons = new Map(buildStandardWeaponArchiveEntries().map(entry => [entry.data.archiveStandardWeaponId, entry]));
const clone = value => structuredClone(value);

function weaponStandard(entry) {
  if (entry.kind !== 'attack') return null;
  const data = entry.data || {}, standard = standards.get(data.archiveStandardWeaponId);
  const canonical = canonicalWeapons.get(standard?.id);
  if (!standard || data.id !== canonical?.data.id || data.inventoryItemId || data.ownerCharacterId
    || data.ownerCreatureId || data.instanceId || data.creatureId) return null;
  const expected = itemDefinitionKey(standard.definitionRef);
  for (const reference of [data.definitionRef, data.itemDefinitionRef].filter(Boolean)) {
    if (itemDefinitionKey(reference) !== expected) return null;
  }
  const comparable = { ...data };
  delete comparable.definitionRef;
  delete comparable.itemDefinitionRef;
  return getCharacterArchiveEntrySignature({ ...entry, data: comparable }) === getCharacterArchiveEntrySignature(canonical)
    ? standard : null;
}

function registerStandard(entry) {
  if (entry.kind !== 'register-waffen') return null;
  const projected = coalesceRegisterArchiveEntries([entry]);
  if (projected.length !== 1 || projected[0].registerPresentation?.kind !== 'template') return null;
  const data = entry.data || {}, reference = normalizeItemDefinitionRef(data.definitionRef);
  const standard = standards.get(data.id) || standards.get(data.templateId) || standards.get(reference?.id);
  return standard && reference && itemDefinitionKey(reference) === itemDefinitionKey(standard.definitionRef)
    ? standard : null;
}

function unfold(entry) {
  if (!entry.registerEntry || !entry.weaponEntry || !entry.alternateKinds?.includes('register-waffen')) return [entry];
  return [...(entry.weaponEntries || [entry.weaponEntry]), entry.registerEntry];
}

function combine(group) {
  const weapon = group.weapons[0];
  const registerEntry = coalesceRegisterArchiveEntries(group.registers)[0];
  const artwork = selectRegisterProjectionArtwork([...group.weapons, registerEntry]);
  const primary = normalizeCharacterArchiveEntry({ ...weapon, ...artwork,
    sources: [...(weapon.sources || []), ...(registerEntry.sources || [])] });
  return { ...weapon, ...primary, ...artwork,
    alternateKinds: ['attack', 'register-waffen'],
    weaponEntry: clone(weapon), weaponEntries: group.weapons.map(clone), registerEntry: clone(registerEntry),
    registerVariants: clone(registerEntry.registerVariants || []),
    sourceIds: [...new Set([...group.weapons.flatMap(entry => entry.sourceIds || []),
      ...(registerEntry.sourceIds || [registerEntry.data.id])])],
    registerPresentation: clone(registerEntry.registerPresentation) };
}

// One catalog card can supply a base attack and the matching register template.
// Identity is proved by the current standard ID and pinned definition version,
// never by a matching label. The two original entry contracts remain available.
export function coalesceWeaponReferenceArchiveEntries(entries = []) {
  const rows = entries.flatMap(unfold), groups = new Map(), assignments = new Map();
  for (const entry of rows) {
    const standard = weaponStandard(entry) || registerStandard(entry);
    if (!standard) continue;
    const key = itemDefinitionKey(standard.definitionRef);
    if (!groups.has(key)) groups.set(key, { weapons: [], registers: [] });
    groups.get(key)[entry.kind === 'attack' ? 'weapons' : 'registers'].push(entry);
    assignments.set(entry, key);
  }
  const emitted = new Set();
  return rows.flatMap(entry => {
    const key = assignments.get(entry), group = groups.get(key);
    if (!group?.weapons.length || !group.registers.length) return [entry];
    if (emitted.has(key)) return [];
    emitted.add(key);
    return [combine(group)];
  });
}

export function getWeaponReferenceArchiveEntryForKind(entry, kind) {
  const original = kind === 'register-waffen' && entry.registerEntry ? entry.registerEntry
    : kind === 'attack' && entry.weaponEntry ? entry.weaponEntry : entry;
  const selected = clone(original);
  const iconOverride = entry.iconOverride || entry.data?.iconOverride || '';
  const iconAssignmentVersion = Number(entry.iconAssignmentVersion || entry.data?.iconAssignmentVersion) || 0;
  if (original !== entry && (iconOverride || iconAssignmentVersion)) {
    const icon = iconOverride || entry.icon || entry.data?.icon || '';
    Object.assign(selected, { icon, iconOverride, iconAssignmentVersion });
    selected.data = { ...selected.data, icon, image: icon };
  }
  return selected;
}
