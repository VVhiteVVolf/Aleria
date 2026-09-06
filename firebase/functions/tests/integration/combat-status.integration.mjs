import assert from 'node:assert/strict';
import test from 'node:test';
import { database, request, resetScene, history, record, ids, threadId, startFight, active, encounter, prepareAction, commitAction, undo } from './combat-test-context.mjs';
import { commitCombatStatus } from '../../src/mechanics/commit-combat-status.js';
import { commitResetCombatParticipants } from '../../src/mechanics/commit-reset-combat-participants.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';

async function change(extra = {}, actorId = ids[1]) {
  return commitCombatStatus.run(request({ entryId: threadId, actorId, recordId: actorId, kind: 'character',
    expectedLastCommentId: (await history()).at(-1)?.id || '', operation: 'add',
    condition: { name: 'Mut', durationKind: 'actor-comments', durationAmount: 2, mechanics: { attack: 2, armorClass: 1 } }, ...extra }));
}

test('Zustände vor dem Kampf bleiben im Kampf wirksam und laufen ab', async () => {
  await resetScene();
  await change();
  await startFight();
  let state = deriveCombatStateFromComments(await history()).get(ids[1]);
  assert.equal(state.temporaryConditions[0].durationModel.remainingActorComments, 2);
  const profile = overlayCombatHitPointState(resolveCombatProfile(await record(ids[1])), state);
  assert.equal(profile.totalDefense, 17);
  const action = await prepareAction({ actorIndex: 1 });
  await commitAction(action.payload || action);
  state = deriveCombatStateFromComments(await history()).get(ids[1]);
  assert.equal(state.temporaryConditions[0].durationModel.remainingActorComments, 1);
});

test('Reset wird bei Kampfphase auf beiden Serverwegen abgelehnt; Sperren bleiben bestehen', async () => {
  await resetScene(); await startFight();
  await assert.rejects(() => change({ operation: 'reset' }), /Kampfphase/);
  await assert.rejects(() => commitResetCombatParticipants.run(request({ participants: [{ kind: 'character', recordId: ids[1] }] })), /Kampfphase/);
  const lock = await database.collection('combat_profile_locks').doc('characters').collection('records').doc(ids[1]).get();
  assert.equal(lock.data().activeEncounterKeys.length, 1);
});

test('Server lehnt veraltete Eingaben und unzulässige Boni ab', async () => {
  await resetScene(); await change();
  await assert.rejects(() => change({ expectedLastCommentId: '' }), /verändert/);
  await assert.rejects(() => change({ condition: { name: 'Unsinn', durationKind: 'permanent', mechanics: { damage: 999 } } }), /Boni/);
  assert.equal((await history()).length, 1);
});

test('Entfernen wird protokolliert und lässt sich ohne spätere Abhängigkeit zurücknehmen', async () => {
  await resetScene();
  const added = await change();
  const conditionId = added.combatStatus.after.temporaryConditions[0].id;
  const removed = await change({ operation: 'remove', conditionId });
  assert.equal(deriveCombatStateFromComments(await history()).get(ids[1]).temporaryConditions.length, 0);
  await undo(removed.id);
  assert.equal(deriveCombatStateFromComments(await history()).get(ids[1]).temporaryConditions.length, 1);
});

test('Reset nach Kampfende füllt Profil und Szenenstand identisch auf; Undo stellt Wunden wieder her', async () => {
  await resetScene();
  await database.collection('characters').doc(ids[1]).update({ 'combatProfile.hitPoints.current': 7 });
  await change(); await startFight();
  const fight = await active();
  await encounter({ encounterId: fight.encounterId, operation: 'end', expectedRevision: fight.revision, outcome: 'draw', endReason: 'agreement', participants: [] });
  const reset = await change({ operation: 'reset' });
  const stored = await record(ids[1]);
  const state = deriveCombatStateFromComments(await history()).get(ids[1]);
  assert.equal(stored.combatProfile.hitPoints.current, 49);
  assert.equal(state.current, 49); assert.equal(state.temporaryConditions.length, 0);
  assert.ok(state.resources.every(resource => resource.current === resource.maximum));
  await undo(reset.id);
  assert.equal((await record(ids[1])).combatProfile.hitPoints.current, 7);
});
