import test from 'node:test';
import assert from 'node:assert/strict';
import { applyChallengeCombatBenefits, validateChallengeCombatEffects, applyChallengeCombatSnapshots } from '../modules/herausforderung/herausforderung-combat-effects.js';
import { getChallengeCombatBindingError, validateChallengeAudience } from '../modules/herausforderung/herausforderung-combat-context.js';
import { createManualCombatCondition } from '../modules/combat-status/combat-status-model.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { buildCombatEncounterSummary } from '../modules/combat/combat-encounter-summary.js';
import { parseHerausforderungImport, createHerausforderungExport } from '../modules/herausforderung/herausforderung-exchange.js';
import { applySkillRuntimeSnapshots } from '../modules/skill-checks/skill-runtime-state.js';
const profile = (id, additions = {}) => ({ characterId: id, name: id, currentHitPoints: 30, maximumHitPoints: 40, temporaryHitPoints: 2, temporaryConditions: [], resources: [{ id: 'mana', name: 'Mana', current: 5, maximum: 12, scope: 'persistent' }], ...additions });
const recipients = () => new Map(['ylva', 'gais'].map(id => [id, { profile: profile(id), state: {} }]));
const effect = (type, amount = 5, additions = {}) => ({ effectId: type, type, amount, formula: '', targetActorId: '', damageType: 'Feuer', ...additions });
const resolve = (benefits, options = {}) => applyChallengeCombatBenefits({ actorId: 'ylva', recipients: recipients(), identity: 'test', encounterId: 'duel', benefits, ...options });

test('damage respects immunity, resistance and temporary HP; healing and temp HP use combat caps', async () => {
  const actors = recipients(); actors.get('gais').profile.damageAffinities = [{ damageType: 'feuer', response: 'resistant', magicScope: 'any' }];
  const result = await resolve({ combatEffects: [effect('damage', 7, { targetActorId: 'gais' }), effect('healing', 99), effect('temporary-hit-points', 9), effect('temporary-hit-points', 3, { effectId: 'smaller' })] }, { recipients: actors });
  const gais = result.snapshots.find(s => s.actorId === 'gais').after, ylva = result.snapshots.find(s => s.actorId === 'ylva').after;
  assert.equal(gais.current, 29); assert.equal(gais.temporary, 0);
  assert.equal(ylva.current, 40); assert.equal(ylva.temporary, 9);
  actors.get('gais').profile.damageAffinities[0].response = 'immune';
  const immune = await resolve({ combatEffects: [effect('damage', 999, { targetActorId: 'gais' })] }, { recipients: actors });
  assert.equal(immune.snapshots[0].after.current, 30);
});
test('resource restoration caps at maximum and penalties cap at zero without changing maxima', async () => {
  const result = await resolve({ combatEffects: [effect('restore-resource', 50, { resourceId: 'mana' }), effect('spend-resource', 50, { resourceId: 'mana' })] });
  assert.equal(result.results[0].applied.after, 12); assert.equal(result.results[1].applied.after, 0);
  assert.equal(result.snapshots[0].after.resources[0].maximum, 12);
});

test('damage checks concentration at each impact and defeat cancels channeling before later healing', async () => {
  const actors = recipients();
  actors.get('ylva').profile.concentration = { id: 'spell', name: 'Fokus' };
  actors.get('ylva').profile.channeling = { id: 'cast' };
  const result = await resolve({ combatEffects: [effect('damage', 4), effect('damage', 99, { effectId: 'lethal' }), effect('healing', 40)] },
    { recipients: actors, dice: { rollSavingThrow: async () => ({ natural: 20, dice: [20], keptDice: [20], total: 20, id: 'concentration' }) } });
  assert.equal(result.saves.length, 1);
  assert.equal(result.snapshots[0].after.current, 40);
  assert.equal(result.snapshots[0].after.concentration, null);
  assert.equal(result.snapshots[0].after.channeling, null);
});

test('malformed AI effect lists produce actionable validation errors', () => {
  const source = { publicDescription: 'Falle', approaches: [{ preferredSkills: ['insight'], insight: 'Köder', rewards: { combatEffects: 12 } }] };
  assert.throws(() => parseHerausforderungImport(JSON.stringify(source)), /combatEffects muss eine Liste/);
});
test('buffs and debuffs have distinct recipients, preserve a prepared counter, and can explicitly remove it', async () => {
  const actors = recipients();
  const counter = createManualCombatCondition({ name: 'Lauernde Klaue', kind: 'buff', durationKind: 'combat', mechanics: {} }, { id: 'counter', encounterId: 'duel' });
  actors.get('gais').profile.temporaryConditions = [counter];
  const result = await resolve({ effects: [{ effectId: 'guard', name: 'Durchschaut', kind: 'buff', durationKind: 'combat', durationAmount: 2, mechanics: { armorClass: 1 } }, { effectId: 'debuff', name: 'Ablenkung', kind: 'debuff', durationKind: 'combat', targetActorId: 'gais', mechanics: { attack: -1 } }] }, { recipients: actors });
  assert.ok(result.snapshots.find(s => s.actorId === 'gais').after.temporaryConditions.some(c => c.id === 'counter'));
  const removed = await resolve({ combatEffects: [effect('remove-condition', 0, { targetActorId: 'gais', conditionId: 'counter' })] }, { recipients: actors });
  assert.equal(removed.snapshots[0].after.temporaryConditions.length, 0);
});
test('dice formula receipts are recorded without doubling on a critical skill result', async () => {
  const result = await resolve({ combatEffects: [effect('healing', 0, { formula: '1W4+2' })] }, { dice: { rollDamage: async options => { assert.equal(options.critical, false); return { id: 'die', dice: [3], total: 5, modifier: 2, notation: '1d4+2' }; } } });
  assert.equal(result.results[0].applied.restored, 5); assert.deepEqual(result.results[0].roll.diceResults, [3]);
});
test('invalid effects fail before application; unavailable recipients and resources leave inputs intact', async () => {
  for (const effects of [[effect('unknown')], [effect('damage', -1)], [effect('healing', 0, { formula: '1W100' })], [effect('damage', 5, { formula: '1W4' })], [effect('damage'), effect('damage')]]) assert.ok(validateChallengeCombatEffects(effects));
  const actors = recipients(), before = structuredClone(actors);
  await assert.rejects(resolve({ combatEffects: [effect('healing'), effect('damage', 1, { targetActorId: 'missing' })] }, { recipients: actors }), /Empfänger/);
  await assert.rejects(resolve({ combatEffects: [effect('restore-resource', 3, { resourceId: 'missing' })] }, { recipients: actors }), /Ressource/);
  assert.deepEqual(actors, before);
});
test('all, combatants and selected audiences are distinct, and binding rejects a finished or different fight', () => {
  const encounter = { active: true, encounterId: 'duel', participants: new Map([['ylva', { actorId: 'ylva', status: 'active' }]]) };
  const base = { combatBound: true, combatContext: { encounterId: 'duel' } };
  assert.equal(getChallengeCombatBindingError({ ...base, audience: { mode: 'all' } }, encounter, 'observer'), null);
  assert.ok(getChallengeCombatBindingError({ ...base, audience: { mode: 'combatants' } }, encounter, 'observer'));
  assert.equal(getChallengeCombatBindingError({ ...base, audience: { mode: 'selected', actorIds: ['observer'] } }, encounter, 'observer'), null);
  assert.ok(getChallengeCombatBindingError(base, null));
  assert.ok(getChallengeCombatBindingError(base, { ...encounter, encounterId: 'different' }));
  assert.ok(validateChallengeAudience({ mode: 'selected', actorIds: [] }));
});
test('combat receipts replay to the same HP/resources/conditions and do not expire in the grant post', async () => {
  const result = await resolve({ combatEffects: [effect('damage')], effects: [{ effectId: 'guard', name: 'Durchschaut', kind: 'buff', durationKind: 'actor-comments', durationAmount: 1, mechanics: { armorClass: 1 } }] });
  const resolution = { actorId: 'ylva', herausforderungCombatSnapshots: result.snapshots };
  const comment = { id: 'grant', characterId: 'ylva', serverValidatedMechanics: true, commentSegments: [{ characterId: 'ylva', skillResolution: resolution }] };
  const states = deriveCombatStateFromComments([comment]);
  assert.equal(states.get('ylva').current, 27);
  assert.equal(states.get('ylva').temporaryConditions[0].durationModel.remainingActorComments, 1);
  const preview = new Map(); applySkillRuntimeSnapshots(preview, resolution);
  assert.equal(preview.get('ylva').current, states.get('ylva').current);
  const after = deriveCombatStateFromComments([comment, { id: 'next', characterId: 'ylva', commentSegments: [{ kind: 'speech', characterId: 'ylva', text: 'Weiter' }] }]);
  assert.equal(after.get('ylva').temporaryConditions.length, 0);
});
test('encounter summary counts challenge effects separately from attacks and preserves stored dice', async () => {
  const result = await resolve({ combatEffects: [effect('damage')] });
  const resolution = { actorId: 'ylva', herausforderungEncounterId: 'duel', herausforderungCombatResults: result.results };
  const comments = [{ id: 'start', combatEncounter: { operation: 'start', encounterId: 'duel', participants: [{ actorId: 'ylva' }] } }, { id: 'result', commentSegments: [{ skillResolution: resolution }] }];
  const before = structuredClone(comments);
  const summary = buildCombatEncounterSummary({ encounterId: 'duel', participants: [{ actorId: 'ylva', name: 'Ylva' }], comments });
  assert.equal(summary.actionCount, 0); assert.equal(summary.challengeEffects.damage, 5);
  assert.deepEqual(comments, before);
});
test('AI exchange preserves audience and combat effects while stripping server encounter identity', () => {
  const source = { title: 'Falle', publicDescription: 'Eine Deckungslücke.', audience: { mode: 'selected', actorIds: ['ylva'] }, combatBound: true, combatContext: { encounterId: 'forged' }, approaches: [{ preferredSkills: ['insight'], insight: 'Ein Köder.', rewards: { combatEffects: [effect('healing')] } }] };
  const exported = createHerausforderungExport(source);
  assert.equal(exported.challenge.combatContext.encounterId, '');
  const imported = parseHerausforderungImport(JSON.stringify(exported));
  assert.equal(imported.event.audience.mode, 'selected'); assert.equal(imported.event.approaches[0].rewards.combatEffects[0].type, 'healing');
});
