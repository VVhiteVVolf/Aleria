import assert from 'node:assert/strict';
import test from 'node:test';

import { combatEncounterCommitInternals } from '../src/mechanics/commit-combat-encounter.js';

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

test('nur Eröffner oder Moderation dürfen einen laufenden Kampf beenden', () => {
  assert.equal(combatEncounterCommitInternals.canEndEncounter(
    { startedBy: 'starter' }, { auth: { uid: 'starter', token: { aleriaRole: 'player' } } }
  ), true);
  assert.equal(combatEncounterCommitInternals.canEndEncounter(
    { startedBy: 'starter' }, { auth: { uid: 'stranger', token: { aleriaRole: 'player' } } }
  ), false);
  assert.equal(combatEncounterCommitInternals.canEndEncounter(
    { startedBy: 'starter' }, { auth: { uid: 'moderator', token: { aleriaRole: 'moderator' } } }
  ), true);
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
