import test from 'node:test';
import assert from 'node:assert/strict';
import { deriveGroupSceneStates } from '../modules/landing/group-scene-state.js';
import { groupMemberSnapshots } from '../modules/landing/group-landing-data.js';
import { normalizeGroupLandingState } from '../modules/landing/group-landing-model.js';

const persistence = (kind, recordId, persistent = true) => ({ kind, recordId, persistent });
const resource = (id, current = 0, maximum = 1, scope = 'comment') => ({ id, name: id, current, maximum, scope });
const condition = (id, amount = 2, extra = {}) => ({ id, name: id, active: true,
  durationModel: { kind: 'actor-comments', remainingActorComments: amount }, ...extra });
const status = (kind, id, after, actorId = id, persistent = true) => ({ serverValidatedMechanics: true,
  combatStatus: { actorId, persistence: persistence(kind, id, persistent), operation: 'add', after } });
const state = (current = 10, conditions = []) => ({ current, maximum: 20, temporary: 0,
  resources: [resource('action'), resource('mana', 1, 5, 'persistent')], temporaryConditions: conditions });
function frozen(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.freeze(value); Object.values(value).forEach(frozen); }
  return value;
}

test('ordinary committed speech advances only the typed contributor when a character and creature share an ID', () => {
  const history = frozen([status('character', 'same', state(10, [condition('person-effect')])),
    status('creature', 'same', state(16, [condition('wolf-effect')])),
    { serverCommitted: true, characterId: 'same', commentKind: 'speech', text: 'Ich habe eine Idee.' }]);
  const before = JSON.stringify(history), states = deriveGroupSceneStates(history);
  assert.equal(states.get('character:same').temporaryConditions[0].remainingActorComments, 1);
  assert.equal(states.get('character:same').resources[0].current, 1);
  assert.equal(states.get('creature:same').temporaryConditions[0].durationModel.remainingActorComments, 2);
  assert.equal(states.get('creature:same').resources[0].current, 0);
  const spokenWolf = deriveGroupSceneStates([...history, { serverCommitted: true, actorType: 'creature', creatureId: 'same', characterId: 'same', commentKind: 'action' }]);
  assert.equal(spokenWolf.get('creature:same').temporaryConditions[0].remainingActorComments, 1);
  assert.equal(spokenWolf.get('character:same').temporaryConditions[0].remainingActorComments, 1);
  assert.equal(spokenWolf.get('creature:same').resources[0].current, 1);
  assert.equal(spokenWolf.get('character:same').resources[1].current, 1, 'speech does not restore persistent mana');
  assert.equal(JSON.stringify(history), before);
});

test('mixed ordinary segments resolve persistent scene aliases from status and skill receipts', () => {
  const history = [status('character', 'hero', state(10, [condition('hero-effect')])),
    status('creature', 'pet', state(15, [condition('pet-effect')]), 'pet-alias'),
    { serverValidatedMechanics: true, commentSegments: [{ skillResolution: { actorId: 'skill-alias', actorPersistence: persistence('creature', 'owl'), actorResourceSnapshot: { after: [resource('action')] } } }] },
    { serverCommitted: true, characterId: 'hero', commentSegments: [
      { kind: 'speech', characterId: 'hero' },
      { kind: 'speech', actorType: 'creature', creatureId: 'pet', sceneActorId: 'pet-alias', sceneActorSourceId: 'pet', characterId: 'pet-alias' },
      { kind: 'speech', actorType: 'creature', creatureId: 'owl', sceneActorId: 'skill-alias', characterId: 'skill-alias' }
    ] }];
  const states = deriveGroupSceneStates(frozen(history));
  assert.equal(states.get('character:hero').temporaryConditions[0].remainingActorComments, 1);
  assert.equal(states.get('creature:pet').temporaryConditions[0].remainingActorComments, 1);
  assert.equal(states.get('creature:owl').resources[0].current, 1);
  assert.equal(states.has('character:pet-alias'), false);
});

test('a rest provides its own authoritative aliases and keeps colliding participants distinct before rest normalization', () => {
  const participant = (kind, current, effect) => ({ actorId: 'same', persistence: persistence(kind, 'same'), after: {
    hitPoints: { current, maximum: current, temporary: 0 }, resources: [resource('mana', 4, 4, 'persistent')], abilities: [],
    conditions: [condition(effect, 2, { sourceActorId: 'same', sourcePersistence: persistence(kind, 'same') })]
  } });
  const history = frozen([{ serverValidatedMechanics: true, sceneRest: { type: 'long', participants: [
    participant('character', 20, 'person-effect'), participant('creature', 40, 'wolf-effect')
  ] } }, { serverCommitted: true, characterId: 'same', text: 'Aufbruch.' }]);
  const states = deriveGroupSceneStates(history);
  assert.equal(states.get('character:same').current, 20); assert.equal(states.get('creature:same').current, 40);
  assert.equal(states.get('character:same').temporaryConditions[0].sourceActorId, 'character:same');
  assert.equal(states.get('creature:same').temporaryConditions[0].sourceActorId, 'creature:same');
  assert.equal(states.get('character:same').temporaryConditions[0].remainingActorComments, 1);
  assert.equal(states.get('creature:same').temporaryConditions[0].durationModel.remainingActorComments, 2);
});

test('concentration conditions retain their actual caster across a character/creature ID collision and expire together', () => {
  const effect = { id: 'bound', name: 'Gebunden', active: true, sourceActorId: 'same', concentrationOwnerId: 'same',
    concentrationInstanceId: 'cast-1', durationModel: { kind: 'concentration', concentrationOwnerId: 'same' } };
  const history = frozen([{ serverValidatedMechanics: true, combatResolution: {
    actorId: 'same', targetId: 'same', actorPersistence: persistence('character', 'same'), targetPersistence: persistence('creature', 'same'),
    targetSnapshot: { hitPointsAfter: 12, maximumHitPoints: 20 }, targetConditionSnapshot: { after: [effect] },
    actorConcentrationSnapshot: { after: { ownerActorId: 'same', instanceId: 'cast-1', tracksConditions: true } }
  } }]);
  const states = deriveGroupSceneStates(history), applied = states.get('creature:same').temporaryConditions[0];
  assert.equal(states.get('character:same').concentration.ownerActorId, 'character:same');
  assert.equal(applied.sourceActorId, 'character:same'); assert.equal(applied.concentrationOwnerId, 'character:same');
  assert.equal(applied.durationModel.concentrationOwnerId, 'character:same');
  const carried = [...history, status('creature', 'same', { temporaryConditions: [structuredClone(effect)] }),
    { serverValidatedMechanics: true, combatResolution: { actorId: 'same', targetId: 'same', actorPersistence: persistence('creature', 'same'),
      targetPersistence: persistence('character', 'same'), actorConditionSnapshot: { before: [structuredClone(effect)], after: [structuredClone(effect)] } } }];
  const later = deriveGroupSceneStates(frozen(carried));
  assert.equal(later.get('creature:same').temporaryConditions[0].sourceActorId, 'character:same', 'a full snapshot must preserve the original caster, even when the affected creature is now acting');
  assert.equal(later.get('creature:same').temporaryConditions[0].concentrationOwnerId, 'character:same');
  const ended = deriveGroupSceneStates([...carried, status('character', 'same', { concentration: null })]);
  assert.deepEqual(ended.get('creature:same').temporaryConditions, []);
  assert.equal(history[0].combatResolution.targetConditionSnapshot.after[0], effect);
});

test('a nested critical consequence keeps source and affected actor separate, and ordinary creature speech ticks its loss once', () => {
  const consequence = { id: 'bleed', kind: 'hit', actorId: 'same', name: 'Blutung', condition: condition('bleed', 2, {
    sourceActorId: 'same', criticalConsequence: true, criticalPeriodicLoss: 2, criticalPersistence: persistence('creature', 'same')
  }) };
  const history = frozen([status('character', 'same', state(20)), status('creature', 'same', state(12)),
    { serverValidatedMechanics: true, combatResolution: { actorId: 'same', targetId: 'same', actorPersistence: persistence('character', 'same'),
      targetPersistence: persistence('creature', 'same'), counterAttacks: [{ resolution: { actorId: 'same', targetId: 'same',
        actorPersistence: persistence('character', 'same'), targetPersistence: persistence('creature', 'same'), criticalConsequence: consequence } }] } },
    { serverCommitted: true, characterId: 'same', text: 'Noch ein Wort.' }]);
  const before = deriveGroupSceneStates(history);
  assert.equal(before.get('creature:same').current, 12);
  assert.equal(before.get('creature:same').temporaryConditions[0].sourceActorId, 'character:same');
  const after = deriveGroupSceneStates([...history, { serverCommitted: true, actorType: 'creature', creatureId: 'same', characterId: 'same' }]);
  assert.equal(after.get('creature:same').current, 10);
  assert.equal(after.get('character:same').current, 20);
  assert.equal(after.get('creature:same').temporaryConditions[0].remainingActorComments, 1);
});

test('nonpersistent creature copies remain scene-local even when their alias equals the parent speaker ID', () => {
  const history = frozen([status('character', 'same', state(20, [condition('person-effect')])),
    status('creature', 'same', state(18, [condition('real-wolf-effect')])),
    status('creature', 'wolf-template', state(3, [condition('copy-effect')]), 'same', false),
    { serverCommitted: true, characterId: 'same', commentSegments: [
      { kind: 'speech', actorType: 'creature', sceneActorId: 'same', sceneActorSourceId: 'wolf-template', creatureId: 'wolf-template' }
    ] }]);
  const states = deriveGroupSceneStates(history);
  assert.equal(states.get('scene:same').temporaryConditions[0].remainingActorComments, 1);
  assert.equal(states.get('character:same').temporaryConditions[0].durationModel.remainingActorComments, 2);
  assert.equal(states.get('creature:same').temporaryConditions[0].durationModel.remainingActorComments, 2);
  assert.equal(states.has('creature:wolf-template'), false);
  const template = deriveGroupSceneStates([status('template', 'template-source', state(5), 'copy')]);
  assert.equal(template.get('scene:copy').current, 5); assert.equal(template.has('character:copy'), false);
});

test('ambiguous untyped third-party resource receipts never borrow the typed contribution actor identity', () => {
  const states = deriveGroupSceneStates(frozen([status('character', 'same', state()), status('creature', 'same', state()),
    { serverValidatedMechanics: true, combatResolution: { actorId: 'same', targetId: 'other', actorPersistence: persistence('character', 'same'),
      ruleResourceSnapshots: [{ sourceActorId: 'same', after: [resource('mana', 0, 5, 'persistent')] }] } }
  ]));
  assert.equal(states.get('scene:same').resources[0].current, 0);
  assert.equal(states.get('character:same').resources.find(row => row.id === 'mana').current, 1);
  assert.equal(states.get('creature:same').resources.find(row => row.id === 'mana').current, 1);
});

test('inventory uses, challenge snapshots and third-party rule sources keep typed actor references', () => {
  const history = frozen([status('creature', 'pet', state(), 'pet-alias'), { serverValidatedMechanics: true, commentSegments: [
    { inventoryUse: { actorId: 'user-alias', actorPersistence: persistence('creature', 'user'),
      conditionSnapshot: { after: [condition('food-effect', 2, { sourceActorId: 'user-alias' })] }, resourceSnapshot: { after: [resource('mana', 3, 5, 'persistent')] } } },
    { skillResolution: { actorId: 'hero', actorPersistence: persistence('character', 'hero'),
      ruleResourceSnapshots: [{ sourceActorId: 'pet-alias', after: [resource('mana', 2, 5, 'persistent')] }],
      herausforderungCombatSnapshots: [{ actorId: 'pet-alias', after: { channeling: { ownerActorId: 'pet-alias' },
        temporaryConditions: [condition('channel-effect', 2, { sourceActorId: 'pet-alias', durationModel: { kind: 'channeling', channelOwnerId: 'pet-alias' } })] } }] } }
  ] }]);
  const states = deriveGroupSceneStates(history);
  assert.equal(states.get('creature:user').temporaryConditions[0].sourceActorId, 'creature:user');
  assert.equal(states.get('creature:user').resources[0].current, 3);
  assert.equal(states.get('creature:pet').resources[0].current, 2);
  assert.equal(states.get('creature:pet').channeling.ownerActorId, 'creature:pet');
  assert.equal(states.get('creature:pet').temporaryConditions[0].durationModel.channelOwnerId, 'creature:pet');
  assert.equal(states.has('character:pet-alias'), false);
});

test('encounter aura references follow their typed aliases through application and encounter end', () => {
  const history = frozen([{ serverValidatedMechanics: true, combatEncounter: { encounterId: 'fight', operation: 'start',
    participants: [
      { actorId: 'person-alias', persistence: persistence('character', 'same'), entrySnapshot: { current: 20, maximum: 20, resources: [] } },
      { actorId: 'wolf-alias', persistence: persistence('creature', 'same'), entrySnapshot: { current: 30, maximum: 30, resources: [] } }
    ], auraApplications: [{ id: 'aura', encounterId: 'fight', sourceActorId: 'person-alias', targetActorId: 'wolf-alias', sourceActorName: 'Mara',
      auraName: 'Zuversicht', mechanics: { armorClass: 1 }, grantTemporaryHitPoints: true, temporaryHitPoints: 3 }] } }]);
  const states = deriveGroupSceneStates(history), wolf = states.get('creature:same');
  assert.equal(wolf.temporaryConditions[0].auraSourceActorId, 'character:same');
  assert.equal(wolf.encounterAuraTemporaryHitPoints.sources[0].sourceActorId, 'character:same');
  assert.equal(wolf.temporary, 3); assert.equal(states.get('character:same').temporaryConditions?.length || 0, 0);
  const ended = deriveGroupSceneStates([...history, { serverValidatedMechanics: true, combatEncounter: { encounterId: 'fight', operation: 'end', participants: [] } }]);
  assert.deepEqual(ended.get('creature:same').temporaryConditions, []); assert.equal(ended.get('creature:same').temporary, 0);
});

test('group readiness does not traverse or clone historical inventory and scene-item payloads', () => {
  const inventory = { toJSON() { throw Error('A historical inventory must not be cloned for readiness.'); } };
  inventory.self = inventory;
  const comment = { serverValidatedMechanics: true, commentSegments: [{ combatResolution: {
    actorId: 'hero', actorPersistence: persistence('character', 'hero'), actorHitPointSnapshot: { after: { current: 7, maximum: 20 } },
    actorInventorySnapshot: { after: inventory }, targetInventorySnapshot: { after: inventory }, sceneItemEvent: { operation: 'drop', sceneItemId: 'drop', item: inventory }
  } }] };
  const states = deriveGroupSceneStates([comment]);
  assert.equal(states.get('character:hero').current, 7);
  assert.equal(Object.hasOwn(states.get('character:hero'), 'inventory'), false);
  assert.equal(comment.commentSegments[0].combatResolution.actorInventorySnapshot.after, inventory);
});

test('the group landing projects ordinary contribution expiry while preserving canonical sheets and ignoring undone history', t => {
  const keys = ['getAvailableCommentCharacters', 'AleriaCreatures', 'AleriaCombat', 'sortCommentsByTimeline'];
  const previous = new Map(keys.map(key => [key, { exists: Object.hasOwn(globalThis, key), value: globalThis[key] }]));
  t.after(() => { for (const [key, before] of previous) { if (before.exists) globalThis[key] = before.value; else delete globalThis[key]; } });
  const person = frozen({ id: 'same', name: 'Prüfperson', combatProfile: { hitPoints: { current: 20, maximumOverride: 20 } } });
  const creature = frozen({ id: 'same', name: 'Prüfwolf', entityType: 'creature', combatProfile: { hitPoints: { current: 40, maximumOverride: 40 } } });
  const profile = frozen({ currentHitPoints: 20, maximumHitPoints: 20, resources: [], conditions: [], abilities: [], inventory: { items: [] } });
  globalThis.getAvailableCommentCharacters = () => [person]; globalThis.AleriaCreatures = { getAll: () => [creature] };
  globalThis.AleriaCombat = { getProfile: () => profile }; globalThis.sortCommentsByTimeline = rows => rows.slice().sort((a,b) => a.orderKey-b.orderKey);
  const group = normalizeGroupLandingState({ guests: [{ id: 'person', characterId: 'same', name: person.name }, { id: 'pet', kind: 'creature', creatureId: 'same', name: creature.name }] });
  const history = frozen([{ ...status('character', 'same', state(20, [condition('blocked', 1, { mechanics: { blocksActions: true } })])), orderKey: 1 },
    { serverCommitted: true, characterId: 'same', text: 'Ich bin wieder bereit.', orderKey: 2 },
    { ...status('character', 'same', state(0)), mechanicalUndone: true, orderKey: 3 },
    { ...status('creature', 'same', state(0)), importedHistoricalMechanics: true, orderKey: 4 }]);
  const before = JSON.stringify({ history, person, creature, profile });
  assert.equal(groupMemberSnapshots({ pages: [] }, group, history.slice(0, 1))[0].readiness.key, 'unavailable');
  const members = groupMemberSnapshots({ pages: [] }, group, [...history].reverse());
  assert.equal(members.find(row => row.kind === 'character').readiness.key, 'ready');
  assert.equal(members.find(row => row.kind === 'creature').readiness.current, 40);
  assert.equal(JSON.stringify({ history, person, creature, profile }), before);
});
