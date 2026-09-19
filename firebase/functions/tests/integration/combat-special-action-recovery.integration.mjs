import assert from 'node:assert/strict';
import test, { after } from 'node:test';
import { database, ids, threadId, resetScene, startFight, history, prepareAction, commitAction, record } from './combat-test-context.mjs';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../../../../AleriaAlmanach/modules/combat/combat-state-model.js';
import { resolveCombatProfile } from '../../../../AleriaAlmanach/modules/combat/combat-profile-resolver.js';
import { getSceneRecoveryDayKey } from '../../../../AleriaAlmanach/modules/scene-time/scene-recovery-day.js';
import { recoverDailyCombatResources } from '../../../../AleriaAlmanach/modules/combat/combat-action-economy.js';

after(() => database.terminate());
const special = resources => resources.find(resource => resource.id === 'special-action');

test('Gawains Schweifkreis und Flügelschritt bleiben nach Speichern und Neuladen bei 0/2', async () => {
  await resetScene();
  await database.collection('comments').doc('morning-clock-day-2').set({
    entryId: threadId, orderKey: 1, serverCommitted: true, mechanicalAudit: true,
    commentMode: 'scene-time', sceneTimeEvent: {
      presetKey: 'morning', anchorDay: 2, anchorSeconds: 32400, segmentBreak: false
    }
  });
  await startFight();
  const first = await prepareAction({ actorIndex: 1, actionId: 'technique:combat-style-drachentanz-jungdrache-04-schweifkreis' });
  const second = await prepareAction({ actorIndex: 1, actionId: 'technique:combat-style-drachentanz-jungdrache-fluegelschritt', priorSegments: [first.segment] });
  const third = await prepareAction({ actorIndex: 1, actionId: 'technique:combat-style-drachentanz-jungdrache-geschlossene-schuppe', priorSegments: [first.segment, second.segment] });
  const saved = await commitAction(third.payload);
  assert.deepEqual(saved.mechanics.commentSegments.map(segment => special(segment.combatResolution.actorResourceSnapshot.after).current), [1, 0, 0]);
  const stored = await record(ids[1]);
  assert.equal(special(stored.combatProfile.resources).current, 0);

  const comments = await history();
  const state = deriveCombatStateFromComments(comments).get(ids[1]);
  const profile = overlayCombatHitPointState(resolveCombatProfile(stored), state);
  const key = getSceneRecoveryDayKey(threadId, comments);
  assert.equal(key, `scene:${threadId}:day-2`);
  assert.equal(special(recoverDailyCombatResources(profile.resources, key)).current, 0);
  await assert.rejects(prepareAction({ actorIndex: 1, actionId: first.segment.combatAction.profileActionId }), /Besondere Aktion/);

  // A stale client claiming a fresh pool must also be rejected by the server.
  await assert.rejects(commitAction(first.payload), /Besondere Aktion/);
  assert.equal(special((await record(ids[1])).combatProfile.resources).current, 0);
  assert.equal((await history()).length, comments.length);

  await database.collection('comments').doc('next-day').set({
    entryId: threadId, orderKey: Date.now() + 1000, serverCommitted: true, mechanicalAudit: true,
    sceneTimeEvent: { presetKey: 'next-day', anchorDay: 3, anchorSeconds: 32400, segmentBreak: true }
  });
  const recovered = await prepareAction({ actorIndex: 1, actionId: first.segment.combatAction.profileActionId });
  assert.equal(special(recovered.segment.combatResolution.actorResourceSnapshot.before).current, 2);
  const nextDay = await commitAction(recovered.payload);
  assert.equal(special(nextDay.mechanics.commentSegments[0].combatResolution.actorResourceSnapshot.after).current, 1);
});
