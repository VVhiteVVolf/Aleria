import assert from 'node:assert/strict';
import { beforeEach, test, after } from 'node:test';
import { database, actorRecords, ids, threadId, resetScene, startFight, encounter, active, history, prepareAction, commitAction, record, undo } from './combat-test-context.mjs';
import { deriveCombatStateFromComments } from '../../src/generated/combat/combat-state-model.js';

beforeEach(resetScene);
after(() => database.terminate());

test('echte Speichertransaktion: Eröffnung sperrt beide Profile und verhindert Doppelstart', async () => {
  const started = await startFight();
  assert.equal(started.combatEncounter.participants[1].entrySnapshot.current, 39);
  const lock = await database.doc(`combat_profile_locks/characters/records/${ids[0]}`).get();
  assert.deepEqual(lock.data().activeEncounterKeys, [`${threadId}:${started.combatEncounter.encounterId}`]);
  await assert.rejects(startFight(), /bereits ein Kampf/);
});

test('Redeblase speichert Würfel, TP und Ressourcen atomar; Rücknahme stellt den Ausgang wieder her', async () => {
  await startFight();
  const before = await record(ids[1]);
  const action = await prepareAction();
  const committed = await commitAction(action.payload);
  const result = committed.mechanics.commentSegments[0].combatResolution;
  assert.equal(result.profileActionId, action.segment.combatResolution.profileActionId);
  assert.equal((await record(ids[1])).combatProfile.hitPoints.current, result.targetSnapshot.hitPointsAfter);
  assert.equal(result.targetSnapshot.hitPointsAfter, action.segment.combatResolution.targetSnapshot.hitPointsAfter);
  assert.equal(committed.mechanics.commentSegments[0].commentKind, 'speech');
  await undo(committed.id);
  assert.deepEqual((await record(ids[1])).combatProfile.hitPoints, before.combatProfile.hitPoints);
  assert.equal((await history()).length, 1);
});

test('gleichzeitige Angriffe werden ohne verlorene TP-Änderung nacheinander verbucht', async () => {
  await startFight();
  const first = await prepareAction();
  const second = await prepareAction();
  const results = await Promise.all([commitAction(first.payload, 'local-player-one'), commitAction(second.payload, 'local-player-two')]);
  const resolutions = results.map(result => result.mechanics.commentSegments[0].combatResolution).sort((a, b) => b.targetSnapshot.hitPointsBefore - a.targetSnapshot.hitPointsBefore);
  assert.equal(resolutions[1].targetSnapshot.hitPointsBefore, resolutions[0].targetSnapshot.hitPointsAfter);
  assert.equal((await record(ids[1])).combatProfile.hitPoints.current, resolutions[1].targetSnapshot.hitPointsAfter);
  const replay = deriveCombatStateFromComments(await history()).get(ids[1]);
  assert.equal(replay.current, (await record(ids[1])).combatProfile.hitPoints.current);
});

test('Sieg verbucht EP einmal, lässt TP unverändert und ist vollständig rücknehmbar', async () => {
  await startFight();
  const action = await prepareAction();
  await commitAction(action.payload);
  const beforeWinner = await record(ids[0]), beforeLoser = await record(ids[1]);
  const current = await active();
  const closing = { encounterId: current.encounterId, operation: 'end', expectedRevision: current.revision,
    outcome: 'victory', winningPartyId: 'gafyr', endReason: 'surrender', participants: [{ actorId: ids[1], status: 'surrendered' }] };
  const results = await Promise.allSettled([encounter(closing), encounter(closing)]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  const ended = results.find(result => result.status === 'fulfilled').value;
  assert.equal(ended.combatEncounter.experience.total, 1100);
  assert.equal(ended.combatEncounter.summary.actionCount, 1);
  assert.equal((await record(ids[0])).combatProfile.progression.experience, (beforeWinner.combatProfile.progression.experience || 0) + 1100);
  assert.deepEqual((await record(ids[1])).combatProfile.hitPoints, beforeLoser.combatProfile.hitPoints);
  await undo(ended.id);
  assert.deepEqual((await record(ids[0])).combatProfile.progression, beforeWinner.combatProfile.progression);
  assert.ok(await active());
});

test('neuere Handlung macht einen offenen Abschluss auch in der Datenbank ungültig', async () => {
  await startFight();
  const previous = await active();
  await commitAction((await prepareAction()).payload);
  await assert.rejects(encounter({ encounterId: previous.encounterId, operation: 'end', expectedRevision: previous.revision, outcome: 'draw' }), /verändert/);
});

test('vorbereiteter Beitrag darf nach Kampfabschluss nicht mehr in den beendeten Kampf geschrieben werden', async () => {
  await startFight();
  const action = await prepareAction();
  const current = await active();
  await encounter({ encounterId: current.encounterId, operation: 'end', expectedRevision: current.revision, outcome: 'draw' });
  await assert.rejects(commitAction(action.payload), /beendet|verändert|aktiv/);
});

test('Kampfankündigung kann nach einer davon abhängigen Handlung nicht vorzeitig gelöscht werden', async () => {
  const started = await startFight();
  await commitAction((await prepareAction()).payload);
  await assert.rejects(undo(started.id), /neuer|Handlung/);
});

test('normale Aktion und Jungdrachen-Bonusaktion funktionieren zusammen in Rede- und Handlungsblasen', async () => {
  await startFight();
  const first = await prepareAction();
  const second = await prepareAction({ actionId: 'technique:combat-style-drachentanz-jungdrache-01-erster-hieb', kind: 'action', priorSegments: [first.segment] });
  const committed = await commitAction(second.payload);
  const resolutions = committed.mechanics.commentSegments.map(segment => segment.combatResolution);
  assert.equal(resolutions[1].targetSnapshot.hitPointsBefore, resolutions[0].targetSnapshot.hitPointsAfter);
  assert.deepEqual(committed.mechanics.commentSegments.map(segment => segment.commentKind), ['speech', 'action']);
  assert.ok(resolutions[0].resourceCosts.some(cost => cost.resourceId === 'action' && cost.amount === 1));
  assert.ok(resolutions[1].resourceCosts.some(cost => cost.resourceId === 'bonus-action' && cost.amount === 1));
  assert.equal((await record(ids[1])).combatProfile.hitPoints.current, resolutions[1].targetSnapshot.hitPointsAfter);
});

test('zwei Hauptaktionen in einem Beitrag werden atomar abgelehnt', async () => {
  await startFight();
  const first = await prepareAction();
  const payload = structuredClone(first.payload);
  payload.metadata.commentSegments.push(structuredClone(first.segment));
  await assert.rejects(commitAction(payload), /Aktion|Ressource|genug|verfügbar/);
  assert.equal((await record(ids[1])).combatProfile.hitPoints.current, 39);
  assert.equal((await history()).length, 1);
});

test('ausgeschiedene Figuren können nicht mit einem alten Entwurf weiterkämpfen', async () => {
  await startFight();
  const action = await prepareAction();
  const current = await active();
  await encounter({ encounterId: current.encounterId, operation: 'remove', participants: [{ actorId: ids[0], status: 'fled' }] });
  await assert.rejects(commitAction(action.payload), /nicht aktiv/);
  assert.equal((await record(ids[1])).combatProfile.hitPoints.current, 39);
});

test('auch ein Abschluss ohne EP schützt seine zugrundeliegenden Kampfhandlungen vor Rücknahme', async () => {
  await startFight();
  const action = await commitAction((await prepareAction()).payload);
  const current = await active();
  const ended = await encounter({ encounterId: current.encounterId, operation: 'end', outcome: 'draw', awardExperience: false });
  await assert.rejects(undo(action.id), /neuere Handlung/);
  await undo(ended.id);
  await undo(action.id);
  assert.equal((await record(ids[1])).combatProfile.hitPoints.current, 39);
});

test('vollständiges Duell bis null TP: Speicher und Replay stimmen nach jedem Beitrag überein', async () => {
  await startFight();
  let defeatedIndex = -1, actionCount = 0;
  for (let turn = 0; turn < 30; turn++) {
    const actorIndex = turn % 2;
    const action = await prepareAction({ actorIndex, natural: turn % 4 === 0 ? 20 : 15, kind: turn % 2 ? 'action' : 'speech' });
    await commitAction(action.payload);
    actionCount++;
    const states = deriveCombatStateFromComments(await history());
    for (let index = 0; index < 2; index++) {
      const currentRecord = await record(ids[index]);
      assert.equal(states.get(ids[index]).current, currentRecord.combatProfile.hitPoints.current);
      assert.ok(currentRecord.combatProfile.hitPoints.current >= 0);
      if (currentRecord.combatProfile.hitPoints.current === 0) defeatedIndex = index;
    }
    if (defeatedIndex >= 0) break;
  }
  assert.ok(defeatedIndex >= 0);
  const current = await active();
  assert.equal(current.participants.get(ids[defeatedIndex]).status, 'defeated');
  const ending = await encounter({ encounterId: current.encounterId, operation: 'end', outcome: 'victory',
    winningPartyId: defeatedIndex === 1 ? 'gafyr' : 'draig', endReason: 'incapacitation' });
  assert.equal(ending.combatEncounter.summary.actionCount, actionCount);
  assert.equal(ending.combatEncounter.summary.participants[defeatedIndex].after.current, 0);
  assert.equal((await record(ids[defeatedIndex])).combatProfile.hitPoints.current, 0);
  assert.equal(await active(), null);
});

test('Start lehnt eine Profilkennung ab, mit der spätere Angriffe nicht speicherbar wären', async () => {
  await assert.rejects(startFight({ participants: actorRecords.map((actor, index) => ({
    actorId: index ? actor.id : 'alias-gildas', name: actor.name, partyId: index ? 'draig' : 'gafyr', persistence: { kind: 'character', recordId: actor.id }
  })) }), /Profilquelle/);
  assert.equal((await history()).length, 0);
});
