import assert from 'node:assert/strict';
import test from 'node:test';
import { decodeFirestoreValue, encodeFirestoreValuePreservingTypes } from '../../firebase/scripts/backup/firestore-value-codec.mjs';

test('an inventory addition preserves every existing nested REST type and never mutates its source', () => {
  const previous = { mapValue: { fields: { items: { arrayValue: { values: [{ mapValue: { fields: {
    id: { stringValue: 'old-item' }, obtainedAt: { timestampValue: '2026-11-08T12:00:00.123456Z' },
    reference: { referenceValue: 'projects/aleriaprojekt/databases/(default)/documents/items/old-item' },
    bytes: { bytesValue: 'AQID' }, price: { doubleValue: 1 }, position: { geoPointValue: { latitude: 1, longitude: 2 } }
  } } }] } }, metadata: { mapValue: {} } } } };
  const original = structuredClone(previous), desired = decodeFirestoreValue(previous);
  desired.items.push({ id: 'brona-honigwind', quantity: '1' });
  const encoded = encodeFirestoreValuePreservingTypes(previous, desired);
  assert.deepEqual(encoded.mapValue.fields.items.arrayValue.values[0], previous.mapValue.fields.items.arrayValue.values[0]);
  assert.deepEqual(encoded.mapValue.fields.metadata, previous.mapValue.fields.metadata);
  assert.deepEqual(decodeFirestoreValue(encoded), desired);
  assert.deepEqual(previous, original);
});
test('a biography icon edit preserves neighboring typed data while encoding the changed value', () => {
  const previous = { mapValue: { fields: { abilities: { arrayValue: { values: [{ mapValue: { fields: {
    title: { stringValue: 'Bodenständig' }, icon: { stringValue: '*' }, editorTime: { timestampValue: '2026-11-08T12:00:00Z' }
  } } }] } }, revision: { integerValue: '1' } } } };
  const desired = decodeFirestoreValue(previous);
  desired.abilities[0].icon = '/IconOrdner/Traits%20Icon/Content.png'; desired.revision = 2;
  const result = encodeFirestoreValuePreservingTypes(previous, desired);
  assert.deepEqual(result.mapValue.fields.abilities.arrayValue.values[0].mapValue.fields.editorTime,
    previous.mapValue.fields.abilities.arrayValue.values[0].mapValue.fields.editorTime);
  assert.deepEqual(decodeFirestoreValue(result), desired);
});
