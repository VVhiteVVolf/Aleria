import { CHARACTER_CLASS_TEMPLATES } from '../combat/character-creation-templates.js';
import { normalizeCombatAbility } from '../combat/combat-profile-model.js';
import { getCharacterArchiveEntrySignature } from './character-archive-entry-equivalence.js';

export const SHARED_ANIMAL_COMPANION_ID = 'shared-animal-companion';
export const SHARED_ANIMAL_COMPANION_DESCRIPTION = 'Ein abgerichtetes Tier begleitet die Figur auf Reisen, bei der Jagd und durch die Wildnis.';
const sourceClasses = Object.freeze({
  'starter-serf-animal-companion': 'serf',
  'starter-skytte-animal-companion': 'skytte'
});

const originalSignatures = new Map();

function originalFor(id) {
  const classId = sourceClasses[id];
  return classId ? CHARACTER_CLASS_TEMPLATES.find(template => template.id === classId)?.abilities.find(ability => ability.id === id) : null;
}

function asEntry(data) {
  return { kind: 'ability', name: data.name, description: data.description, data };
}

function normalizedAbility(data) {
  return normalizeCombatAbility(data);
}

// Presentation only: recognize precisely these two authored class packages.
// Unknown fields and changed descriptions/mechanics fail the exact rule check.
// UUID copies may retain a known catalogAbilityId, but names alone never match.
export function projectCharacterArchiveCompanionAliases(entries = []) {
  return entries.map(entry => {
    if (entry.kind !== 'ability') return entry;
    const data = entry.data || {};
    const original = originalFor(String(data.catalogAbilityId || data.sourceAbilityId || data.id || ''));
    if (!original) return entry;
    const signature = getCharacterArchiveEntrySignature(entry);
    const normalized = normalizedAbility(original);
    if (!originalSignatures.has(original.id)) originalSignatures.set(original.id, new Set([
      getCharacterArchiveEntrySignature(asEntry(original)), getCharacterArchiveEntrySignature(asEntry(normalized))
    ]));
    if (!originalSignatures.get(original.id).has(signature)) return entry;
    return { ...entry, name: original.name, description: SHARED_ANIMAL_COMPANION_DESCRIPTION,
      data: { ...normalized, ...data, catalogAbilityId: SHARED_ANIMAL_COMPANION_ID,
        description: SHARED_ANIMAL_COMPANION_DESCRIPTION, tags: 'Begleiter · Reisen · Jagd · Wildnis' } };
  });
}
