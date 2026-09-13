import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { actorRecords, database, ids, resetScene, startFight, prepareAction, commitAction, history, undo, record } from './combat-test-context.mjs';

beforeEach(async () => { await resetScene(); await startFight(); });
after(() => database.terminate());
const current = (resolution, id) => resolution.actorResourceSnapshot.after.find(resource => resource.id === id).current;

test('Server berechnet Zweihandabzug neu, ignoriert manipulierte Vorschau und erlaubt Rücknahme', async () => {
  const prepared = await prepareAction({ weaponGrip: 'two-handed' });
  const attackTotal = prepared.segment.combatResolution.attack.total;
  prepared.payload.metadata.commentSegments[0].combatResolution.attack.total += 10;
  const beforeTarget = await record(ids[1]);
  const committed = await commitAction(prepared.payload);
  const actual = committed.mechanics.commentSegments[0].combatResolution;
  assert.equal(actual.serverValidated, true);
  assert.equal(actual.weaponGrip, 'two-handed');
  assert.equal(current(actual, 'action'), 0);
  assert.equal(current(actual, 'bonus-action'), 1);
  assert.equal(actual.attack.total, attackTotal);
  await undo(committed.id);
  assert.equal((await record(ids[1])).combatProfile.hitPoints.current, beforeTarget.combatProfile.hitPoints.current);
  assert.equal((await history()).length, 1);
});

test('Bonusaktion und anschließender Zweihandangriff teilen denselben Gesamtbeitrag', async () => {
  const first = await prepareAction({ actionId: 'technique:combat-style-drachentanz-jungdrache-01-erster-hieb' });
  const next = await prepareAction({ priorSegments: [first.segment], weaponGrip: 'two-handed' });
  const committed = await commitAction(next.payload);
  assert.equal(current(committed.mechanics.commentSegments[1].combatResolution, 'action'), 0);
  assert.equal(current(committed.mechanics.commentSegments[1].combatResolution, 'bonus-action'), 0);
  assert.equal((await history()).length, 2);
});

test('Server weist Zweihandgriff mit nachträglich ausgerüstetem Schild ohne Teilbuchung zurück', async () => {
  const prepared = await prepareAction({ weaponGrip: 'two-handed' });
  const actor = await record(ids[0]);
  actor.combatProfile.armorItems.push({ id: 'local-shield', name: 'Lokaler Prüfschild', kind: 'shield', armorClassBonus: 2, equipped: true });
  await database.collection('characters').doc(ids[0]).update({ combatProfile: actor.combatProfile });
  await assert.rejects(commitAction(prepared.payload), /Schild/);
  assert.equal((await history()).length, 1);
  assert.equal((await record(ids[1])).combatProfile.hitPoints.current, actorRecords[1].combatProfile.hitPoints.current);
});
