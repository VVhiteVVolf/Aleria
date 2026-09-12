import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { normalizeCombatEffect, applyTypedCombatDamage, applyCombatHealing, applyTemporaryHitPoints } from '../modules/combat/combat-effect-model.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
import { advanceConditionForComment } from '../modules/combat/combat-condition-duration.js';
import { SeededCombatDice } from './support/combat-seeded-dice.mjs';
import { getCombatDamagePreview } from '../modules/combat/combat-action-estimates.js';

function profile(id, additions = {}) {
  return resolveCombatProfile({ id, name: id, combatProfile: {
    attributes: [{ key: 'intelligence', score: 16 }],
    hitPoints: { current: 40, maximumOverride: 100 }, armorClass: { override: 5 },
    weapons: [{ id: 'blade', name: 'Klinge', equipped: true, damageFormula: '1d6' }],
    resources: [{ id: 'test-pool', name: 'Prüfvorrat', current: 10, maximum: 10, recovery: 'manual' }],
    ...additions
  } });
}

function action(effects, additions = {}) {
  return { ...profile('actor', additions), resourceCosts: [], actionResolutionMode: 'automatic',
    selectedAction: { name: 'Prüfhandlung', effects } };
}

function lateRule(resultEffects, phase = 'on-damaged', extra = {}) {
  return { id: 'audit-rule', name: 'Prüfregel', phase, recipient: 'target', sourceRelation: 'self',
    activation: 'passive', frequency: 'always', condition: 'always', effects: {}, resultEffects, ...extra };
}

const resolve = (actor, target = profile('target'), options = {}, fixed = 15) =>
  new CombatResolutionService(new SeededCombatDice(1, fixed)).resolveAttack({ actor, target }, options);
const replay = resolution => deriveCombatStateFromComments([{ id: 'post', combatResolution: resolution }]);
const pool = resources => resources.find(resource => resource.id === 'test-pool').current;

test('ältere strukturierte Zustandsdauern bleiben nach Effektnormalisierung endlich', () => {
  for (const amount of [1, 2, 5]) {
    const effect = normalizeCombatEffect({ type: 'buff', condition: {
      id: 'legacy', name: 'Alter Zustand', remainingActorComments: amount
    } });
    let condition = effect.condition;
    for (let index = 0; index < amount; index++) {
      const step = advanceConditionForComment(condition, 'owner', new Set(['owner']));
      assert.equal(step.expired, index === amount - 1);
      condition = step.condition;
    }
  }
});

test('explizite Dauer gewinnt vor alten Zählern, fremde Beiträge verkürzen keine eigene Dauer', () => {
  let condition = normalizeCombatEffect({ type: 'buff', condition: { name: 'Schutz', remainingActorComments: 1,
    durationModel: { kind: 'actor-comments', amount: 3 } } }).condition;
  const foreign = advanceConditionForComment(condition, 'owner', new Set(['other']));
  assert.equal(foreign.condition.remainingActorComments, 3);
  for (let index = 0; index < 3; index++) {
    const step = advanceConditionForComment(condition, 'owner', new Set(['owner']));
    assert.equal(step.expired, index === 2);
    condition = step.condition;
  }
});

for (const type of ['damage', 'healing', 'temporary-hit-points']) {
  test(`fester ${type}-Effekt verwendet seinen ausdrücklichen Attributsbonus`, async () => {
    const actor = action([{ type, amount: 8, bonusAttribute: 'intelligence', on: 'always' }]);
    const result = await resolve(actor);
    assert.equal(result.effectResults[0].amount, 11);
    assert.equal(result.effectResults[0].roll?.keptDice?.length || 0, 0);
    if (type === 'damage') {
      assert.equal(getCombatDamagePreview(actor).average, 11);
      assert.equal(result.damage.modifier, 3);
      assert.equal(result.damage.notation, '8+3');
    }
  });
}

test('Ressourcenwirkung und Reaktionskosten bleiben gemeinsam im endgültigen Stand erhalten', async () => {
  const actor = action([{ type: 'spend-resource', resourceId: 'test-pool', amount: 4, on: 'always' }]);
  const target = profile('target', { abilities: [{ id: 'reaction-rule', name: 'Abwehr', active: true,
    triggerRules: [lateRule([], 'post-roll', { activation: 'reaction', costs: [{ resourceId: 'test-pool', amount: 3 }] })] }] });
  const result = await resolve(actor, target, { ruleSources: [{ actorId: target.characterId,
    selectedRuleIds: ['audit-rule'] }] });
  assert.equal(pool(result.targetResourceSnapshot.after), 6);
  assert.equal(pool(result.ruleResourceSnapshots[0].after), 3);
  assert.equal(pool(replay(result).get('target').resources), 3);
});

test('später Zusatzschaden ist in Schadenssumme und TP-Verlust enthalten', async () => {
  const target = profile('target', { abilities: [{ id: 'late-damage', name: 'Nachwirkung', active: true,
    triggerRules: [lateRule([{ id: 'late', type: 'damage', amount: 7, on: 'always' }])] }] });
  const result = await resolve(action([{ type: 'damage', amount: 4, on: 'always' }]), target);
  assert.equal(result.targetSnapshot.hitPointsBefore - result.targetSnapshot.hitPointsAfter, 11);
  assert.equal(result.damage.total, 11);
  assert.equal(result.damage.rawTotal, 11);
  assert.equal(result.effectResults.filter(entry => entry.effect.id === 'late').length, 1);
});

test('Konzentration endet auch bei Niederlage durch eine späte Folgewirkung', async () => {
  const target = { ...profile('target', { abilities: [{ id: 'late-damage', name: 'Nachwirkung', active: true,
    triggerRules: [lateRule([{ type: 'damage', amount: 100, on: 'always' }])] }] }),
    concentration: { instanceId: 'ongoing', actionId: 'old-spell' } };
  const result = await resolve(action([{ type: 'damage', amount: 4, on: 'always' }]), target);
  assert.equal(result.targetSnapshot.hitPointsAfter, 0);
  assert.equal(result.targetConcentrationSnapshot.after, null);
  assert.equal(replay(result).get('target').concentration, null);
});

test('später Schaden prüft Konzentration erneut, ohne rekursive Folgewirkungen zu erzeugen', async () => {
  const target = { ...profile('target', { abilities: [{ id: 'late-damage', name: 'Nachwirkung', active: true,
    triggerRules: [lateRule([{ id: 'late', type: 'damage', amount: 34, on: 'always' }])] }] }),
    concentration: { instanceId: 'ongoing' } };
  const result = await resolve(action([{ type: 'damage', amount: 1, on: 'always' }]), target);
  assert.deepEqual(result.secondarySaves.map(save => [save.dc, save.succeeded]), [[10, true], [17, false]]);
  assert.equal(result.targetConcentrationSnapshot.after, null);
  assert.equal(result.effectResults.filter(entry => entry.effect.id === 'late').length, 1);
});

test('strukturierte Folgen früher Angriffsphasen werden genau einmal ausgeführt', async () => {
  const target = profile('target', { abilities: [{ id: 'early-ward', name: 'Schutz', active: true,
    triggerRules: [lateRule([{ id: 'ward', type: 'temporary-hit-points', amount: 3, on: 'always' }], 'post-roll')] }] });
  const result = await resolve(action([{ type: 'damage', amount: 1, on: 'always' }]), target);
  assert.equal(result.targetSnapshot.temporaryHitPointsAfter, 3);
  assert.equal(result.effectResults.filter(entry => entry.effect.id === 'ward').length, 1);
});

test('auch ausschließlich ausgelöster Schaden erhält einen vollständigen Schadensbeleg', async () => {
  const target = profile('target', { abilities: [{ id: 'late-damage', name: 'Nebenwirkung', active: true,
    triggerRules: [lateRule([{ type: 'damage', amount: 7, on: 'always' }], 'on-heal')] }] });
  const result = await resolve(action([{ type: 'healing', amount: 2, on: 'always' }]), target);
  assert.equal(result.targetSnapshot.hitPointsAfter, 35);
  assert.equal(result.damage.total, 7);
});

test('Selbstunterbrechung lässt Konzentration und Kanalisierung des Gegenübers unangetastet', async () => {
  const actor = { ...action([{ type: 'interrupt', target: 'self', on: 'always' }]),
    concentration: { instanceId: 'actor-concentration' } };
  const target = { ...profile('target'), concentration: { instanceId: 'target-concentration' },
    channeling: { actionId: 'ritual', progress: 1 } };
  const result = await resolve(actor, target);
  assert.equal(result.actorConcentrationSnapshot?.after, null);
  assert.equal(result.targetConcentrationSnapshot, null);
  assert.equal(result.targetChannelingSnapshot, null);
});

test('Eigenschaden prüft die Konzentration der handelnden Figur', async () => {
  const actor = { ...action([{ type: 'damage', target: 'self', amount: 4, on: 'always' }]),
    concentration: { instanceId: 'actor-concentration' } };
  const dice = new SeededCombatDice(1, 1);
  const rollSavingThrow = dice.rollSavingThrow.bind(dice);
  const displayedRollers = [];
  dice.rollSavingThrow = options => { displayedRollers.push(options.targetName); return rollSavingThrow(options); };
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: profile('target') });
  assert.equal(result.actorHitPointSnapshot.after.current, 36);
  assert.equal(result.actorConcentrationSnapshot?.after, null);
  assert.equal(result.targetConcentrationSnapshot, null);
  assert.equal(result.secondarySaves.filter(save => save.type === 'concentration').length, 1);
  assert.deepEqual(displayedRollers, ['actor'], 'Die Würfelanzeige benennt die tatsächlich geprüfte Figur');
});

test('Schaden, Heilung und temporäre TP erfüllen Erhaltung und Grenzen bei Typkombinationen', () => {
  const responses = [[], ['resistant'], ['vulnerable'], ['resistant', 'vulnerable'], ['immune', 'vulnerable']];
  for (const current of [0, 1, 9, 20]) for (const temporary of [0, 1, 7]) for (const amount of [0, 1, 3, 20, 99]) {
    const state = { current, maximum: 20, temporary };
    for (const affinities of responses) {
      const profile = { damageAffinities: affinities.map(response => ({ damageType: 'fire', response })) };
      const result = applyTypedCombatDamage(state, amount, profile, { damageType: 'fire' });
      const expected = affinities.includes('immune') ? 0 : affinities.length !== 1 ? amount
        : affinities[0] === 'resistant' ? Math.floor(amount / 2) : amount * 2;
      assert.equal(result.incoming, expected);
      assert.equal(result.after.current + result.after.temporary, Math.max(0, current + temporary - expected));
      assert.ok(result.after.current >= 0 && result.after.current <= 20);
      assert.deepEqual(state, { current, maximum: 20, temporary });
    }
    assert.equal(applyCombatHealing(state, amount).after.current, Math.min(20, current + amount));
    assert.equal(applyTemporaryHitPoints(state, amount).after.temporary, Math.max(temporary, amount));
  }
});

test('eine leere entzogene Ressource löst keine Verbrauchsfolge aus', async () => {
  const target = profile('target', {
    resources: [{ id: 'test-pool', name: 'Leer', current: 0, maximum: 10, recovery: 'manual' }],
    abilities: [{ id: 'on-spent', name: 'Verbrauchsfolge', active: true, triggerRules: [
      lateRule([{ type: 'temporary-hit-points', amount: 5, on: 'always' }], 'on-resource-spent')
    ] }]
  });
  const result = await resolve(action([{ type: 'spend-resource', resourceId: 'test-pool', amount: 2, on: 'always' }]), target);
  assert.equal(result.targetSnapshot.temporaryHitPointsAfter, 0);
  assert.equal(result.ruleApplications.length, 0);
});

test('Radiusregeln unterscheiden unbekannte Entfernung von ausdrücklich null Metern', async () => {
  const actor = profile('actor');
  const target = profile('target', { abilities: [{ id: 'nearby', name: 'Nahbereich', active: true, triggerRules: [
    lateRule([], 'pre-roll', { recipient: 'actor', sourceRelation: 'enemy', radiusMeters: 2, effects: { attackModifier: -4 } })
  ] }] });
  for (const [distanceMeters, bonus] of [[undefined, 0], [null, 0], ['', 0], [0, -4], [2, -4], [3, 0]]) {
    const result = await resolve(actor, target, { distanceMeters });
    assert.equal(result.attack.modifier, actor.attackModifier + bonus, `Entfernung ${String(distanceMeters)}`);
  }
});
