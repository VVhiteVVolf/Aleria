import assert from 'node:assert/strict';
import test from 'node:test';

import { combatEncounterCommitInternals } from '../src/mechanics/commit-combat-encounter.js';

test('Kampfabschluss kann nicht vor die ausgewertete Historie zurückdatiert werden', () => {
  const order = combatEncounterCommitInternals.nextEncounterOrderKey([{ orderKey: 100 }, { createdAtClient: 120 }], 5, 200);
  assert.equal(order, 121);
  assert.equal(combatEncounterCommitInternals.nextEncounterOrderKey([{ orderKey: 100 }], 150, 200), 150);
});

test('veralteter und doppelter Abschluss werden serverseitig abgewiesen', () => {
  const active = { active: true, revision: 'new-action', participants: new Map() };
  assert.throws(() => combatEncounterCommitInternals.validateOperation({ operation: 'end', outcome: 'draw', expectedRevision: 'old-action' }, active), /verändert/);
  assert.throws(() => combatEncounterCommitInternals.validateOperation({ operation: 'end', outcome: 'draw' }, { ...active, active: false }), /nicht mehr aktiv/);
  assert.doesNotThrow(() => combatEncounterCommitInternals.validateOperation({ operation: 'end', outcome: 'draw', expectedRevision: 'new-action' }, active));
});

function fakeDatabase() {
  return {
    collection(collectionId) {
      return {
        doc(documentId) {
          return {
            path: `${collectionId}/${documentId}`,
            collection(nestedCollectionId) {
              return {
                doc(nestedDocumentId) {
                  return { path: `${collectionId}/${documentId}/${nestedCollectionId}/${nestedDocumentId}` };
                }
              };
            }
          };
        }
      };
    }
  };
}

test('Kampfprofil-Sperren liegen getrennt nach Figurenart und Datensatz', () => {
  const database = fakeDatabase();
  assert.equal(
    combatEncounterCommitInternals.combatProfileLockRef(database, { kind: 'character', recordId: 'gawain' }).path,
    'combat_profile_locks/characters/records/gawain'
  );
  assert.equal(
    combatEncounterCommitInternals.combatProfileLockRef(database, { kind: 'creature', recordId: 'bandit' }).path,
    'combat_profile_locks/creatures/records/bandit'
  );
});

test('dieselbe Profilquelle wird pro Kampfereignis nur einmal gesperrt', () => {
  const calls = [];
  const transaction = { set: (...args) => calls.push(args) };
  combatEncounterCommitInternals.updateCombatProfileLocks(transaction, fakeDatabase(), [
    { kind: 'creature', recordId: 'skeleton' },
    { kind: 'creature', recordId: 'skeleton' }
  ], 'scene:encounter', true);
  assert.equal(calls.length, 1);
  assert.equal(calls[0][0].path, 'combat_profile_locks/creatures/records/skeleton');
  assert.equal(calls[0][2].merge, true);
});

test('eine geteilte Kreaturenvorlage bleibt gesperrt solange eine ihrer Instanzen aktiv ist', () => {
  const first = {
    actorId: 'skeleton-I', name: 'Skelett I', status: 'left',
    persistence: { kind: 'scene-creature', sourceCreatureId: 'skeleton-template' }
  };
  const second = {
    actorId: 'skeleton-II', name: 'Skelett II', status: 'active',
    persistence: { kind: 'scene-creature', sourceCreatureId: 'skeleton-template' }
  };
  assert.deepEqual(
    combatEncounterCommitInternals.getDescriptorsNoLongerActive([first, second], [first]),
    []
  );
  assert.deepEqual(
    combatEncounterCommitInternals.getDescriptorsNoLongerActive([{ ...first }, { ...second, status: 'left' }], [first, second]),
    [{ kind: 'creature', recordId: 'skeleton-template', persistent: false }]
  );
});

test('zerlegt einen Sperrschluessel in Szene und Kampfkennung', () => {
  assert.deepEqual(
    combatEncounterCommitInternals.splitEncounterKey('szene-a:encounter-123'),
    { entryId: 'szene-a', encounterId: 'encounter-123' }
  );
  assert.deepEqual(
    combatEncounterCommitInternals.splitEncounterKey('ohne-trenner'),
    { entryId: 'ohne-trenner', encounterId: '' }
  );
});

function fakeConflictDatabase({ lockData = null } = {}) {
  return {
    collection(collectionId) {
      if (collectionId === 'comments') {
        return { where: () => ({ __isCommentsQuery: true }) };
      }
      return {
        doc: documentId => ({
          path: `${collectionId}/${documentId}`,
          collection: nestedCollectionId => ({
            doc: nestedDocumentId => ({ path: `${collectionId}/${documentId}/${nestedCollectionId}/${nestedDocumentId}`, __lockData: lockData })
          })
        })
      };
    }
  };
}

function fakeTransaction(conflictComments = []) {
  return {
    get: async ref => {
      if (ref?.__isCommentsQuery) return { docs: conflictComments.map(comment => ({ id: comment.id, data: () => comment })) };
      return { exists: !!ref.__lockData, data: () => ref.__lockData };
    }
  };
}

test('findConflictingEncounter meldet keinen Konflikt ohne bestehende Sperre', async () => {
  const database = fakeConflictDatabase({ lockData: null });
  const transaction = fakeTransaction();
  const result = await combatEncounterCommitInternals.findConflictingEncounter(
    transaction, database, { kind: 'character', recordId: 'gawain' }, 'szene-a:encounter-1'
  );
  assert.equal(result, null);
});

test('findConflictingEncounter meldet keinen Konflikt fuer denselben Kampf', async () => {
  const database = fakeConflictDatabase({ lockData: { activeEncounterKeys: ['szene-a:encounter-1'] } });
  const transaction = fakeTransaction();
  const result = await combatEncounterCommitInternals.findConflictingEncounter(
    transaction, database, { kind: 'character', recordId: 'gawain' }, 'szene-a:encounter-1'
  );
  assert.equal(result, null);
});

test('findConflictingEncounter findet einen aktiven Kampf in einer anderen Szene und liefert dessen Titel', async () => {
  const database = fakeConflictDatabase({ lockData: { activeEncounterKeys: ['szene-b:encounter-9'] } });
  const conflictComments = [{
    id: 'c1', entryId: 'szene-b', combatEncounter: {
      encounterId: 'encounter-9', operation: 'start', title: 'Hinterhalt am Fluss', participants: []
    },
    serverValidatedMechanics: true
  }];
  const transaction = fakeTransaction(conflictComments);
  const result = await combatEncounterCommitInternals.findConflictingEncounter(
    transaction, database, { kind: 'character', recordId: 'gawain' }, 'szene-a:encounter-1'
  );
  assert.equal(result.title, 'Hinterhalt am Fluss');
});

test('assertNoConflictingEncounter blockiert mit klarer Fehlermeldung, wenn eine Figur schon anderswo im Kampf ist', async () => {
  const database = fakeConflictDatabase({ lockData: { activeEncounterKeys: ['szene-b:encounter-9'] } });
  const conflictComments = [{
    id: 'c1', entryId: 'szene-b', combatEncounter: {
      encounterId: 'encounter-9', operation: 'start', title: 'Hinterhalt am Fluss', participants: []
    },
    serverValidatedMechanics: true
  }];
  const transaction = fakeTransaction(conflictComments);
  const participant = { name: 'Gawain', persistence: { kind: 'character', recordId: 'gawain' } };
  await assert.rejects(
    combatEncounterCommitInternals.assertNoConflictingEncounter(transaction, database, [participant], 'szene-a:encounter-1'),
    error => {
      assert.equal(error.code, 'failed-precondition');
      assert.match(error.message, /Gawain/);
      assert.match(error.message, /Hinterhalt am Fluss/);
      return true;
    }
  );
});

test('assertNoConflictingEncounter laesst unbeteiligte Figuren unbeanstandet durch', async () => {
  const database = fakeConflictDatabase({ lockData: null });
  const transaction = fakeTransaction();
  const participant = { name: 'Gawain', persistence: { kind: 'character', recordId: 'gawain' } };
  await assert.doesNotReject(
    combatEncounterCommitInternals.assertNoConflictingEncounter(transaction, database, [participant], 'szene-a:encounter-1')
  );
});

test('assertNoConflictingEncounter blockiert geteilte Kreaturvorlagen NICHT, auch wenn dieselbe Vorlage anderswo aktiv ist', async () => {
  // "scene-creature" ist eine geteilte Vorlage (z.B. mehrere Draig-Waffenknecht-Instanzen). Ihr
  // Kampfzustand wird nie auf die Vorlage zurückgeschrieben, deshalb ist Mehrfachnutzung normal.
  const database = fakeConflictDatabase({ lockData: { activeEncounterKeys: ['szene-b:encounter-9'] } });
  const conflictComments = [{
    id: 'c1', entryId: 'szene-b', combatEncounter: {
      encounterId: 'encounter-9', operation: 'start', title: 'Ambush im Nordwald', participants: []
    },
    serverValidatedMechanics: true
  }];
  const transaction = fakeTransaction(conflictComments);
  const participants = [
    { name: 'Draig Waffenknecht I', persistence: { kind: 'scene-creature', sourceCreatureId: 'draig-waffenknecht' } },
    { name: 'Draig Waffenknecht II', persistence: { kind: 'scene-creature', sourceCreatureId: 'draig-waffenknecht' } }
  ];
  await assert.doesNotReject(
    combatEncounterCommitInternals.assertNoConflictingEncounter(transaction, database, participants, 'szene-a:encounter-1')
  );
});
