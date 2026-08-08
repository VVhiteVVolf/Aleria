import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getNextProtectedRecordRevision,
  withProtectedRecordRevisions
} from '../src/mechanics/protected-record-revisions.js';

test('serverseitige Profilrevisionen bleiben bei gleicher oder rueckwaertiger Uhr monoton', () => {
  const record = {
    combatProfile: { revision: 9000 },
    inventory: { revision: 12000 }
  };
  assert.equal(getNextProtectedRecordRevision(record, 1000), 12001);
  assert.equal(getNextProtectedRecordRevision(record, 15000), 15000);
});

test('vollstaendiges Inventar und verschachteltes Kampfprofil erhalten denselben frischen Stand', () => {
  const inventory = { items: [{ id: 'sword' }], revision: 10 };
  const values = withProtectedRecordRevisions(
    { combatProfile: { revision: 40 }, inventory: { revision: 50 } },
    {
      inventory,
      'combatProfile.resources': [{ id: 'aura' }]
    },
    ['inventory', 'combatProfile'],
    25
  );

  assert.equal(values.inventory.revision, 51);
  assert.equal(values['combatProfile.revision'], 51);
  assert.equal(inventory.revision, 10, 'das Eingabeobjekt darf nicht mutiert werden');
});

test('unbekannte Bereiche und nicht-objektartige Vollersetzungen scheitern laut', () => {
  assert.throws(
    () => withProtectedRecordRevisions({}, {}, ['profile'], 100),
    /Unbekannter geschuetzter Datensatzbereich/
  );
  assert.throws(
    () => withProtectedRecordRevisions({}, { inventory: null }, ['inventory'], 100),
    /muss fuer eine Revisionsstempelung ein Objekt sein/
  );
});
