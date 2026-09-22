import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitCombatEncounter } from '../../src/mechanics/commit-combat-encounter.js';
import { commitCombatCommentOperation } from '../../src/mechanics/commit-combat-comment.js';
import { undoMechanicalCommentOperation } from '../../src/mechanics/commit-undo-mechanical-comment.js';
import { placeSceneItem } from '../../src/mechanics/commit-scene-item.js';
import { sortSceneHistory } from '../../src/mechanics/trusted-scene-history.js';
import { prepareTestAction, CheckupDice } from './combat-test-actions.mjs';
import { compactMechanicalMetadata } from '../../../../AleriaAlmanach/modules/combat/combat-resolution-storage.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { deriveSceneItems } from '../../../../AleriaAlmanach/modules/scene-items/scene-items-model.js';

const projectId = 'demo-aleria-item-duels';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8182') throw Error('Only the dedicated local Firestore emulator at 127.0.0.1:8182 is allowed.');
initializeApp({ projectId });
export const database = getFirestore();
export const threadId = 'isolated-item-duel';
export const auth = { uid: 'local-item-tester', token: { aleriaRole: 'admin' } };
const registry = JSON.parse(await readFile(new URL('../../../../CharakterDatenbank/registry.json', import.meta.url), 'utf8'));
export const characters = await Promise.all(['Gais Wyrm', 'Nudd Saethwyr', 'Gildas Gafyr', 'Gawain Draig'].map(async name => {
  const row = registry.records.find(row => row.name === name);
  assert.ok(row, `${name}: character entry exists`);
  return JSON.parse(await readFile(new URL('../../../../CharakterDatenbank/' + row.path, import.meta.url), 'utf8')).character;
}));
export const fighters = characters.filter(character => character.combatProfile);
export const ids = fighters.map(character => character.id);
export const record = async id => (await database.collection('characters').doc(id).get()).data();
export const history = async () => sortSceneHistory((await database.collection('comments').where('entryId', '==', threadId).get()).docs.map(doc => ({ id: doc.id, ...doc.data() })));
export const ground = async () => deriveSceneItems(await history());
export const current = async id => overlayCombatHitPointState(resolveCombatProfile(await record(id)), deriveCombatStateFromComments(await history()).get(id));
export const encounter = data => commitCombatEncounter.run({ auth, data: { entryId: threadId, text: 'Isolierte Duellprobe', metadata: { combatEncounter: data } } });
export const undo = commentId => undoMechanicalCommentOperation({ auth, data: { entryId: threadId, commentId } }, { database });
export const place = item => placeSceneItem({ database, auth, input: { entryId: threadId, operationId: randomUUID(), ...item } });
export const commit = (payload, roll = 6) => commitCombatCommentOperation({ auth, data: { ...payload, metadata: compactMechanicalMetadata(payload.metadata) } }, { database, rollCritical: () => roll });

export async function reset({ actors = fighters, legacy = false } = {}) {
  const response = await fetch(`http://127.0.0.1:8182/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' });
  assert.ok(response.ok, 'Only the disposable demo project is reset');
  for (const actor of actors) await database.collection('characters').doc(actor.id).set({
    id: actor.id, name: actor.name, title: actor.title || '', portrait: actor.portrait || '',
    combatProfile: structuredClone(actor.combatProfile), inventory: structuredClone(actor.inventory || {}), combatTeam: actor.combatTeam || ''
  });
  const started = await encounter({ encounterId: randomUUID(), operation: 'start', combatType: 'training', awardExperience: false,
    participants: actors.map((actor, index) => ({ actorId: actor.id, name: actor.name, partyId: `side-${index}`, persistence: { kind: 'character', recordId: actor.id } })) });
  if (legacy) await database.collection('comments').doc(started.id).update({ 'combatEncounter.criticalEffectsVersion': 0 });
  return started;
}

export async function strike({ attacker = ids[0], target = ids[1], actionId = '', natural = 15, roll = 6, priorSegments = [], dice, weaponGrip = 'one-handed', loadout = null } = {}) {
  const prepared = await prepareTestAction({ entryId: threadId, actorRecord: await record(attacker), targetRecords: [await record(target)], comments: await history(),
    natural, dice: dice || new CheckupDice(natural), actionId, priorSegments, weaponGrip, loadout });
  const saved = await commit(prepared.payload, roll);
  const expected = prepared.segment.combatResolution, actual = saved.mechanics.commentSegments.at(-1).combatResolution;
  assert.equal(actual.damage?.total, expected.damage?.total, 'Client/server damage parity');
  assert.equal(actual.targetSnapshot.hitPointsAfter, expected.targetSnapshot.hitPointsAfter, 'Client/server HP parity');
  assert.deepEqual(actual.actorResourceSnapshot.after.map(resource => [resource.id, resource.current]), expected.actorResourceSnapshot.after.map(resource => [resource.id, resource.current]), 'Client/server resource parity');
  return { saved, actual, expected, prepared };
}

export function itemSegment(actorId, entry, { operation = 'pickup', paymentResource = '' } = {}) {
  return { kind: operation === 'consume' ? 'consume' : 'interact', commentKind: operation === 'consume' ? 'consume' : 'interact', actorId, characterId: actorId, text: 'Gegenstandsaktion im Test',
    inventorySource: 'scene', sceneItemId: entry.sceneItemId, inventoryOperation: operation, inventoryPaymentResource: paymentResource,
    inventoryUse: { actorId, actorPersistence: { kind: 'character', recordId: actorId }, item: entry.item, source: 'scene', sceneItemId: entry.sceneItemId, operation, paymentResource } };
}

export async function useItem(actorId, segment) {
  return commit({ entryId: threadId, text: segment.text, charName: (await record(actorId)).name, metadata: { characterId: actorId, commentSegments: [segment] } });
}

export { CheckupDice, prepareTestAction };
