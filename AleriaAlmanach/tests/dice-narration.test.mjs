import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildSceneDiceNarrationQuery,
  cleanSceneDiceNarration,
  enrichSceneDiceNarrationRetrieval,
  getSceneDiceOutcomeProfile
} from '../modules/scene-dice/scene-dice-narration-core.js';
import {
  DEFAULT_SCENE_DICE_NARRATION_MODE,
  createSceneDiceStandardNarration,
  findSceneDiceMechanicsLeaks,
  getSceneDiceHumorInstruction,
  getSceneDiceNarrationModes,
  normalizeSceneDiceNarrationMode
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

test('prioritizes the complete combat sheet for character-bound scene rolls', () => {
  const enriched = enrichSceneDiceNarrationRetrieval({ chunks: [], stats: {} }, {
    roll: lowPerceptionRoll,
    participant: {
      id: 'anaraut',
      name: 'Anaraut Draig',
      combatProfile: {
        resources: [{ id: 'focus', name: 'Fokus', current: 2, maximum: 4 }],
        conditions: [{ id: 'wounded', name: 'Verwundet', active: true }]
      }
    },
    snapshot: { threadId: 'scene-1', moduleId: 'mord', pageText: 'Tatort', transcript: 'Verlauf' }
  });
  assert.equal(enriched.chunks[0].sourceType, 'character-combat-profile');
  assert.equal(enriched.stats.requiredCombatProfileIncluded, true);
  assert.match(enriched.promptContext, /Fokus/);
  assert.match(enriched.promptContext, /Verwundet/);
});

test('adds creature identity, tactics and loot as required scene context', () => {
  const enriched = enrichSceneDiceNarrationRetrieval({ chunks: [], stats: {} }, {
    roll: lowPerceptionRoll,
    participant: {
      id: 'frostspinne',
      entityType: 'creature',
      name: 'Frostbiss-Spinne',
      type: 'Kreatur',
      species: 'Riesenspinne',
      habitat: 'Eishöhlen',
      challengeRating: 3,
      size: 'Mittel',
      notes: 'Greift bevorzugt isolierte Ziele an.',
      loot: {
        currency: '3 Silber',
        notes: 'Giftzahn vorsichtig bergen.',
        items: [{ name: 'Frostdrüse', quantity: 1, chance: 70, notes: 'intakt halten' }]
      },
      combatProfile: { hitPoints: { current: 27, maximumOverride: 27 }, armorClass: { override: 14 } }
    },
    snapshot: { threadId: 'scene-1', moduleId: 'jagd', pageText: 'Eishöhle', transcript: 'Verlauf' }
  });
  assert.deepEqual(enriched.chunks.slice(0, 2).map(chunk => chunk.sourceType), ['character-combat-profile', 'creature-profile']);
  assert.match(enriched.promptContext, /Riesenspinne/);
  assert.match(enriched.promptContext, /isolierte Ziele/);
  assert.match(enriched.promptContext, /Frostdrüse/);
  assert.match(enriched.promptContext, /70%/);
});

test('offers distinct narration modes and deterministic non-AI behavior', () => {
  const modes = getSceneDiceNarrationModes();
  assert.equal(DEFAULT_SCENE_DICE_NARRATION_MODE, 'simple');
  assert.equal(normalizeSceneDiceNarrationMode(), 'simple');
  assert.equal(normalizeSceneDiceNarrationMode('unknown'), 'simple');
  assert.deepEqual(modes.map(mode => mode.id), ['immersive', 'character', 'dramatic', 'simple', 'standard']);
  assert.equal(modes.find(mode => mode.id === 'simple')?.usesAi, false);
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
