import assert from 'node:assert/strict';
import test from 'node:test';

import {
  findCombatNarrationContradictions,
  validateCombatNarration
} from '../src/mechanics/combat-narration-integrity.js';

test('server replaces a narrated hit when mechanics confirmed a miss', () => {
  const resolution = {
    actorName: 'Gawain', targetName: 'Duncan',
    attack: { hit: false, criticalFailure: false, resolutionMode: 'weapon-attack' }
  };
  const checked = validateCombatNarration(resolution, { source: 'aleria-gpt', text: 'Gawain trifft Duncan schwer.' });
  assert.equal(checked.source, 'deterministic-server');
  assert.match(checked.text, /verfehlt/);
  assert.deepEqual(checked.contradictions, ['miss-described-as-hit']);
});

test('server accepts immersive narration that does not contradict confirmed mechanics', () => {
  const resolution = {
    actorName: 'Gawain', targetName: 'Duncan', damage: { total: 7 },
    attack: { hit: true, criticalSuccess: false, resolutionMode: 'weapon-attack' }
  };
  const text = 'Die Klinge findet eine Lücke in Duncans Deckung.';
  const checked = validateCombatNarration(resolution, { source: 'aleria-gpt', text });
  assert.equal(checked.source, 'aleria-gpt');
  assert.equal(checked.text, text);
  assert.deepEqual(findCombatNarrationContradictions(resolution, text), []);
});

test('channeling cannot narrate an effect before completion', () => {
  const resolution = {
    actionType: 'channeling', actorName: 'Merlin', targetName: 'Ziel',
    actorChannelingSnapshot: { after: { actionName: 'Sturm', progress: 1, requiredComments: 3 } },
    attack: { hit: false, resolutionMode: 'channeling' }
  };
  const checked = validateCombatNarration(resolution, { source: 'aleria-gpt', text: 'Der Sturm trifft und verursacht Schaden.' });
  assert.equal(checked.source, 'deterministic-server');
  assert.match(checked.text, /1\/3/);
});

test('reine Heilung wird nicht als Angriff oder Treffer formuliert', () => {
  const resolution = {
    actorName: 'Guinevere', targetName: 'Gawain',
    attack: { hit: true, resolutionMode: 'automatic' },
    effectResults: [{ effect: { type: 'healing' }, applied: { restored: 6 } }]
  };
  const checked = validateCombatNarration(resolution, { source: 'aleria-gpt', text: 'Die Heilwirkung schließt einen Teil von Gawains Wunden.' });
  assert.equal(checked.source, 'aleria-gpt');
  assert.deepEqual(checked.contradictions, []);
});
