import assert from 'node:assert/strict';
import test from 'node:test';
import { getChallengeCheckRule, validateChallengeCheckPenalties } from '../modules/herausforderung/herausforderung-check-policy.js';
import { withResolvedChallengeTarget, validateChallengeTarget } from '../modules/herausforderung/herausforderung-target.js';
import { collectHerausforderungApproaches, normalizeHerausforderungEvent } from '../modules/herausforderung/herausforderung-model.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { getChallengeAttemptChoices, getChallengeAttemptSettings } from '../modules/skill-checks/skill-challenge-attempt.js';
import { createHerausforderungExport, createHerausforderungAiTemplate, parseHerausforderungImport } from '../modules/herausforderung/herausforderung-exchange.js';
import { getActiveCombatEncounter } from '../modules/combat/combat-encounter-model.js';
import { person, gradedEvent, encounterComment } from './fixtures/graded-challenge-fixtures.mjs';

function challenge(preferredSkills, checkPenalties = []) {
  return { source: 'herausforderung', id: 'test', preferredSkills, checkPenalties, difficulty: 15 };
}
const figure = person('reader');
figure.combatProfile.attributes = [{ key: 'charisma', score: 16 }, { key: 'strength', score: 14 }, { key: 'wisdom', score: 12 }];
let rolls;
const service = natural => new SkillResolutionService({ rollSkill: async ({ modifier, notation }) => {
  rolls++; return { natural, total: natural + modifier, notation, dice: [natural] };
} });

test('interrogation only permits its authored checks, before any die is rolled', async () => {
  const target = challenge(['insight', 'intimidation', 'persuasion']);
  assert.equal(getChallengeCheckRule(target, 'insight').allowed, true);
  for (const skillId of ['arcane-kunde', 'nature', 'seduction', 'save:wisdom']) {
    rolls = 0;
    await assert.rejects(service(20).resolve({ actor: figure, settings: { skillId }, challenge: target }), /gesperrt/);
    assert.equal(rolls, 0);
  }
  assert.equal(getChallengeCheckRule({ preferredSkills: ['insight'] }, 'nature').allowed, true, 'legacy hidden speech behavior is retained');
});

test('seduction penalty is authored, not supplied by the person rolling', async () => {
  const target = challenge(['seduction'], [{ checkId: 'seduction', modifier: -10, reason: 'Unempfänglich für Flirten' }]);
  rolls = 0;
  const result = await service(18).resolve({ actor: figure, settings: { skillId: 'seduction', customModifier: 99 }, challenge: target });
  assert.equal(result.profileModifier, 3);
  assert.equal(result.challengeModifier, -10);
  assert.equal(result.customModifier, 0);
  assert.equal(result.total, 11);
  assert.equal(result.challengeModifierReason, 'Unempfänglich für Flirten');
  assert.equal(result.outcome, 'failure');
  assert.equal((await service(20).resolve({ actor: figure, settings: { skillId: 'seduction' }, challenge: target })).outcome, 'critical-success');
  assert.equal((await service(1).resolve({ actor: figure, settings: { skillId: 'seduction' }, challenge: target })).outcome, 'critical-failure');
});

test('raw attribute and save remain separate choices with separate penalties', async () => {
  const target = challenge(['attribute:strength', 'save:strength'], [{ checkId: 'attribute:strength', modifier: -2 }]);
  const raw = await service(14).resolve({ actor: figure, settings: { skillId: 'attribute:strength' }, challenge: target });
  const save = await service(14).resolve({ actor: figure, settings: { skillId: 'save:strength' }, challenge: target });
  assert.equal(raw.total, 14); assert.equal(save.total, 16);
  assert.equal(raw.challengeModifier, -2); assert.equal(save.challengeModifier, 0);
});

test('invalid penalty tables fail author validation instead of silently broadening access', () => {
  for (const checkPenalties of [[{ checkId: 'nature', modifier: -10 }], [{ checkId: 'insight', modifier: 1 }],
    [{ checkId: 'insight', modifier: -31 }], [{ checkId: 'insight', modifier: -1.5 }],
    [{ checkId: 'insight', modifier: '-10' }], [{ checkId: 'insight', modifier: -2 }, { checkId: 'insight', modifier: -3 }]]) {
    assert.ok(validateChallengeCheckPenalties({ preferredSkills: ['insight'], checkPenalties }));
  }
  assert.equal(validateChallengeCheckPenalties({ preferredSkills: ['insight'], checkPenalties: [{ checkId: 'insight', modifier: -30 }] }), null);
});

test('picker retains an exact check and its narrative kind, even across different kinds', () => {
  const target = challenge(['insight', 'persuasion', 'save:wisdom'], [{ checkId: 'persuasion', modifier: -5, reason: 'Misstrauisch' }]);
  assert.deepEqual(getChallengeAttemptChoices(target).map(check => [check.id, check.modifier]), [['insight',0],['persuasion',-5],['save:wisdom',0]]);
  assert.equal(getChallengeAttemptSettings(target, 'persuasion').kind, 'speech');
  assert.equal(getChallengeAttemptSettings(target, 'save:wisdom').kind, 'interact');
  assert.equal(getChallengeAttemptSettings(target, 'nature'), null);
});

test('bound duel resolves exactly one enemy without guessing in a group combat or environment check', () => {
  const encounter = getActiveCombatEncounter([{ id: 'start', ...encounterComment() }]);
  const target = { ...challenge(['insight']), combatBound: true, combatContext: { encounterId: 'duel' } };
  const resolved = withResolvedChallengeTarget(target, { encounter, actorId: 'reader' });
  assert.equal(resolved.authorId, 'opponent'); assert.equal(resolved.targetInferred, true);
  const multiple = { ...encounter, participants: new Map([...encounter.participants, ['third', { actorId: 'third', partyId: 'b', status: 'active' }]]) };
  assert.equal(withResolvedChallengeTarget(target, { encounter: multiple, actorId: 'reader' }).authorId, undefined);
  assert.equal(withResolvedChallengeTarget({ ...target, targetActor: { mode: 'none' } }, { encounter, actorId: 'reader' }).authorId, undefined);
  assert.equal(withResolvedChallengeTarget({ ...target, combatContext: { encounterId: 'other' } }, { encounter, actorId: 'reader' }).authorId, undefined);
  const explicit = withResolvedChallengeTarget({ ...target, targetActor: { actorId: 'speaker', name: 'Die Wache' } }, { encounter, actorId: 'reader' });
  assert.equal(explicit.authorId, 'speaker'); assert.equal(explicit.targetInferred, false);
});

test('AI exchange preserves whitelist, target and penalties, and rejects unsupported data', () => {
  const event = gradedEvent();
  event.targetActor = { actorId: 'opponent', name: 'Gais Wyrm', persistence: { kind: 'character', recordId: 'opponent' } };
  event.approaches[0].checkPenalties = [{ checkId: 'investigation', modifier: -5, reason: 'Nur flüchtige Hinweise' }];
  const exported = createHerausforderungExport(event);
  const context = { encounterId: 'duel', participants: [{ actorId: 'reader' }, { actorId: 'opponent' }] };
  const imported = parseHerausforderungImport(JSON.stringify(exported), {}, context).event;
  assert.deepEqual(imported.approaches[0].checkPenalties, event.approaches[0].checkPenalties);
  assert.equal(imported.targetActor.actorId, 'opponent');
  const flattened = collectHerausforderungApproaches([{ id: 'challenge', herausforderung: normalizeHerausforderungEvent(imported) }])[0];
  assert.equal(getChallengeCheckRule(flattened, 'nature').allowed, false);
  assert.equal(getChallengeCheckRule(flattened, 'investigation').modifier, -5);
  assert.match(createHerausforderungAiTemplate().instructions.syntax.approach.checkPenalties, /−30/);
  const invalid = structuredClone(exported); invalid.challenge.approaches[0].checkPenalties[0].modifier = 1;
  assert.throws(() => parseHerausforderungImport(JSON.stringify(invalid), {}, context), /−30|Mali/);
  assert.ok(validateChallengeTarget({ actorId: '../bad' }));
  assert.ok(validateChallengeTarget({ mode: 'selected' }));
});
