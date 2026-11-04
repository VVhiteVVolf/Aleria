import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applySceneRegenerationToStateMap,
  buildSceneRegenerationState,
  isSilentSceneRegeneration
} from '../modules/scene-regeneration/scene-regeneration-model.js';
import { applyCombatDamage, applyCombatResolutionState, deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
import { deriveCombatEncounterState } from '../modules/combat/combat-encounter-model.js';

const profile = () => ({
  maximumHitPoints: 39, currentHitPoints: 0, temporaryHitPoints: 7,
  resources: ['comment', 'short-rest', 'long-rest', 'scene', 'day', 'manual'].map((recovery, index) => ({
    id: `resource-${index}`, current: 0, maximum: index + 1, recovery,
    recoveryDayKey: 'scene:training:day-1'
  })),
  abilities: ['short-rest', 'long-rest', 'day', 'none'].map((recovery, index) => ({
    id: `ability-${index}`, usesCurrent: 0, usesMaximum: index + 1, recovery
  })),
  temporaryConditions: [
    { id: 'stun', blockedResource: 'action', active: true },
    { id: 'berserk', berserk: { survivalCharges: 0, activity: true }, active: true },
    { id: 'hangover', substance: { phase: 'hangover' }, active: true }
  ],
  conditions: [{ id: 'illness', healthTrait: true, mechanics: { maximumHitPoints: -4 } }],
  inventory: { currency: { copper: 23 }, items: [{ id: 'potion', quantity: 2 }] },
  experience: 1234,
  concentration: { instanceId: 'spell' }, channeling: { spellId: 'song' }
});

const receipt = (after, overrides = {}) => ({
  commentKind: 'scene-regeneration-event',
  serverValidatedMechanics: true,
  sceneRegeneration: { schemaVersion: 1, participants: [{ actorId: 'gawain', after }] },
  ...overrides
});

test('regeneration restores HP and every bounded resource without changing recovery schedules', () => {
  const before = profile();
  const original = structuredClone(before);
  const after = buildSceneRegenerationState(before);
  assert.equal(after.current, 39);
  assert.equal(after.maximum, 39);
  assert.equal(after.temporary, 0);
  assert.ok(after.resources.every(resource => resource.current === resource.maximum));
  assert.ok(after.abilities.every(ability => ability.usesCurrent === ability.usesMaximum));
  assert.deepEqual(after.resources.map(resource => resource.recovery), before.resources.map(resource => resource.recovery));
  assert.ok(after.resources.every(resource => resource.recoveryDayKey === 'scene:training:day-1'));
  assert.deepEqual(after.temporaryConditions, []);
  assert.equal(after.concentration, null);
  assert.equal(after.channeling, null);
  assert.equal(after.encounterAuraTemporaryHitPoints, null);
  assert.deepEqual(before, original);
  assert.equal(Object.hasOwn(after, 'conditions'), false);
  assert.equal(Object.hasOwn(after, 'inventory'), false);
  assert.equal(Object.hasOwn(after, 'experience'), false);
  assert.notEqual(after.resources[0], before.resources[0]);
  assert.notEqual(after.abilities[0], before.abilities[0]);
});

test('regeneration keeps fixed limitations in the resolved maximum and accepts profiles without resource arrays', () => {
  const after = buildSceneRegenerationState({ maximumHitPoints: 35, currentHitPoints: 2,
    conditions: [{ id: 'chronic', mechanics: { maximumHitPoints: -4 } }] });
  assert.equal(after.current, 35);
  assert.equal(after.maximum, 35);
  assert.deepEqual(after.resources, []);
  assert.deepEqual(after.abilities, []);
});

test('only validated regeneration receipts are silent and mechanically applied', () => {
  const after = buildSceneRegenerationState(profile());
  for (const overrides of [
    { serverValidatedMechanics: false }, { importedHistoricalMechanics: true },
    { commentKind: 'comment' }, { sceneRegeneration: null },
    { sceneRegeneration: { participants: {} } }
  ]) {
    const invalid = receipt(after, overrides);
    const states = new Map([['gawain', { current: 1 }]]);
    assert.equal(isSilentSceneRegeneration(invalid), false);
    assert.equal(applySceneRegenerationToStateMap(states, invalid), states);
    assert.deepEqual(states.get('gawain'), { current: 1 });
  }
  assert.equal(isSilentSceneRegeneration(receipt(after)), true);
  assert.equal(isSilentSceneRegeneration(null), false);
});

test('replay resets selected actors while preserving possessions and other actors', () => {
  const before = profile();
  const selected = { current: 0, maximum: 39, temporary: 7,
    inventory: before.inventory, equippedWeaponId: 'sword', conditions: before.conditions,
    temporaryConditions: before.temporaryConditions, concentration: before.concentration,
    channeling: before.channeling, encounterAuraTemporaryHitPoints: { encounterId: 'training', amount: 7 } };
  const untouched = { current: 11, resources: [{ id: 'mana', current: 1, maximum: 10 }] };
  const states = new Map([['gawain', selected], ['gildas', untouched]]);
  const after = buildSceneRegenerationState(before);
  const event = receipt({ ...after, inventory: { currency: { copper: 999 } }, equippedWeaponId: 'axe' });
  applySceneRegenerationToStateMap(states, event);
  assert.equal(states.get('gawain').current, 39);
  assert.equal(states.get('gawain').inventory, selected.inventory);
  assert.equal(states.get('gawain').conditions, selected.conditions);
  assert.equal(states.get('gawain').equippedWeaponId, 'sword');
  assert.equal(states.get('gildas'), untouched);
  states.get('gawain').resources[0].current = 0;
  assert.equal(after.resources[0].current, 1);
});

test('later combat damage uses the regenerated HP without changing the stored receipt', () => {
  const after = buildSceneRegenerationState(profile());
  const event = receipt(after);
  const original = structuredClone(event);
  const states = new Map();
  applySceneRegenerationToStateMap(states, event);
  const damage = applyCombatDamage(states.get('gawain'), 8);
  applyCombatResolutionState(states, { targetId: 'gawain', targetSnapshot: {
    hitPointsAfter: damage.after.current, maximumHitPoints: damage.after.maximum,
    temporaryHitPointsAfter: damage.after.temporary
  } });
  assert.equal(states.get('gawain').current, 31);
  assert.deepEqual(event, original);
});

test('historical replay keeps the old wounds and silent recovery does not tick another actor’s effects', () => {
  const event = receipt(buildSceneRegenerationState(profile()), { id: 'regenerate', narrator: true });
  const history = [
    { id: 'wounds', serverValidatedMechanics: true, combatStatus: { actorId: 'gawain', operation: 'add',
      after: { current: 0, maximum: 39, temporary: 7 } } },
    { id: 'other-state', serverValidatedMechanics: true, combatStatus: { actorId: 'gildas', operation: 'add',
      after: { current: 20, maximum: 40, temporaryConditions: [{ id: 'other-buff', name: 'Ermutigt', active: true,
        durationModel: { kind: 'scene-comments', remainingSceneComments: 3 }, mechanics: { attack: 1 } }] } } },
    event
  ];
  const original = structuredClone(history);
  const historical = deriveCombatStateFromComments(history, { commentId: 'regenerate' });
  assert.equal(historical.get('gawain').current, 0);
  assert.equal(historical.get('gawain').temporary, 7);
  const live = deriveCombatStateFromComments(history);
  assert.equal(live.get('gawain').current, 39);
  assert.equal(live.get('gawain').temporary, 0);
  assert.equal(live.get('gildas').temporaryConditions[0].durationModel.remainingSceneComments, 3);
  assert.deepEqual(history, original);
});

test('regeneration revives only selected defeated participants in an active encounter', () => {
  const start = { id: 'start', combatEncounter: { encounterId: 'training', operation: 'start',
    participants: ['gawain', 'gildas', 'retired'].map(actorId => ({ actorId, partyId: 'practice',
      status: actorId === 'retired' ? 'surrendered' : 'active' })) } };
  const defeats = ['gawain', 'gildas'].map(actorId => ({ id: `defeat-${actorId}`, combatResolution: {
    targetId: actorId, targetSnapshot: { hitPointsBefore: 5, hitPointsAfter: 0 }
  } }));
  const event = receipt(buildSceneRegenerationState(profile()), { id: 'regenerate' });
  event.sceneRegeneration.participants.push({ actorId: 'retired', after: buildSceneRegenerationState(profile()) });
  const encounter = deriveCombatEncounterState([start, ...defeats, event]).get('training');
  assert.equal(encounter.participants.get('gawain').status, 'active');
  assert.equal(encounter.participants.get('gildas').status, 'defeated');
  assert.equal(encounter.participants.get('retired').status, 'surrendered');
  assert.equal(encounter.revision, 'regenerate');

  const ended = { id: 'end', combatEncounter: { encounterId: 'training', operation: 'end' } };
  const historical = deriveCombatEncounterState([start, ...defeats, ended, event]).get('training');
  assert.equal(historical.active, false);
  assert.equal(historical.participants.get('gawain').status, 'defeated');
});

test('regenerating a caster ends linked concentration effects while preserving independent target effects', () => {
  const target = { id: 'target-state', serverValidatedMechanics: true, combatStatus: { actorId: 'gildas', operation: 'add', after: {
    temporaryConditions: [
      { id: 'sustained', active: true, concentrationOwnerId: 'gawain', concentrationInstanceId: 'spell', mechanics: { attack: 2 } },
      { id: 'independent', active: true, durationModel: { kind: 'permanent' }, mechanics: { armorClass: 1 } }
    ]
  } } };
  const caster = { id: 'caster-state', serverValidatedMechanics: true, combatStatus: { actorId: 'gawain', operation: 'add', after: {
    current: 10, maximum: 39, concentration: { instanceId: 'spell', tracksConditions: true }
  } } };
  const history = [target, caster];
  assert.equal(deriveCombatStateFromComments(history).get('gildas').temporaryConditions.length, 2);
  const states = deriveCombatStateFromComments([...history, receipt(buildSceneRegenerationState(profile()))]);
  assert.equal(states.get('gawain').concentration, null);
  assert.deepEqual(states.get('gildas').temporaryConditions.map(condition => condition.id), ['independent']);
});
