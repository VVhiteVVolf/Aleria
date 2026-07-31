import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSceneDiceNarrationQuery,
  cleanSceneDiceNarration,
  enrichSceneDiceNarrationRetrieval,
  getSceneDiceOutcomeProfile
} from '../modules/scene-dice/scene-dice-narration-core.js';

const lowPerceptionRoll = {
  formula: '1d20',
  purpose: 'Wahrnehmung',
  natural: 4,
  total: 4,
  keptDice: [4],
  terms: [{ kind: 'dice', sides: 20, count: 1 }]
};

test('classifies a four on a d20 as a very low outcome', () => {
  const profile = getSceneDiceOutcomeProfile(lowPerceptionRoll);
  assert.equal(profile.label, 'sehr niedrig');
  assert.equal(profile.ratio, 0.2);
  assert.equal(profile.natural, 4);
});

test('builds a neutral narrator prompt with scene history and user context', () => {
  const query = buildSceneDiceNarrationQuery({
    roll: lowPerceptionRoll,
    participant: { id: 'anaraut', name: 'Anaraut Draig' },
    situation: 'Anaraut begutachtet eine Tatwaffe.',
    snapshot: {
      moduleTitle: 'Mord im Hafen',
      pageTitle: 'Die Tatwaffe',
      pageText: 'Auf dem Tisch liegt eine beschädigte Klinge.',
      transcript: '[1] Erzähler: Die Wache legt die Klinge auf den Tisch.'
    }
  });
  assert.match(query, /neutraler Erzähler in der dritten Person/);
  assert.match(query, /Ergebnisqualität: sehr niedrig/);
  assert.match(query, /Anaraut begutachtet eine Tatwaffe/);
  assert.match(query, /Die Wache legt die Klinge auf den Tisch/);
  assert.match(query, /verrate nicht, was tatsächlich verborgen ist/);
});

test('places the current scene ahead of general retrieval and cleans model wrappers', () => {
  const enriched = enrichSceneDiceNarrationRetrieval({
    promptContext: 'Allgemeiner Almanach-Kontext',
    chunks: [{ sourceType: 'module-page', text: 'Allgemein' }],
    stats: {}
  }, {
    participant: { name: 'Anaraut Draig' },
    situation: 'Prüft die Klinge.',
    snapshot: { threadId: 'scene-1', moduleId: 'mord', pageText: 'Tatort', transcript: 'Bisheriger Verlauf' }
  });
  assert.equal(enriched.chunks[0].sourceType, 'current-scene-page');
  assert.equal(enriched.chunks[1].sourceType, 'current-scene-comments');
  assert.equal(enriched.stats.requiredSceneContextIncluded, true);
  assert.equal(cleanSceneDiceNarration('```text\nBeschreibung: Ihm fällt nichts Belastbares auf.\n```'), 'Ihm fällt nichts Belastbares auf.');
});
