import assert from 'node:assert/strict';
import { characterDatabaseContentHash } from './character-database-model.mjs';

const latestTimestamp = (...values) => values.filter(value => Number.isFinite(Date.parse(value))).sort().at(-1) || '';

// Shared bounded record bookkeeping for reviewed inventory/equipment overlays.
// Callers own the merge policy; identity, classification and original sources stay intact.
export function projectEquipmentCharacterRecord({ record, snapshotCharacter, path, inventory, weapons, armorItems, sourcePath, now }) {
  assert.ok(Number.isFinite(Date.parse(now)));
  assert.ok(sourcePath.startsWith('Charakter Archiv Exporte/') && sourcePath.endsWith('.json') && !sourcePath.includes('..'));
  assert.equal(record.character.id, snapshotCharacter.id);
  const nextRecord = structuredClone(record), person = structuredClone(snapshotCharacter);
  for (const character of [nextRecord.character, person]) {
    character.inventory = structuredClone(inventory);
    character.combatProfile = { ...(character.combatProfile || {}), weapons: structuredClone(weapons), armorItems: structuredClone(armorItems) };
    character.updatedAt = latestTimestamp(character.updatedAt, now);
  }
  const exported = { type: 'aleria-character', version: 1, exportedAt: now, mergeStrategy: 'replace-exported-fields', sourcePath,
    character: { id: record.character.id, name: record.character.name, inventory: structuredClone(nextRecord.character.inventory),
      combatProfile: structuredClone(nextRecord.character.combatProfile), updatedAt: nextRecord.character.updatedAt } };
  if (!nextRecord.sources.firestoreExports.some(source => JSON.stringify(source) === JSON.stringify(exported.character))) {
    nextRecord.sources.firestoreExports.push(structuredClone(exported.character));
    nextRecord.sync.sourceDocumentIds.push(record.character.id);
    nextRecord.links.firestore.documentIds.push(record.character.id);
    nextRecord.links.firestore.documents.push({ documentId: record.character.id, createdAt: '', updatedAt: exported.character.updatedAt });
  }
  nextRecord.sync.sourceArchive = sourcePath;
  nextRecord.sync.sourceExportedAt = latestTimestamp(nextRecord.sync.sourceExportedAt, now);
  nextRecord.sync.sourceUpdatedAt = nextRecord.character.updatedAt;
  nextRecord.sync.contentHash = characterDatabaseContentHash(nextRecord.character, nextRecord.classification, nextRecord.sync.sourceDocumentIds);
  person.localRecord.contentHash = nextRecord.sync.contentHash;
  person.localRecord.firestoreDocumentIds = structuredClone(nextRecord.sync.sourceDocumentIds);
  return { projection: { record: nextRecord, path, snapshotCharacter: person }, exported };
}
