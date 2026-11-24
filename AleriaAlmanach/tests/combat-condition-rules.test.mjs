import assert from 'node:assert/strict';
import test from 'node:test';
import { COMBAT_CONDITION_RULES } from '../modules/combat-status/combat-condition-rules.js';
import { createManualCombatCondition, buildCombatStatusChange } from '../modules/combat-status/combat-status-model.js';
import { resolveCombatProfile, validateCombatActorProfile } from '../modules/combat/combat-profile-resolver.js';
import { getSavingThrowTotal, sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { applyPeriodicConditionDamage } from '../modules/combat/combat-condition-periodic.js';
import { normalizeRuntimeCondition, expireConditionsForRest } from '../modules/combat/combat-condition-duration.js';
import { conditionsAfterHealing } from '../modules/combat/combat-condition-lifecycle.js';
import { applyTypedCombatDamage, normalizeCombatEffects } from '../modules/combat/combat-effect-model.js';
import { getHealthTaskError } from '../modules/character-health/health-trait-policy.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';

const sheet = (id, extra = {}) => ({ id, name: id, combatProfile: {
  hitPoints: { current: 40, maximumOverride: 40 }, combat: { movement: 9 },
  weapons: [{ id: 'blade', name: 'Klinge', equipped: true, weaponType: 'sword', damageFormula: '1d8' }], ...extra
} });

const manual = (presetId, extra = {}) => createManualCombatCondition({ presetId, durationKind: 'actor-comments', durationAmount: 2, ...extra }, { id: `manual:${presetId}` });
const overlaid = (profile, ...temporaryConditions) => overlayCombatHitPointState(profile, { temporaryConditions });
const action = 'weapon:blade';

test('jede auswählbare Standardvorlage hat mindestens einen strukturierten Regeleffekt', () => {
  for (const [id, rule] of Object.entries(COMBAT_CONDITION_RULES)) {
    const condition = manual(id);
    assert.equal(condition.name, rule.name);
    assert.ok(Object.keys(condition.mechanics).length || condition.periodicDamage || condition.blockedResource
      || condition.blocksMovement || condition.blockedSense || condition.blocksVoice, id);
  }
  assert.deepEqual(manual('blessed', { mechanics: { attack: 0, savingThrow: 3 } }).mechanics, { attack: 0, savingThrow: 3 });
  const labelOnly = normalizeRuntimeCondition({ name: 'Benommen', id: 'nur-erzählung' });
  assert.equal(labelOnly.blockedResource, undefined);
  const separate = normalizeCombatEffects(['poisoned', 'frostburn'].map(presetId => ({ type: 'apply-condition', condition: { presetId } })));
  assert.notEqual(separate[0].condition.id, separate[1].condition.id);
  assert.equal(separate[1].condition.durationModel.remainingActorComments, 1);
});

test('Frostbrand wirkt rechnerisch auf Rettung und Bewegung, ein dauerhafter Zustand bleibt nach dem Ende des Szeneneffekts', () => {
  const base = resolveCombatProfile(sheet('Ritter', { conditions: [{ id: 'alter-bruch', presetId: 'slowed', name: 'Alter Bruch' }] }));
  const live = overlaid(base, manual('frostburn'));
  assert.equal(base.movement, 6);
  assert.equal(live.movement, 3);
  assert.equal(getSavingThrowTotal(live, 'dexterity'), getSavingThrowTotal(base, 'dexterity') - 1);
  const restored = overlaid(live, ...expireConditionsForRest([manual('frostburn', { durationKind: 'short-rest' })], 'short'));
  assert.equal(restored.movement, 6);
  assert.equal(restored.conditions[0].name, 'Alter Bruch');
  assert.equal(restored.temporaryConditions.length, 0);
});

test('Benommen sperrt nur die Hauptaktion, Gelähmt lässt Abwarten zu und Festgesetzt lässt angreifen', () => {
  const character = sheet('Ritter');
  const base = resolveCombatProfile(character, { actionId: action });
  const dazed = manual('dazed', { durationAmount: 1 });
  const withDaze = overlaid(base, dazed);
  const balance = id => withDaze.resources.find(entry => entry.id === id).current;
  assert.equal(balance('action'), 0);
  assert.ok(balance('bonus-action') > 0 && balance('reaction') > 0);
  const state = buildCombatStatusChange({ operation: 'add', profile: base, condition: dazed });
  const start = { serverValidatedMechanics: true, combatStatus: { actorId: character.id, operation: 'add', after: state } };
  const current = deriveCombatStateFromComments([start, { characterId: character.id }]).get(character.id);
  assert.equal(current.temporaryConditions[0].actionLockRecovery, true);
  assert.throws(() => buildCombatStatusChange({ operation: 'add', profile: base, state: current, condition: dazed }), /Handlungssicherheit/);
  const paralysis = manual('paralyzed');
  const paralyzed = overlaid(base, paralysis);
  assert.equal(paralyzed.movement, 0);
  assert.equal(validateCombatActorProfile(paralyzed).ready, false);
  assert.equal(validateCombatActorProfile(overlaid(resolveCombatProfile(character, { actionId: 'combat:wait' }), paralysis)).ready, true);
  const restrained = overlaid(base, manual('restrained'));
  assert.equal(restrained.movement, 0);
  assert.equal(validateCombatActorProfile(restrained).ready, true);
  const specialized = sheet('Ritter', { conditions: [{ id: 'kalte-hand', presetId: 'paralyzed', blocksMovement: false, mechanics: { blocksActions: false, attack: -1 } }] });
  const roundTrip = resolveCombatProfile({ ...specialized, combatProfile: sanitizeCharacterCombatProfile(specialized.combatProfile) }, { actionId: action });
  assert.equal(roundTrip.movement, 9);
  assert.equal(validateCombatActorProfile(roundTrip).ready, true);
  assert.equal(roundTrip.attackModifier, base.attackModifier - 1);
});

test('Blendung und Verstummen prüfen den tatsächlichen Sinn oder die Stimmvoraussetzung', () => {
  const base = overlaid(resolveCombatProfile(sheet('Ritter'), { actionId: action }), manual('blinded'), manual('silenced'));
  assert.match(getHealthTaskError(base, { sense: 'vision' }), /Geblendet/);
  assert.equal(getHealthTaskError(base, { sense: 'hearing' }), '');
  assert.equal(validateCombatActorProfile(base).ready, true);
  assert.equal(validateCombatActorProfile({ ...base, selectedAction: { ...base.selectedAction, requiresVoice: true } }).ready, false);
});

test('Feuer und Blutung werden je Beitrag einmal gebucht, alte Belege behalten ihre TP', () => {
  const initial = { current: 20, maximum: 40, temporary: 1, temporaryConditions: [manual('burning'), manual('wet'), manual('bleeding'),
    { ...manual('burning'), id: 'another-fire' }] };
  const start = { id: 'status', serverValidatedMechanics: true, combatStatus: { actorId: 'a', operation: 'add', after: initial } };
  const post = { id: 'post', serverCommitted: true, characterId: 'a', commentSegments: [{ characterId: 'a' }, { characterId: 'a' }] };
  assert.equal(deriveCombatStateFromComments([start, post]).get('a').current, 20);
  const working = deriveCombatStateFromComments([start]);
  const events = applyPeriodicConditionDamage(working, post);
  assert.deepEqual(events.map(event => [event.conditionId, event.loss, event.absorbedByTemporary]), [['manual:burning', 0, 1], ['manual:bleeding', 1, 0]]);
  const saved = { ...post, serverValidatedMechanics: true, criticalLifecycle: events };
  assert.equal(deriveCombatStateFromComments([start, saved]).get('a').current, 19);
  assert.equal(deriveCombatStateFromComments([start, saved]).get('a').temporary, 0);
  assert.equal(applyPeriodicConditionDamage(working, { ...post, sceneRest: {} }).length, 0);
  assert.equal(applyPeriodicConditionDamage(working, { ...post, commentSegments: [{ commentKind: 'foreignvoice', characterId: 'a' }] }).length, 0);
  assert.equal(conditionsAfterHealing(initial.temporaryConditions, { current: 19 }, { current: 20 }).some(condition => condition.presetId === 'bleeding'), false);
  assert.equal(applyTypedCombatDamage(initial, 3, { conditions: [manual('wet')] }, { damageType: 'Blitz' }).incoming, 6);
});

test('ein Quellenbonus bleibt erhalten, spezielle Biss- und Trollregeln ersetzen den allgemeinen Nachschaden', () => {
  const stronger = normalizeRuntimeCondition({ presetId: 'frostburn', mechanics: { movement: -6 }, durationModel: { kind: 'combat' } });
  assert.equal(stronger.mechanics.movement, -6);
  assert.equal(stronger.durationModel.kind, 'combat');
  const states = new Map([['a', { current: 20, maximum: 20, temporaryConditions: [manual('burning'), manual('bleeding'),
    { presetId: 'bleeding', criticalPeriodicLoss: 2, id: 'versunkenenbiss' }] }]]);
  const events = applyPeriodicConditionDamage(states, { characterId: 'a' }, () => ({ abilities: [{ regeneration: { burningDamage: '1d4' } }] }));
  assert.equal(events.length, 0);
  assert.equal(states.get('a').current, 20);
});

test('Waffe, auslösende Marotte und Zauber wenden dieselbe Vorlagenmechanik an', async () => {
  const hitEffect = (id, presetId) => ({ id, type: 'apply-condition', on: 'hit', target: 'target', condition: { id, presetId } });
  const character = sheet('Kämpfer', {
    weapons: [{ id: 'blade', name: 'Klinge', equipped: true, weaponType: 'sword', damageFormula: '1d8', effects: [hitEffect('weapon-poison', 'poisoned')] }],
    quirks: [{ id: 'quirk', name: 'Eisige Wut', active: true, triggerRules: [{ id: 'frost-on-hit', phase: 'post-hit', condition: 'hit', resultEffects: [hitEffect('trait-frost', 'frostburn')] }] }],
    magic: { enabled: true, spells: [{ id: 'stille', name: 'Stille', level: 0, resolutionType: 'automatic', effects: [{ ...hitEffect('spell-silence', 'silenced'), on: 'always' }] }] }
  });
  const target = resolveCombatProfile(sheet('Ziel'), { actionId: action });
  const dice = { rollAttack: async ({ modifier }) => ({ total: 18 + modifier, natural: 18, dice: [18], keptDice: [18] }),
    rollDamage: async ({ bonus }) => ({ total: 5 + bonus, dice: [5], keptDice: [5] }) };
  const service = new CombatResolutionService(dice);
  const actor = resolveCombatProfile(character, { actionId: action });
  const weapon = await service.resolveAttack({ actor, target });
  assert.ok(weapon.damage.total > 0);
  const poison = weapon.targetConditionSnapshot.after.find(condition => condition.presetId === 'poisoned');
  const frost = weapon.targetConditionSnapshot.after.find(condition => condition.presetId === 'frostburn');
  assert.equal(poison.mechanics.attackRollMode, 'disadvantage');
  assert.equal(frost.mechanics.movement, -3);
  assert.equal(frost.source, 'Eisige Wut');
  const spell = await service.resolveAttack({ actor: resolveCombatProfile(character, { actionId: 'spell:stille' }), target });
  assert.ok(spell.targetConditionSnapshot.after.some(condition => condition.presetId === 'silenced' && condition.blocksVoice));
});
