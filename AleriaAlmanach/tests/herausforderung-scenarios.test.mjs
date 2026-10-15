import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createContext, runInContext } from 'node:vm';
import { actors, scenarios } from './support/herausforderung-scenarios.mjs';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { classifyHerausforderungOutcome, collectHerausforderungApproaches, normalizeHerausforderungEvent, getHerausforderungValidationIssues } from '../modules/herausforderung/herausforderung-model.js';
import { collectHerausforderungProgress } from '../modules/herausforderung/herausforderung-progress.js';
import { renderHerausforderungComment } from '../modules/herausforderung/herausforderung-ui.js';
import { validateSkillCommentSegments } from '../../firebase/functions/src/mechanics/skill-comment-validator.js';
import { getChallengeAttemptSettings } from '../modules/skill-checks/skill-challenge-attempt.js';

// Run the real browser resolver and the server validator, using an isolated
// in-memory transaction store. No production documents or resources are touched.
function transactionStore(actor) {
  const documents = new Map([[`characters/${actor.id}`, structuredClone(actor)]]);
  return { documents, database: { collection: name => ({ doc: id => ({ path: `${name}/${id}` }) }) }, transaction: {
    get: async ref => ({ exists: documents.has(ref.path), data: () => documents.get(ref.path) }),
    create(ref, value) { assert.ok(!documents.has(ref.path)); documents.set(ref.path, structuredClone(value)); }
  } };
}

for (const actor of actors) for (const skillId of ['persuasion', 'intimidation', 'deception', 'performance', 'seduction']) {
  test(`one guard approach accepts the explicit ${skillId} choice by ${actor.name} on the server`, async () => {
    const event = normalizeHerausforderungEvent({ title: 'Die Torwache', publicDescription: 'Eine Wache versperrt den Durchgang.',
      approaches: [{ approachId: 'pass', label: 'Die Wache lässt dich passieren', preferredSkills: ['persuasion', 'intimidation', 'deception', 'performance', 'seduction'], difficulty: 15, insight: 'Die Wache öffnet das Tor.' }] });
    const origin = { id: 'guard', herausforderung: event, serverValidatedMechanics: true };
    const challenge = collectHerausforderungApproaches([origin])[0];
    const selected = getChallengeAttemptSettings(challenge, skillId);
    const client = await new SkillResolutionService({ rollSkill: async ({ modifier, rollMode }) => ({ natural: 20, total: 20 + modifier, dice: rollMode === 'normal' ? [20] : [20, 20], keptDice: [20] }) })
      .resolve({ actor, settings: { skillId, targetChallengeId: challenge.id }, challenge, actorPersistence: { kind: 'character', recordId: actor.id } });
    const result = await validateSkillCommentSegments({ ...transactionStore(actor), request: { auth: { uid: 'isolated-choice' } },
      metadata: { commentSegments: [{ kind: selected.kind, mechanicMode: 'skill', skillId, skillTargetChallengeId: challenge.id, skillResolution: client }] },
      history: [origin], challengeHistory: [origin], entryId: 'isolated-guard-choice' });
    const resolution = result.commentSegments[0].skillResolution;
    assert.equal(resolution.serverValidated, true);
    assert.equal(resolution.skillId, skillId);
    assert.equal(resolution.affinityModifier, 0);
    assert.equal(resolution.total, client.total);
    assert.equal(resolution.targetChallengeId, challenge.id);
  });
}

for (const scenario of scenarios) {
  for (const [actorIndex, actor] of actors.entries()) {
    test(`${scenario.title} · ${actor.name} · ${scenario.tier}`, async () => {
      const original = JSON.stringify(actor);
      const event = normalizeHerausforderungEvent({ title: scenario.title, publicDescription: scenario.description, approaches: [
        { approachId: 'main', label: scenario.label, preferredSkills: scenario.preferredSkills || [scenario.skillId], ...scenario },
        { approachId: 'other', label: 'Ein anderer Weg', preferredSkills: ['insight'], difficulty: 15, insight: 'Andere Erkenntnis' }
      ] });
      assert.deepEqual(getHerausforderungValidationIssues(event), []);
      const origin = { id: scenario.id, herausforderung: event, serverValidatedMechanics: true };
      const challenge = collectHerausforderungApproaches([origin])[0];
      const settings = { skillId: scenario.skillId, targetChallengeId: challenge.id, difficulty: 1 };
      const natural = scenario.natural[actorIndex];
      const client = await new SkillResolutionService({ rollSkill: async ({ modifier, rollMode }) => ({ natural, total: natural + modifier, dice: rollMode === 'normal' ? [natural] : [natural, natural], keptDice: [natural] }) }).resolve({ actor, settings, challenge, actorPersistence: { kind: 'character', recordId: actor.id } }, { opposedDifficulty: null });
      assert.equal(client.difficulty, scenario.difficulty, 'A null opposed difficulty cannot override the authored DC');
      const store = transactionStore(actor);
      const metadata = { commentSegments: [{ kind: scenario.kind, skillId: settings.skillId, skillDifficulty: 1, skillTargetChallengeId: challenge.id, skillResolution: { ...client, total: 999, difficulty: 1, revealedText: 'Manipulierter Text' } }] };
      const validate = history => validateSkillCommentSegments({ ...store, request: { auth: { uid: 'isolated-tester' } }, metadata, challengeHistory: [origin], history, entryId: 'isolated-challenge-scene' });
      const result = await validate([origin]);
      const resolution = result.commentSegments[0].skillResolution;
      assert.equal(resolution.total, client.total, 'The server recomputes totals from the actual character sheet');
      assert.equal(resolution.difficulty, client.difficulty);
      assert.equal(resolution.herausforderungTier, scenario.tier);
      assert.equal(resolution.serverValidated, true);
      assert.equal(resolution.affinityModifier, 0);
      const revealed = scenario.tier === 'knapp' ? scenario.partialHint : scenario.tier === 'deutlich' ? scenario.failureConsequence : scenario.insight;
      assert.equal(resolution.revealedText, revealed);
      const history = [origin, { id: 'attempt', commentSegments: result.commentSegments }];
      const progress = collectHerausforderungProgress(history);
      const solved = ['erfolg', 'kritischer-erfolg'].includes(scenario.tier);
      assert.equal(progress.get(challenge.id).solved, solved);
      const html = renderHerausforderungComment(origin, 0, { progress });
      assert.ok(html.includes(revealed));
      if (!solved) { assert.ok(!html.includes(scenario.insight)); await validate(history); }
      else { assert.ok(html.includes('Aufgedeckt')); await assert.rejects(validate(history), /nicht mehr auflösbar|bereits aufgelöst/); await assert.rejects(validate([origin]), /bereits aufgelöst/); }
      assert.equal((html.match(/data-herausforderung-action="attempt"/g) || []).length, solved ? 1 : 2, 'Other approaches stay independently available');
      assert.ok(!html.includes('Manipulierter Text'));
      assert.equal(JSON.stringify(actor), original, 'Character resources, IDs and inventory remain unchanged');
    });
  }
}

test('validation rejects malformed, duplicate and out-of-range approaches before normalization', () => {
  const valid = { publicDescription: 'Situation', approaches: [{ approachId: 'a', difficulty: 10, preferredSkills: ['insight'], insight: 'Erkenntnis' }] };
  assert.equal(getHerausforderungValidationIssues(null).length, 2);
  for (const difficulty of ['', 0, 41, 10.5, 'abc']) assert.ok(getHerausforderungValidationIssues({ ...valid, approaches: [{ ...valid.approaches[0], difficulty }] }).some(issue => issue.field === 'difficulty'));
  assert.ok(getHerausforderungValidationIssues({ ...valid, approaches: [valid.approaches[0], valid.approaches[0]] }).some(issue => issue.field === 'label'));
  assert.ok(getHerausforderungValidationIssues({ ...valid, approaches: [{ ...valid.approaches[0], preferredSkills: ['invented'] }] }).some(issue => issue.field === 'preferredSkill'));
});

test('forced outcomes keep insight reveal and atomic success claims consistent', () => {
  assert.equal(classifyHerausforderungOutcome({ natural: 1, total: 1, difficulty: 20, outcome: 'success' }), 'erfolg');
  assert.equal(classifyHerausforderungOutcome({ natural: 20, total: 30, difficulty: 10, outcome: 'failure' }), 'deutlich');
});

test('public preview contains no hidden result text or attempt controls and escapes authored markup', () => {
  const html = renderHerausforderungComment({ herausforderung: { title: '<script>alert(1)</script>', publicDescription: 'Sichtbar', approaches: [{ insight: 'GEHEIM', partialHint: 'TEILGEHEIM', failureConsequence: 'FOLGEGEHEIM' }] } }, 0, { preview: true });
  assert.ok(!html.includes('GEHEIM'));
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('data-herausforderung-action="attempt"'));
});

test('the comment form owns challenge handover and preserves an existing restored draft', async () => {
  const settings = { kind: 'thought', mechanicMode: 'skill', skillId: 'investigation', skillTargetActorKey: 'herausforderung:x', skillTargetChallengeId: 'herausforderung:x:a' };
  const context = createContext({ window: { AleriaSkillChecks: { getChallengeAttemptSettings: () => settings } },
    _commentSegments: [{ kind: 'speech', text: 'Vorhandener Entwurf', mechanicMode: 'normal' }], _commentKind: 'speech',
    SCENE_TIME_DEFAULT_SEGMENT_SECONDS: 30, COMMENT_LANGUAGE_DEFAULT: 'common', setCommentMode() {}, persistCommentDraft() {},
    makeCommentSegment: (kind, text, emote, side, time, language, color, supplied) => ({ kind, text, ...supplied }) });
  runInContext(await readFile(new URL('../modules/comments/comments-form.js', import.meta.url), 'utf8'), context);
  runInContext('openCommentForm = () => {}; openCommentFormForSkillChallenge({});', context);
  assert.equal(context._commentSegments.length, 2);
  assert.equal(context._commentSegments[0].text, 'Vorhandener Entwurf');
  assert.equal(context._commentSegments[1].skillTargetChallengeId, settings.skillTargetChallengeId);
  context._commentSegments = [{ text: '', mechanicMode: 'normal' }];
  runInContext('openCommentFormForSkillChallenge({});', context);
  assert.equal(context._commentSegments.length, 1, 'An empty default segment is replaced');
  assert.equal(context._commentSegments[0].mechanicMode, 'skill');
});
