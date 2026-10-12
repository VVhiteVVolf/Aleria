import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCharacterDatabase, characterDatabaseContentHash } from '../../CharakterDatenbank/lib/character-database-model.mjs';
import { updateCharacterDatabaseInventory } from '../../CharakterDatenbank/lib/character-database-inventory.mjs';

test('inventory-only archive updates preserve canonical combat and genealogy despite conflicting historical exports', () => {
  const built = buildCharacterDatabase({ exportedAt: '2026-10-01T00:00:00Z', characters: [{
    id: 'duncan', name: 'Duncan', inventory: { items: [{ id: 'sword' }] },
    combatProfile: { hitPoints: { current: 7 }, conditions: [{ id: 'kept' }], resources: [{ id: 'spent', current: 0 }] },
    genealogy: { birth: '1670' }
  }] }, []).records[0];
  built.record.sources.firestoreExports.push({ id: 'duncan', name: 'Duncan', combatProfile: { hitPoints: { current: 99 } } });
  built.record.local.notes = 'Persönliche Notiz erhalten';
  const before = structuredClone(built);
  const inventory = { items: [{ id: 'sword' }, { id: 'carreg', creatureId: 'companion-duncan-carreg' }] };
  const result = updateCharacterDatabaseInventory(built.record, built.snapshotCharacter, inventory,
    { updatedAt: '2026-10-12T00:00:00Z', sourcePath: 'carreg.json' });
  assert.deepEqual(built, before);
  assert.deepEqual(result.record.character.combatProfile, before.record.character.combatProfile);
  assert.deepEqual(result.record.character.genealogy, before.record.character.genealogy);
  assert.deepEqual(result.record.local, before.record.local);
  assert.deepEqual(result.record.character.inventory, inventory);
  assert.deepEqual(result.snapshotCharacter.inventory, inventory);
  assert.deepEqual(result.snapshotCharacter.combatProfile, before.snapshotCharacter.combatProfile);
  assert.deepEqual(result.record.sources.firestoreExports.slice(0, -1), before.record.sources.firestoreExports);
  assert.deepEqual(Object.keys(result.record.sources.firestoreExports.at(-1)), ['id', 'name', 'inventory', 'updatedAt']);
  const hash = characterDatabaseContentHash(result.record.character, result.record.classification, result.record.sync.sourceDocumentIds);
  assert.equal(result.record.sync.contentHash, hash);
  assert.equal(result.snapshotCharacter.localRecord.contentHash, hash);
  assert.throws(() => updateCharacterDatabaseInventory(built.record, { id: 'another' }, inventory,
    { updatedAt: '2026-10-12T00:00:00Z', sourcePath: 'carreg.json' }), /Identität/);
});
