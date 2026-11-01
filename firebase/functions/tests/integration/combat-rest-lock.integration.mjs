import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { randomUUID } from 'node:crypto';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { commitCombatEncounter } from '../../src/mechanics/commit-combat-encounter.js';
import { commitSceneRestOperation } from '../../src/mechanics/commit-scene-rest.js';
import { commitItemDefinitionOperation } from '../../src/items/commit-item-definition.js';
import { getActiveCombatEncounter } from '../../src/generated/combat/combat-encounter-model.js';
import { sortSceneHistory } from '../../src/mechanics/trusted-scene-history.js';

if (process.env.FIRESTORE_EMULATOR_HOST !== '127.0.0.1:8187') throw new Error('Only the dedicated local emulator at 127.0.0.1:8187 is allowed.');
initializeApp({ projectId: 'demo-aleria-combat-checkup' });
const database = getFirestore();
after(() => database.terminate());
const auth = { uid: 'isolated-combat-checkup', token: { aleriaRole: 'admin' } };

test('real encounter locks prevent rest healing and charge recovery until the encounter ends', async () => {
  const id = `rest-lock-${randomUUID()}`, opponent = `${id}-opponent`, battleEntry = `${id}-battle`, restEntry = `${id}-rest`;
  const source = actorId => ({ id: actorId, name: actorId, ownerUid: auth.uid, inventory: { revision: 1, items: [] },
    combatProfile: { hitPoints: { current: 4, maximumOverride: 20 }, weapons: [], progression: { level: 1 } } });
  await database.doc(`characters/${id}`).set(source(id));
  await database.doc(`characters/${opponent}`).set(source(opponent));
  const defined = await commitItemDefinitionOperation(database, auth, { action: 'save', operationId: `${id}-define`,
    definition: { id: `item:${id}`, title: 'Prüffokus', category: 'arkanes',
      useDefinition: { mode: 'use', chargesMaximum: 2, chargesPerUse: 1, recovery: 'short-rest' } } });
  await commitItemDefinitionOperation(database, auth, { action: 'grant', operationId: `${id}-grant`, recordId: id,
    expectedRevision: 1, definitionRef: defined.template.definitionRef });
  const actorRef = database.doc(`characters/${id}`), record = (await actorRef.get()).data();
  record.inventory.items[0].itemState = { chargesCurrent: 0 };
  await actorRef.update({ inventory: record.inventory });
  const encounter = combatEncounter => commitCombatEncounter.run({ auth, data: { entryId: battleEntry, text: 'Isolierte Kampfprobe.', metadata: { combatEncounter } } });
  await encounter({ operation: 'start', encounterId: id, combatType: 'training', awardExperience: false,
    participants: [id, opponent].map((actorId, index) => ({ actorId, name: actorId, partyId: String(index), persistence: { kind: 'character', recordId: actorId } })) });
  const restRequest = { auth, data: { entryId: restEntry, text: 'Eine Stunde Rast.', metadata: {
    sceneRest: { type: 'short', durationSeconds: 3600, participants: [{ actorId: id, persistence: { kind: 'character', recordId: id } }] },
    sceneTimeEvent: { anchorDay: 1, anchorSeconds: 3600 } } } };
  const before = (await actorRef.get()).data();
  await assert.rejects(commitSceneRestOperation(restRequest, { database }), /aktiven Kampf/);
  assert.deepEqual((await actorRef.get()).data(), before);
  assert.equal((await database.collection('comments').where('entryId', '==', restEntry).get()).size, 0);
  const history = sortSceneHistory((await database.collection('comments').where('entryId', '==', battleEntry).get()).docs.map(doc => ({ id: doc.id, ...doc.data() })));
  const active = getActiveCombatEncounter(history);
  await encounter({ operation: 'end', encounterId: id, outcome: 'draw', expectedRevision: active.revision, awardExperience: false });
  await commitSceneRestOperation(restRequest, { database });
  const rested = (await actorRef.get()).data();
  assert.equal(rested.combatProfile.hitPoints.current, 20);
  assert.equal(rested.inventory.items[0].itemState.chargesCurrent, 2);
});
