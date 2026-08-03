import test from 'node:test';
import assert from 'node:assert/strict';

import {
  applySceneRestCommentToStateMap,
  buildSceneRestParticipant,
  recoverSceneRestResources
} from '../modules/scene-rest/scene-rest-model.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';

const resources = [
  { id: 'action', name: 'Aktion', current: 0, maximum: 1, scope: 'comment', recovery: 'scene' },
  { id: 'stamina', name: 'Ausdauer', current: 1, maximum: 4, scope: 'persistent', recovery: 'short-rest' },
  { id: 'mana-focus', name: 'Mana', current: 2, maximum: 10, scope: 'persistent', recovery: 'long-rest' },
  { id: 'aura-focus', name: 'Aura', current: 0, maximum: 3, scope: 'persistent', recovery: 'day' },
  { id: 'manual', name: 'Questladung', current: 1, maximum: 2, scope: 'persistent', recovery: 'manual' }
];

test('kurze Rast heilt vollständig und füllt nur Kurzrast- sowie Kommentarressourcen', () => {
  const participant = buildSceneRestParticipant({
    characterId: 'gawain',
    name: 'Gawain',
    currentHitPoints: 7,
    maximumHitPoints: 31,
    temporaryHitPoints: 4,
    resources,
    abilities: [
      { id: 'breath', name: 'Drachenatem', usesCurrent: 0, usesMaximum: 2, recovery: 'short-rest' },
      { id: 'oath', name: 'Eidbruch', usesCurrent: 0, usesMaximum: 1, recovery: 'long-rest' }
    ]
  }, 'short');

  assert.deepEqual(participant.after.hitPoints, { current: 31, maximum: 31, temporary: 4 });
  assert.equal(participant.after.resources.find(item => item.id === 'action').current, 1);
  assert.equal(participant.after.resources.find(item => item.id === 'stamina').current, 4);
  assert.equal(participant.after.resources.find(item => item.id === 'mana-focus').current, 2);
  assert.equal(participant.after.resources.find(item => item.id === 'aura-focus').current, 0);
  assert.equal(participant.after.resources.find(item => item.id === 'manual').current, 1);
  assert.equal(participant.after.abilities.find(item => item.id === 'breath').usesCurrent, 2);
  assert.equal(participant.after.abilities.find(item => item.id === 'oath').usesCurrent, 0);
});

test('lange Rast füllt keine Tagesressourcen ohne tatsächlichen Tageswechsel', () => {
  const recovered = recoverSceneRestResources(resources, 'long', 'scene:test:day-2');
  assert.equal(recovered.find(item => item.id === 'action').current, 1);
  assert.equal(recovered.find(item => item.id === 'stamina').current, 4);
  assert.equal(recovered.find(item => item.id === 'mana-focus').current, 10);
  assert.equal(recovered.find(item => item.id === 'aura-focus').current, 0);
  assert.equal(recovered.find(item => item.id === 'aura-focus').recoveryDayKey, undefined);
  assert.equal(recovered.find(item => item.id === 'manual').current, 1);
});

test('ein echter Tageswechsel füllt Tagesressourcen unabhängig von der Rast-Art', () => {
  const recovered = recoverSceneRestResources(resources, 'short', 'scene:test:day-2', { dayChanged: true });
  assert.equal(recovered.find(item => item.id === 'aura-focus').current, 3);
  assert.equal(recovered.find(item => item.id === 'aura-focus').recoveryDayKey, 'scene:test:day-2');
  assert.equal(recovered.find(item => item.id === 'mana-focus').current, 2);
});

test('Rasteinträge werden beim historischen Kampfzustand an der richtigen Stelle angewendet', () => {
  const damageComment = {
    id: 'damage',
    commentSegments: [{
      combatResolution: {
        actorId: 'bandit',
        targetId: 'gawain',
        targetSnapshot: {
          hitPointsAfter: 5,
          maximumHitPoints: 20,
          temporaryHitPointsAfter: 0
        }
      }
    }]
  };
  const restParticipant = buildSceneRestParticipant({
    characterId: 'gawain',
    name: 'Gawain',
    currentHitPoints: 5,
    maximumHitPoints: 20,
    resources
  }, 'long');
  const restComment = { id: 'rest', sceneRest: { type: 'long', participants: [restParticipant] } };
  const after = deriveCombatStateFromComments([damageComment, restComment]);
  const beforeRest = deriveCombatStateFromComments([damageComment, restComment], { commentId: 'rest' });

  assert.equal(beforeRest.get('gawain').current, 5);
  assert.equal(after.get('gawain').current, 20);
  assert.equal(after.get('gawain').resources.find(item => item.id === 'mana-focus').current, 10);
});

test('mehrere Kreatureninstanzen werden getrennt erholt', () => {
  const states = new Map([
    ['skeleton-i', { current: 2, maximum: 9 }],
    ['skeleton-ii', { current: 6, maximum: 9 }]
  ]);
  applySceneRestCommentToStateMap(states, {
    sceneRest: {
      type: 'short',
      participants: [buildSceneRestParticipant({ characterId: 'skeleton-i', name: 'Skelett I.', currentHitPoints: 2, maximumHitPoints: 9 }, 'short')]
    }
  });
  assert.equal(states.get('skeleton-i').current, 9);
  assert.equal(states.get('skeleton-ii').current, 6);
});
