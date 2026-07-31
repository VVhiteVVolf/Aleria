import assert from 'node:assert/strict';
import test from 'node:test';
import { rankSceneDiceParticipants } from '../modules/scene-dice/scene-dice-participants.js';

test('prioritizes recent active-scene commenters before cast and remaining characters', () => {
  const characters = [
    { id: 'anaraut', name: 'Anaraut Draig' },
    { id: 'liora', name: 'Liora' },
    { id: 'maelis', name: 'Maelis' },
    { id: 'zoran', name: 'Zoran' }
  ];
  const comments = [
    { characterId: 'anaraut', charName: 'Anaraut Draig', narrator: false, commentMode: 'character' },
    { characterId: 'liora', charName: 'Liora', narrator: false, commentMode: 'character' },
    { characterId: 'anaraut', charName: 'Anaraut Draig', narrator: false, commentMode: 'character' },
    { charName: 'Erzähler', narrator: true, commentMode: 'narrator' },
    { characterId: 'zoran', charName: 'Zoran', narrator: true, commentMode: 'scene-dice' }
  ];

  const ranked = rankSceneDiceParticipants(characters, comments, ['maelis']);
  assert.deepEqual(ranked.map(character => character.id), ['anaraut', 'liora', 'maelis', 'zoran']);
  assert.equal(ranked[0].sceneActivityCount, 2);
  assert.equal(ranked[1].sceneActivityCount, 1);
  assert.equal(ranked[2].scenePriority, 1);
  assert.equal(ranked[3].scenePriority, 2);
});
