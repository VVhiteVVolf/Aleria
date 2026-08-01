import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSceneDiceNarrationQuery,
  cleanSceneDiceNarration,
  enrichSceneDiceNarrationRetrieval,
  getSceneDiceOutcomeProfile
} from '../modules/scene-dice/scene-dice-narration-core.js';
import {
  createSceneDiceStandardNarration,
  findSceneDiceMechanicsLeaks,
  getSceneDiceHumorInstruction,
  getSceneDiceNarrationModes
} from '../modules/scene-dice/scene-dice-narration-policy.js';

const lowPerceptionRoll = {
  formula: '1d20',
  purpose: 'Wahrnehmung',
  natural: 4,
  total: 4,
  keptDice: [4],
  terms: [{ kind: 'dice', sides: 20, count: 1 }],
  narrationMode: 'character',
  humorEnabled: true
};

test('classifies a four on a d20 as a very low outcome', () => {
  const profile = getSceneDiceOutcomeProfile(lowPerceptionRoll);
  assert.equal(profile.label, 'sehr niedrig');
  assert.equal(profile.ratio, 0.2);
  assert.equal(profile.natural, 4);
});

test('keeps the immersive prompt inside the Cloudflare query limit', () => {
  const query = buildSceneDiceNarrationQuery({
    roll: lowPerceptionRoll,
    participant: { id: 'anaraut', name: 'Anaraut Draig' },
    situation: 'Anaraut begutachtet eine Tatwaffe und sucht nach ungewöhnlichen Spuren.',
    snapshot: {
      moduleTitle: 'Mord im Hafen',
      pageTitle: 'Die Tatwaffe',
      pageText: 'Auf dem Tisch liegt eine beschädigte Klinge.',
      transcript: '[1] Erzähler: Die Wache legt die Klinge auf den Tisch.'
    }
  });
  assert.ok(query.length <= 1180);
  assert.match(query, /Nur intern zur Abstufung: 4 auf W20/);
  assert.match(query, /Nie Würfel, Wurf, Ergebnis, Zahlenwert/);
  assert.match(query, /etablierte Persönlichkeit/);
  assert.match(query, /Humorregel:/);
  assert.doesNotMatch(query, /Die Wache legt die Klinge/);
});

test('places full scene and character context in retrieval instead of the truncated query', () => {
  const enriched = enrichSceneDiceNarrationRetrieval({
    promptContext: 'Persönlichkeit: Anaraut ist geduldig, trocken und außerordentlich gründlich.',
    chunks: [{ sourceType: 'character-profile', text: 'Anaraut arbeitet beharrlich.' }],
    stats: {}
  }, {
    roll: lowPerceptionRoll,
    participant: { name: 'Anaraut Draig' },
    situation: 'Prüft die Klinge.',
    snapshot: { threadId: 'scene-1', moduleId: 'mord', pageText: 'Tatort', transcript: 'Bisheriger Verlauf' }
  });
  assert.equal(enriched.chunks[0].sourceType, 'current-scene-page');
  assert.equal(enriched.chunks[1].sourceType, 'current-scene-comments');
  assert.equal(enriched.stats.requiredSceneContextIncluded, true);
  assert.equal(enriched.stats.sceneDiceNarrationMode, 'character');
  assert.match(enriched.promptContext, /Bisheriger Verlauf/);
  assert.match(enriched.promptContext, /Anaraut ist geduldig/);
});

test('offers distinct narration modes and deterministic standard output', () => {
  assert.deepEqual(getSceneDiceNarrationModes().map(mode => mode.id), ['immersive', 'character', 'dramatic', 'standard']);
  assert.equal(createSceneDiceStandardNarration(lowPerceptionRoll, 'Anaraut Draig'), 'Anaraut Draig hat eine 4 gewürfelt.');
});

test('gives low rolls optional in-world humor but supports a serious mode', () => {
  const lowHumor = getSceneDiceHumorInstruction({ natural: 1, outcomeRatio: 0.05 }, true);
  assert.match(lowHumor, /leicht absurder In-World-Humor/);
  assert.match(getSceneDiceHumorInstruction(lowPerceptionRoll, false), /Humor ist ausgeschaltet/);
});

test('rejects mechanics in immersive prose and cleans model wrappers', () => {
  assert.deepEqual(findSceneDiceMechanicsLeaks('Der Wurf ergibt 4 und verrät ihr nichts.', lowPerceptionRoll), ['mechanics', 'result-number']);
  assert.deepEqual(findSceneDiceMechanicsLeaks('Das Ergebnis fällt entsprechend dürftig aus.', lowPerceptionRoll), ['mechanics']);
  assert.deepEqual(findSceneDiceMechanicsLeaks('Anaraut dreht die Klinge gegen das Licht; mehr als alte Scharten gibt sie nicht preis.', lowPerceptionRoll), []);
  assert.equal(cleanSceneDiceNarration('```text\nBeschreibung: Ihm fällt nichts Belastbares auf.\n```'), 'Ihm fällt nichts Belastbares auf.');
});
