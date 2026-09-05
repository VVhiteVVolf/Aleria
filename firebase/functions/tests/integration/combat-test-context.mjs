import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitCombatEncounter } from '../../src/mechanics/commit-combat-encounter.js';
import { commitCombatComment } from '../../src/mechanics/commit-combat-comment.js';
import { commitUndoMechanicalComment } from '../../src/mechanics/commit-undo-mechanical-comment.js';
import { getActiveCombatEncounter } from '../../../../AleriaAlmanach/modules/combat/combat-encounter-model.js';
import { sortSceneHistory } from '../../src/mechanics/trusted-scene-history.js';
import { compactMechanicalMetadata } from '../../../../AleriaAlmanach/modules/combat/combat-resolution-storage.js';

import { prepareTestAction } from './combat-test-actions.mjs';
export { CheckupDice } from './combat-test-actions.mjs';

const projectId = 'demo-aleria-combat-checkup';
if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8180') throw Error('This integration fixture requires the dedicated local emulator at 127.0.0.1:8180.');
initializeApp({ projectId });
export const database = getFirestore();
export const actorRecords = await Promise.all(['gildas-gafyr', 'gawain-draig'].map(async name =>
  JSON.parse(await readFile(new URL(`../../../../Charakter%20Archiv%20Exporte/${name}.json`, import.meta.url), 'utf8')).character));
export const ids = actorRecords.map(actor => String(actor.id));
export const threadId = 'temporary-gildas-gawain-checkup';
export const request = (data, uid = 'local-combat-tester') => ({ auth: { uid, token: { aleriaRole: 'player' } }, data });
export const encounter = event => commitCombatEncounter.run(request({ entryId: threadId, text: 'Lokaler Kampftest', metadata: { combatEncounter: event } }));
export const undo = commentId => commitUndoMechanicalComment.run(request({ entryId: threadId, commentId }));
export const record = async actorId => (await database.collection('characters').doc(actorId).get()).data();
export const history = async () => sortSceneHistory((await database.collection('comments').where('entryId', '==', threadId).get()).docs.map(doc => ({ id: doc.id, ...doc.data() })));
export const active = async () => getActiveCombatEncounter(await history());

export async function resetScene({ actors = actorRecords } = {}) {
  // This endpoint deletes only the disposable, fixed demo project above.
  const result = await fetch(`http://127.0.0.1:8180/emulator/v1/projects/${projectId}/databases/(default)/documents`, { method: 'DELETE' });
  if (!result.ok) throw Error(`Emulator reset failed: ${result.status}`);
  for (const actor of actors) await database.collection(actor.entityType === 'creature' ? 'creatures' : 'characters').doc(actor.sourceCreatureId || actor.id).set({
    id: actor.id, name: actor.name, title: actor.title || '', portrait: actor.portrait || '',
    combatProfile: actor.combatProfile, inventory: actor.inventory || {}, combatTeam: actor.combatTeam || ''
  });
}

export async function startFight(extra = {}) {
  return encounter({ encounterId: randomUUID(), operation: 'start', title: 'Gildas gegen Gawain', participants: actorRecords.map((actor, index) => ({
    actorId: actor.id, name: actor.name, partyId: index ? 'draig' : 'gafyr', partyName: index ? 'Draig' : 'Gafyr',
    persistence: { kind: 'character', recordId: actor.id }
  })), ...extra });
}

export async function prepareAction({ actorIndex = 0, ...options } = {}) {
  return prepareTestAction({ entryId: threadId, actorRecord: await record(ids[actorIndex]), targetRecords: [await record(ids[1 - actorIndex])], comments: await history(), ...options });
}

export const commitAction = (payload, uid) => commitCombatComment.run(request({ ...payload, metadata: compactMechanicalMetadata(payload.metadata) }, uid));
