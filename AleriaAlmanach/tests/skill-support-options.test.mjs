import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { collectSkillSupportOptions, selectSkillSupportDefaults, skillSupportOptionKey } from '../modules/skill-checks/skill-support-options.js';
import { person } from './fixtures/graded-challenge-fixtures.mjs';

const actor = person('reader');
const settings = { skillId: 'insight', difficulty: 18 };
const reaction = (id, effects = { skillModifier: 2 }, extra = {}) => ({
  id, name: id, activation: 'reaction', phase: 'pre-roll', sourceRelation: 'ally',
  actionKinds: ['skill'], skillIds: ['insight'], effects, ...extra
});
function source(rules, extra = {}) {
  const figure = person('support');
  figure.combatProfile.quirks = [{ id: 'training', name: 'Ausbildung', active: true, triggerRules: rules }];
  const profile = resolveCombatProfile(figure);
  return { actorId: figure.id, actorName: figure.name, profile, sourceRole: 'support',
    relationToActor: 'ally', relationToTarget: 'enemy', distanceToActor: 0,
    selectedRuleIds: rules.map(rule => rule.id), ...extra };
}
const optionsFor = (sources, skillId = 'insight', extra = {}) => collectSkillSupportOptions(
  { actor, settings: { ...settings, skillId } }, { actorProfile: resolveCombatProfile(actor), ruleSources: sources, ...extra });

test('only relevant allied support survives actual skill, phase and effect filters', () => {
  const rules = [reaction('help'), reaction('defense', { defenseModifier: 1 }),
    reaction('damage', { damageModifier: 4 }), reaction('wrong-skill', { skillModifier: 4 }, { skillIds: ['perception'] }),
    reaction('wrong-phase', { skillModifier: 4 }, { phase: 'post-damage' })];
  assert.deepEqual(optionsFor([source(rules)]).map(option => option.ruleId), ['help']);
  assert.deepEqual(optionsFor([source(rules, { relationToActor: 'enemy' })]), []);
  assert.deepEqual(optionsFor([source(rules)], 'attribute:strength'), []);
});

test('conditional post-roll rescue is offered without consuming or rolling', () => {
  const option = optionsFor([source([reaction('rescue', { skillModifier: 3 }, { phase: 'post-roll', condition: 'would-miss' })])]);
  assert.equal(option.length, 1);
  assert.equal(option[0].condition, 'would-miss');
});

test('spent frequencies, empty reactions and unknown range cannot be preselected', () => {
  const current = source([reaction('help', { skillModifier: 2 }, { frequency: 'scene' })]);
  const offered = optionsFor([current], 'insight', { rulePeriods: { scene: 'scene' } });
  assert.equal(offered.length, 1);
  assert.equal(optionsFor([current], 'insight', { rulePeriods: { scene: 'scene' }, usedRuleFrequencyKeys: new Set([offered[0].usedKey]) }).length, 0);
  const empty = { ...current, profile: { ...current.profile, resources: current.profile.resources.map(resource => resource.id === 'reaction' ? { ...resource, current: 0 } : resource) } };
  assert.equal(optionsFor([empty]).length, 0);
  assert.equal(optionsFor([source([reaction('nearby', { skillModifier: 2 }, { radiusMeters: 3 })], { distanceToActor: null })]).length, 0);
});

test('defaults respect combined costs and retain deselection on remount', () => {
  const options = optionsFor([source([reaction('a'), reaction('b')])]);
  assert.equal(options.length, 2);
  const seen = new Set();
  const selected = selectSkillSupportDefaults(options, [], seen);
  assert.equal(selected.length, 1, 'one reaction cannot pay two simultaneous rules');
  assert.equal(selectSkillSupportDefaults(options, [], seen).length, 0, 'explicit deselection survives remount');
  assert.equal(selectSkillSupportDefaults(options, selected, seen).length, 1);
  assert.ok(seen.has(skillSupportOptionKey(options[0])));
});

test('exhausted ability uses are not offered', () => {
  const current = source([]);
  current.profile = { ...current.profile, abilities: [{ id: 'aid', name: 'Beistand', active: true,
    usesMaximum: 1, usesCurrent: 0, triggerRules: [reaction('aid-rule', { skillModifier: 2 }, { actionScope: 'global' })] }] };
  current.selectedRuleIds = ['aid-rule'];
  assert.equal(optionsFor([current]).length, 0);
});

test('new rolls ignore positive and negative free bonuses while preserving sheet and rule effects', async () => {
  const snapshot = { customModifier: 7, total: 24 };
  const history = structuredClone(snapshot);
  for (const customModifier of [-99, -4, 0, 12, 99]) {
    const result = await new SkillResolutionService({ rollSkill: async ({ modifier }) => ({ natural: 10, total: 10 + modifier }) })
      .resolve({ actor, settings: { ...settings, customModifier } });
    assert.equal(result.customModifier, 0);
    assert.equal(result.total, 10);
  }
  assert.deepEqual(snapshot, history);
});

test('self and already overlaid encounter auras count exactly once', async () => {
  const figure = person('reader');
  figure.combatProfile.aura = { enabled: true, latentPresence: { enabled: true, active: true,
    target: 'Selbst und Verbündete', selfMechanics: { skill: 2 }, allyMechanics: { skill: 2 } } };
  const base = resolveCombatProfile(figure);
  const helper = source([]);
  helper.profile = resolveCombatProfile({ ...figure, id: 'support' });
  helper.selectedRuleIds = ['@aura:actor'];
  const profile = overlayCombatHitPointState(base, { temporaryConditions: [{ id: 'ongoing-aura', name: 'Aura',
    active: true, encounterAura: true, auraSourceActorId: 'support', mechanics: { skill: 2 },
    durationModel: { kind: 'combat', encounterId: 'duel' } }] });
  const result = await new SkillResolutionService({ rollSkill: async ({ modifier }) => ({ natural: 10, total: 10 + modifier }) })
    .resolve({ actor, settings }, { actorProfile: profile, ruleSources: [
      { actorId: actor.id, actorName: actor.name, profile, sourceRole: 'actor', relationToActor: 'self', distanceToActor: 0, selectedRuleIds: [] }, helper] });
  assert.equal(result.total, 14);
  assert.equal(result.ruleApplications.length, 0);
  assert.equal(optionsFor([helper], 'insight', { actorProfile: profile }).length, 0);
});
