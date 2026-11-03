import assert from 'node:assert/strict';
import { confirmCharacterRecordProjection } from './character-record-confirmation.mjs';
export { hasNewerCharacterRecordProjection as hasNewerEquipmentRecordProjection } from './character-record-confirmation.mjs';

const latestTimestamp = (...values) => values.filter(value => Number.isFinite(Date.parse(value))).sort().at(-1) || '';

// Shared bounded record bookkeeping for reviewed inventory/equipment overlays.
// Callers own the merge policy; identity, classification and original sources stay intact.
export function projectEquipmentCharacterRecord({ record, snapshotCharacter, path, inventory, weapons, armorItems, sourcePath, now, includeCombatProfile = true, combatRevision }) {
  assert.ok(Number.isFinite(Date.parse(now)));
  assert.ok(sourcePath.startsWith('Charakter Archiv Exporte/') && sourcePath.endsWith('.json') && !sourcePath.includes('..'));
  assert.equal(record.character.id, snapshotCharacter.id);
  const nextRecord = structuredClone(record), person = structuredClone(snapshotCharacter);
  for (const character of [nextRecord.character, person]) {
    character.inventory = structuredClone(inventory);
    if (includeCombatProfile) character.combatProfile = { ...(character.combatProfile || {}), weapons: structuredClone(weapons), armorItems: structuredClone(armorItems),
      ...(combatRevision == null ? {} : { revision: Math.max(character.combatProfile?.revision || 0, combatRevision) }) };
    character.updatedAt = latestTimestamp(character.updatedAt, now);
  }
  const exportedCharacter = { id: record.character.id, name: record.character.name, inventory: structuredClone(nextRecord.character.inventory),
      ...(includeCombatProfile ? { combatProfile: structuredClone(nextRecord.character.combatProfile) } : {}), updatedAt: nextRecord.character.updatedAt };
  return confirmCharacterRecordProjection({ record, snapshotCharacter, path, character: nextRecord.character, person, exportedCharacter, sourcePath, now });
}
