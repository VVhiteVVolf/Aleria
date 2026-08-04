import assert from 'node:assert/strict';
import test from 'node:test';

import {
  buildSkillRollNotation,
  classifySkillCheck,
  collectRevealedChallengeIds,
  collectRecentSkillChallenges,
  collectSkillChallenges,
  getChallengeAffinityModifier,
  getSkillsForCommentKind,
  isSuccessfulSkillOutcome,
  normalizeMechanicMode,
  normalizeSkillChallenge,
  resolveSkillModifier
} from '../modules/skill-checks/skill-check-model.js';
import {
  narrateSkillResolution,
  skillNarrationInternals
} from '../modules/skill-checks/skill-check-narration.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';

function makeCharacter(skills = []) {
  return {
    id: 'test-figure',
    name: 'Testfigur',
    combatProfile: {
      progression: { level: 5 },
      attributes: [
        { key: 'strength', score: 14 },
        { key: 'dexterity', score: 12 },
        { key: 'constitution', score: 10 },
        { key: 'intelligence', score: 16 },
        { key: 'wisdom', score: 14 },
        { key: 'charisma', score: 18 }
      ],
      skills,
      resources: []
    }
  };
}

class FixedSkillDice {
  async rollSkill({ modifier }) {
    return { id: 'skill-roll', natural: 10, dice: [10], keptDice: [10], total: 10 + modifier };
  }
}

test('ordnet jeder geforderten Sprechblase nur ihre passenden Fertigkeiten zu', () => {
  assert.deepEqual(getSkillsForCommentKind('speech').map(skill => skill.id), ['persuasion']);
  assert.deepEqual(getSkillsForCommentKind('performance').map(skill => skill.id), ['deception', 'performance']);
  assert.deepEqual(getSkillsForCommentKind('thought').map(skill => skill.id), ['insight', 'investigation', 'religion']);
  assert.deepEqual(getSkillsForCommentKind('interact').map(skill => skill.id), ['medicine', 'sleight-of-hand', 'acrobatics', 'athletics', 'body-control', 'survival']);
  assert.deepEqual(getSkillsForCommentKind('flirt').map(skill => skill.id), ['seduction']);
  assert.equal(getSkillsForCommentKind('flirt')[0].label, 'Flirten');
});

test('laufende Zustände verändern auch den echten Fertigkeitsmodifikator', () => {
  const base = resolveCombatProfile(makeCharacter());
  const affected = overlayCombatHitPointState(base, {
    temporaryConditions: [{
      id: 'verunsichert',
      name: 'Verunsichert',
      active: true,
      mechanics: { skill: -2 },
      durationModel: { kind: 'scene-comments', remainingSceneComments: 2 }
    }]
  });
  assert.equal(resolveSkillModifier(affected, 'persuasion').modifier, 2);
});

test('Fertigkeitsauswertung verrechnet Zielregeln und gewählte Unterstützung', async () => {
  const actor = resolveCombatProfile(makeCharacter());
  const target = resolveCombatProfile({
    ...makeCharacter(), id: 'target', name: 'Gegenspieler',
    combatProfile: {
      ...makeCharacter().combatProfile,
      quirks: [{
        id: 'unsettling', name: 'Verunsichernde Präsenz', active: true,
        triggerRules: [{
          id: 'unsettling-skill', name: 'Verunsichert den Gegner', enabled: true,
          phase: 'pre-roll', recipient: 'actor', sourceRelation: 'enemy', activation: 'passive',
          frequency: 'always', condition: 'always', actionKinds: ['skill'],
          effects: { skillModifier: -3 }
        }]
      }]
    }
  });
  const support = resolveCombatProfile({
    ...makeCharacter(), id: 'support', name: 'Unterstützer',
    combatProfile: {
      ...makeCharacter().combatProfile,
      aura: {
        enabled: true,
        name: 'Ermutigende Aura',
        latentPresence: {
          enabled: true, active: true, name: 'Ermutigende Aura', target: 'Verbündete',
          allyMechanics: { skill: 2 }
        }
      }
    }
  });
  const result = await new SkillResolutionService(new FixedSkillDice()).resolve({
    actor: { id: actor.characterId, name: actor.name },
    settings: { skillId: 'persuasion', difficulty: 10 }
  }, {
    actorProfile: actor,
    targetProfile: target,
    ruleSources: [
      { actorId: actor.characterId, actorName: actor.name, profile: actor, sourceRole: 'actor', relationToActor: 'self', relationToTarget: 'enemy', selectedRuleIds: [] },
      { actorId: target.characterId, actorName: target.name, profile: target, sourceRole: 'target', relationToActor: 'enemy', relationToTarget: 'self', selectedRuleIds: [] },
      { actorId: support.characterId, actorName: support.name, profile: support, sourceRole: 'support', relationToActor: 'ally', relationToTarget: 'enemy', selectedRuleIds: ['@aura:actor'] }
    ]
  });
  assert.equal(result.profileModifier, 4);
  assert.equal(result.ruleModifier, -1);
  assert.equal(result.total, 13);
  assert.deepEqual(result.ruleApplications.map(rule => rule.sourceActorId).sort(), ['support', 'target']);
});

test('bleibt ein neuer Abschnitt standardmäßig rein erzählerisch', () => {
  assert.equal(normalizeMechanicMode('', { kind: 'combataction' }), 'normal');
  assert.equal(normalizeMechanicMode('', { kind: 'spell' }), 'normal');
  assert.equal(normalizeMechanicMode('skill', { kind: 'speech' }), 'skill');
});

test('erkennt alte gespeicherte Kampf- und Zauberauswertungen rückwärtskompatibel', () => {
  assert.equal(normalizeMechanicMode('', { kind: 'combataction', combatResolution: {} }), 'combat');
  assert.equal(normalizeMechanicMode('', { kind: 'song', combatAction: {} }), 'magic');
});

test('verwendet Fertigkeit und Attribut aus dem Charakterbogen', () => {
  const result = resolveSkillModifier(makeCharacter([{
    id: 'custom-persuasion',
    name: 'Überreden',
    attributeKey: 'charisma',
    proficiency: 'trained',
    bonus: 1
  }]), 'persuasion');
  assert.equal(result.source, 'character-sheet');
  assert.equal(result.modifier, 8); // CHA +4, Kompetenz +3 auf Stufe 5, eigener Bonus +1
});

test('fällt bei leerer Fertigkeit transparent auf das zugehörige Attribut zurück', () => {
  const result = resolveSkillModifier(makeCharacter([]), 'investigation');
  assert.equal(result.source, 'attribute-fallback');
  assert.equal(result.modifier, 3);
});

test('wendet bevorzugten Bonus und alternative Erschwernis der Herausforderung an', () => {
  const challenge = normalizeSkillChallenge({
    id: 'lie-1',
    enabled: true,
    difficulty: 15,
    preferredSkills: ['insight', 'persuasion'],
    preferredModifier: 2,
    alternativeModifier: -2
  });
  assert.equal(getChallengeAffinityModifier(challenge, 'insight'), 2);
  assert.equal(getChallengeAffinityModifier(challenge, 'deception'), -2);
});

test('wertet natürliche 20 und 1 kritisch sowie den übrigen Wurf gegen SG aus', () => {
  assert.equal(classifySkillCheck({ natural: 20, total: 12, difficulty: 30 }), 'critical-success');
  assert.equal(classifySkillCheck({ natural: 1, total: 30, difficulty: 2 }), 'critical-failure');
  assert.equal(classifySkillCheck({ natural: 12, total: 17, difficulty: 15 }), 'success');
  assert.equal(classifySkillCheck({ natural: 8, total: 11, difficulty: 15 }), 'failure');
  assert.equal(isSuccessfulSkillOutcome('critical-success'), true);
  assert.equal(isSuccessfulSkillOutcome('failure'), false);
});

test('baut normale, Vorteils- und Nachteilswürfe mit Modifier', () => {
  assert.equal(buildSkillRollNotation(4, 'normal'), '1d20+4');
  assert.equal(buildSkillRollNotation(-2, 'advantage'), '2d20kh1-2');
  assert.equal(buildSkillRollNotation(0, 'disadvantage'), '2d20kl1');
});

test('entlarvt eine getarnte Schauspiel-Blase erst durch einen erfolgreichen Folgeabschnitt', () => {
  const comments = [{
    id: 'lie-comment',
    commentSegments: [{
      characterId: 'gawain',
      charName: 'Gawain',
      text: 'Der Weg ist sicher.',
      skillChallenge: {
        id: 'lie-1',
        enabled: true,
        difficulty: 14,
        preferredSkills: ['insight']
      }
    }]
  }, {
    id: 'resolution-comment',
    commentSegments: [{ skillResolution: { targetChallengeId: 'lie-1', outcome: 'success' } }]
  }];
  const challenge = collectSkillChallenges(comments)[0];
  assert.equal(challenge.visibleText, 'Der Weg ist sicher.');
  assert.equal(challenge.disguisedKind, 'speech');
  assert.equal(challenge.actualKind, 'performance');
  assert.equal(collectRecentSkillChallenges(comments, 3)[0].contributionRank, 1);
  assert.deepEqual([...collectRevealedChallengeIds(comments)], ['lie-1']);
});

test('bietet verdeckte Beiträge einer Figur höchstens bis zum drittletzten Beitrag an', () => {
  const comments = Array.from({ length: 4 }, (_, index) => ({
    id: `gawain-${index + 1}`,
    commentSegments: [{
      characterId: 'gawain',
      charName: 'Gawain',
      text: `Aussage ${index + 1}`,
      ...(index === 0 || index === 1 ? { skillChallenge: { id: `challenge-${index + 1}`, enabled: true, difficulty: 12, preferredSkills: ['insight'] } } : {})
    }]
  }));
  const recent = collectRecentSkillChallenges(comments, 3);
  assert.deepEqual(recent.map(challenge => [challenge.id, challenge.contributionRank]), [['challenge-2', 3]]);
});

test('priorisiert den vollständigen Figurenbogen für die AleriaGPT-Fertigkeitsauswertung', () => {
  const enriched = skillNarrationInternals.enrichRetrieval({ promptContext: 'Szene', chunks: [] }, {
    actorId: 'test-figure',
    actor: 'Testfigur',
    actorProfileSnapshot: { attributes: [{ key: 'charisma', score: 18 }], skills: [{ name: 'Überreden', total: 8 }] }
  });
  assert.equal(enriched.stats.requiredSkillProfileIncluded, true);
  assert.match(enriched.promptContext, /VERBINDLICHER FIGURENBOGEN/);
  assert.match(enriched.promptContext, /Überreden/);
  assert.equal(enriched.chunks[0].score, 10002);
});

test('ruft AleriaGPT nur für einen tatsächlich ausgewerteten Fertigkeitsversuch auf', async () => {
  const previousClient = globalThis.AleriaGptClient;
  const previousRetrieval = globalThis.AleriaGptRetrieval;
  let requestedMode = '';
  globalThis.AleriaGptRetrieval = { retrieve: async () => ({ promptContext: '', chunks: [] }) };
  globalThis.AleriaGptClient = {
    isConfigured: () => true,
    sendChat: async (_query, retrieval, options) => {
      requestedMode = options.responseMode;
      assert.equal(retrieval.stats.requiredSkillProfileIncluded, true);
      return { ok: true, text: 'Der Ritter erkennt den Widerspruch.' };
    }
  };
  try {
    const result = await narrateSkillResolution({
      actorId: 'test-figure',
      actor: 'Ritter',
      skill: 'Motiv erkennen',
      outcome: 'success',
      attempt: 'Er prüft die Aussage.',
      revealedTruth: 'Der Dieb lügt.',
      actorProfileSnapshot: { attributes: [], skills: [] }
    });
    assert.equal(result.source, 'aleria-gpt');
    assert.equal(result.text, 'Der Ritter erkennt den Widerspruch.');
    assert.equal(requestedMode, 'skill-resolution-narration-v1');
  } finally {
    globalThis.AleriaGptClient = previousClient;
    globalThis.AleriaGptRetrieval = previousRetrieval;
  }
});
