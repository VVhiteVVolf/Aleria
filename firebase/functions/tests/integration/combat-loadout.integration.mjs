import assert from 'node:assert/strict';
import { after, beforeEach, test } from 'node:test';
import { database, history, threadId, commitAction, undo } from './combat-test-context.mjs';
import { createCombatParty } from './combat-party-context.mjs';
import { prepareTestAction } from './combat-test-actions.mjs';
import { deriveCombatStateFromComments } from '../../src/generated/combat/combat-state-model.js';

let party, actor, target, pairId, swordId;
beforeEach(async () => {
  party = await createCombatParty([{ key: 'guinevere', slug: 'guinevere-neidr', team: 'neidr' }, { key: 'gawain', slug: 'gawain-draig', team: 'draig' }], 'Lokale Waffenprobe');
  actor = await party.record('guinevere'); target = await party.record('gawain');
  pairId = actor.combatProfile.weapons.find(weapon => /Jagddolch/.test(weapon.name)).id;
  swordId = actor.combatProfile.weapons.find(weapon => /Schwert/.test(weapon.name)).id;
});
after(() => database.terminate());
const prepare = async (loadout, extra = {}) => prepareTestAction({ entryId: threadId, actorRecord: await party.record('guinevere'), targetRecords: [await party.record('gawain')], comments: await history(), loadout, actionId: `weapon:${loadout.rightWeaponId}`, natural: 5, ...extra });
const current = (resolution, resourceId) => resolution.actorResourceSnapshot.after.find(resource => resource.id === resourceId).current;

test('Server akzeptiert Wechsel zum Paar und Angriff im ersten Abschnitt kostenlos; beide Hände werden gespeichert', async () => {
  const prepared = await prepare({ rightWeaponId: pairId, leftWeaponId: pairId });
  const committed = await commitAction(prepared.payload);
  const actual = committed.mechanics.commentSegments[0].combatResolution;
  assert.equal(actual.serverValidated, true);
  assert.equal(actual.equipmentPreparation.free, true);
  assert.equal(current(actual, 'bonus-action'), 1);
  assert.equal(current(actual, 'action'), 0);
  assert.deepEqual(actual.actorEquippedWeaponSnapshot, prepared.segment.combatResolution.actorEquippedWeaponSnapshot);
  const replay = deriveCombatStateFromComments(await history()).get(actor.id);
  assert.equal(replay.equippedWeaponId, pairId);
  assert.equal(replay.offHandWeaponId, pairId);
});

test('ab zweitem Post kostet der Wechsel; Rücknahme stellt Waffenpaar und TP wieder her', async () => {
  await commitAction((await prepare({ rightWeaponId: pairId, leftWeaponId: pairId })).payload);
  const before = await history();
  const prepared = await prepare({ rightWeaponId: swordId, leftWeaponId: '' });
  const committed = await commitAction(prepared.payload);
  const actual = committed.mechanics.commentSegments[0].combatResolution;
  assert.equal(actual.equipmentPreparation.free, false);
  assert.equal(current(actual, 'bonus-action'), 0);
  assert.equal(current(actual, 'action'), 0);
  assert.equal(deriveCombatStateFromComments(await history()).get(actor.id).offHandWeaponId, '');
  await undo(committed.id);
  assert.equal((await history()).length, before.length);
  assert.equal(deriveCombatStateFromComments(await history()).get(actor.id).offHandWeaponId, pairId);
});

test('Server lehnt manipulierte fremde oder duplizierte Einzelwaffen ohne Teilbuchung ab', async () => {
  for (const invalid of [{ rightWeaponId: 'foreign', leftWeaponId: '' }, { rightWeaponId: swordId, leftWeaponId: swordId }]) {
    const prepared = await prepare({ rightWeaponId: pairId, leftWeaponId: pairId });
    prepared.payload.metadata.commentSegments[0].combatAction.loadout = invalid;
    const before = await history();
    await assert.rejects(commitAction(prepared.payload), /gehört nicht|einzelne Waffe/);
    assert.equal((await history()).length, before.length);
  }
});

test('ein im Client gefälschter Gratiswechsel nach dem ersten Post wird kostenpflichtig neu berechnet', async () => {
  await commitAction((await prepare({ rightWeaponId: pairId, leftWeaponId: pairId })).payload);
  const prepared = await prepare({ rightWeaponId: swordId, leftWeaponId: '' });
  prepared.payload.metadata.commentSegments[0].combatResolution.equipmentPreparation.free = true;
  prepared.payload.metadata.commentSegments[0].combatAction.loadout.free = true;
  const actual = (await commitAction(prepared.payload)).mechanics.commentSegments[0].combatResolution;
  assert.equal(actual.equipmentPreparation.free, false);
  assert.equal(current(actual, 'bonus-action'), 0);
});

test('mehrere Ziele bezahlen denselben Wechsel und dieselbe Aktion genau einmal', async () => {
  await commitAction((await prepare({ rightWeaponId: pairId, leftWeaponId: pairId })).payload);
  const record = await party.record('guinevere');
  record.combatProfile.abilities.push({ id: 'loadout-test-effect', name: 'Nur lokale Flächenprobe', active: true, combatUsable: true, delivery: 'ability', resolutionType: 'automatic', activationType: 'action', costs: [{ resourceId: 'action', amount: 1, scope: 'comment' }], effects: [{ id: 'test-effect', type: 'buff', target: 'selected', on: 'always', condition: { id: 'test-guard', name: 'Lokale Deckung', durationComments: 1, active: true } }] });
  await database.collection('characters').doc(actor.id).update({ combatProfile: record.combatProfile });
  const prepared = await prepare({ rightWeaponId: swordId, leftWeaponId: '' }, { actionId: 'ability:loadout-test-effect', targetRecords: [await party.record('gawain'), record] });
  const actual = (await commitAction(prepared.payload)).mechanics.commentSegments[0].combatResolutions;
  assert.equal(actual.length, 2);
  assert.equal(actual.filter(resolution => resolution.equipmentPreparation).length, 1);
  assert.equal(current(actual[0], 'bonus-action'), 0);
  assert.equal(current(actual[0], 'action'), 0);
});
