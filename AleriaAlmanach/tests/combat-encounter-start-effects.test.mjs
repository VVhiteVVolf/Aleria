import test from 'node:test';
import assert from 'node:assert/strict';
import { DEVELOPMENT_TRAITS } from '../modules/character-development/development-traits.js';
import { sanitizeCharacterCombatProfile, getCombatStartTemporaryHitPoints } from '../modules/combat/combat-profile-model.js';
import { buildCombatEncounterStartApplications } from '../modules/combat/combat-encounter-start-effects.js';
import { buildCombatEncounterAuraApplications } from '../modules/combat/combat-encounter-aura.js';
import { normalizeCombatEncounterEvent, applyCombatEncounterCommentToStateMap } from '../modules/combat/combat-encounter-model.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';

const readyTrait = DEVELOPMENT_TRAITS.find(trait => trait.id === 'development-trait-kampfbereit');
const profile = extra => sanitizeCharacterCombatProfile({ quirks: [readyTrait], progression: { level: 1, development: { mode: 'purchase' } }, ...extra });
const participant = (actorId = 'ready', source = profile()) => ({ actorId, status: 'active', profile: source, partyId: 'friends',
  entrySnapshot: { current: 8, maximum: 30, temporary: 0, resources: [{ id: 'mana', current: 1, maximum: 10 }] } });
const event = (operation = 'start', participants = [participant()], encounterId = 'fight', includeApplications = true) => ({
  id: `${operation}-${encounterId}`, combatEncounter: normalizeCombatEncounterEvent({ encounterId, operation, participants,
    ...(includeApplications ? { startApplications: buildCombatEncounterStartApplications(participants, { enteringActorIds: participants.map(participant => participant.actorId) }) } : {}) })
});

test('a new combat grants the active personal start trait once without healing or recovering persistent resources', () => {
  const states = new Map();
  applyCombatEncounterCommentToStateMap(states, event());
  assert.equal(states.get('ready').temporary, 3);
  assert.equal(states.get('ready').current, 8);
  assert.equal(states.get('ready').resources[0].current, 1);
  states.set('ready', { ...states.get('ready'), temporary: 1 });
  applyCombatEncounterCommentToStateMap(states, event('add'));
  assert.equal(states.get('ready').temporary, 1);
});

test('leaving and resuming the same combat cannot refill consumed temporary hit points', () => {
  const states = new Map();
  applyCombatEncounterCommentToStateMap(states, event());
  states.set('ready', { ...states.get('ready'), temporary: 0, current: 5 });
  applyCombatEncounterCommentToStateMap(states, event('remove', [{ ...participant(), status: 'fled' }]));
  applyCombatEncounterCommentToStateMap(states, event('add'));
  assert.equal(states.get('ready').temporary, 0);
  assert.equal(states.get('ready').current, 5);
  assert.deepEqual(states.get('ready').combatStartEffectEncounterIds, ['fight']);
});

test('reloading history reproduces remaining temporary hit points and never upgrades historical starts', () => {
  const damage = { id: 'damage', combatResolution: { actorId: 'enemy', targetId: 'ready',
    targetSnapshot: { hitPointsBefore: 8, hitPointsAfter: 8, maximumHitPoints: 30, temporaryHitPointsBefore: 3, temporaryHitPointsAfter: 1 } } };
  const history = [event(), damage, event('add')];
  assert.equal(deriveCombatStateFromComments(history).get('ready').temporary, 1);
  assert.deepEqual(deriveCombatStateFromComments(history), deriveCombatStateFromComments(history));
  const historical = deriveCombatStateFromComments([event('start', [participant()], 'old-fight', false)]);
  assert.equal(historical.get('ready').temporary, 0);
  assert.equal(historical.get('ready').combatStartEffectEncounterIds, undefined);
});

test('inactive traits and inactive participants grant nothing, and start effects do not add to stronger temporary hit points', () => {
  assert.equal(getCombatStartTemporaryHitPoints(profile({ quirks: [{ ...readyTrait, active: false }] })), 0);
  assert.deepEqual(buildCombatEncounterStartApplications([{ ...participant(), status: 'defeated' }], { enteringActorIds: ['ready'] }), []);
  assert.deepEqual(buildCombatEncounterStartApplications([participant()], { enteringActorIds: [] }), []);
  const states = new Map([['ready', { temporary: 9 }]]);
  applyCombatEncounterCommentToStateMap(states, event('add'));
  assert.equal(states.get('ready').temporary, 9);
  const stronger = profile({ abilities: [{ id: 'other-passive', active: true, activationType: 'passive', mechanics: { combatStartTemporaryHitPoints: 5 } }] });
  assert.equal(getCombatStartTemporaryHitPoints(stronger), 5);
});

test('later participants get their first start grant and a genuinely new combat can grant it again', () => {
  const states = new Map();
  applyCombatEncounterCommentToStateMap(states, event());
  states.set('ready', { ...states.get('ready'), temporary: 0 });
  applyCombatEncounterCommentToStateMap(states, event('add', [participant('late')]));
  assert.equal(states.get('late').temporary, 3);
  assert.equal(states.get('ready').temporary, 0);
  applyCombatEncounterCommentToStateMap(states, event('end'));
  applyCombatEncounterCommentToStateMap(states, event('start', [participant()], 'next-fight'));
  assert.equal(states.get('ready').temporary, 3);
});

test('self aura start effects and outside aura grants use the same maximum and preserve their separate lifecycle', () => {
  const self = participant('ready', profile({ aura: { enabled: true, latentPresence: { enabled: true, active: true, selfMechanics: { combatStartTemporaryHitPoints: 4 } } } }));
  assert.equal(getCombatStartTemporaryHitPoints(self.profile), 4);
  const source = { ...participant('aura-source'), profile: profile({ quirks: [], aura: { enabled: true, latentPresence: {
    enabled: true, active: true, target: 'Verbündete', radius: 'Kampfszene', allyMechanics: { combatStartTemporaryHitPoints: 12 }
  } } }) };
  const start = event('start', [self, source]);
  start.combatEncounter.auraApplications = buildCombatEncounterAuraApplications([self, source], { encounterId: 'fight', grantAllTemporaryHitPoints: true });
  const states = new Map();
  applyCombatEncounterCommentToStateMap(states, start);
  assert.equal(states.get('ready').temporary, 12);
  applyCombatEncounterCommentToStateMap(states, event('end'));
  assert.equal(states.get('ready').temporary, 4);
});
