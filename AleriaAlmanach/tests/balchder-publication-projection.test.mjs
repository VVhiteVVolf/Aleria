import assert from 'node:assert/strict';
import test from 'node:test';
import { preserveBalchderCurrentFields } from '../../CharakterDatenbank/lib/balchder-publication-projection.mjs';
const character = { id: 'kamber', name: 'Kamber Balchder', updatedAt: '2026-11-02', inventory: { companions: [{ creatureId: 'silberwind' }], money: { copper: 4 } }, combatProfile: { hitPoints: { current: 7 }, resources: [{ current: 0 }] }, biography: { text: 'alt' } };
const record = { character, identity: { worldPersonId: 'kamber-world' }, classification: {}, local: { notes: 'erhalten' }, sources: { firestoreExports: [{ id: 'history' }] }, sync: { sourceDocumentIds: ['kamber'] } };
const fixture = () => ({ record: structuredClone(record), snapshotCharacter: { ...structuredClone(character), localRecord: { recordId: 'kamber' } }, path: 'keep' });
test('Balchder biography refresh keeps new companion links, combat resources and provenance', () => {
  const input = fixture(), projected = fixture(); projected.record.character = { id: 'kamber', inventory: null, combatProfile: null, biography: { text: 'neu' }, updatedAt: '2026-10-30' };
  projected.record.sources.firestoreExports = [{ id: 'published-source' }];
  const result = preserveBalchderCurrentFields(projected, input.record, input.snapshotCharacter);
  assert.deepEqual(result.record.character.inventory, character.inventory); assert.deepEqual(result.record.character.combatProfile, character.combatProfile);
  assert.equal(result.record.character.updatedAt, character.updatedAt); assert.equal(result.record.character.biography.text, 'neu');
  assert.deepEqual(result.record.local, record.local); assert.equal(result.record.sources.firestoreExports.length, 2);
  assert.deepEqual(preserveBalchderCurrentFields(projected, result.record, result.snapshotCharacter), result);
  assert.equal(input.record.character.biography.text, 'alt');
});
