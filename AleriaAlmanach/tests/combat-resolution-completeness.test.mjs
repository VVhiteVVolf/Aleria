import assert from 'node:assert/strict';
import test from 'node:test';
import { attachCriticalConsequences } from '../modules/combat-critical/combat-critical-resolution.js';
import { getStoredCriticalConsequences, getResolutionSceneItemEvents } from '../modules/combat/combat-resolution-tree.js';
import { deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
import { deriveSceneItems } from '../modules/scene-items/scene-items-model.js';
import { buildCombatEncounterSummary, reconcileEncounterSummaryMetrics } from '../modules/combat/combat-encounter-summary.js';
import { renderEncounterSummary } from '../modules/combat-encounter/combat-encounter-summary-ui.js';
import { renderCombatEvaluation } from '../modules/combat/ui/combat-ui.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { fighter, receipts } from './fixtures/jungdrache-fixtures.mjs';
import { getActiveCombatEncounter } from '../modules/combat/combat-encounter-model.js';
import { getSceneCombatDocumentation } from '../modules/combat-status/combat-scene-documentation.js';
import { renderMiniCombatProfile } from '../modules/combat-status/combat-profile-summary-view.js';

const profile = id => {
  const weapon = { id: `${id}-blade`, inventoryItemId: `${id}-item`, name: 'Klinge', damageFormula: '1d8', equipped: true, weaponType: 'sword' };
  return { characterId: id, name: id, currentHitPoints: 40, maximumHitPoints: 40,
    persistence: { kind: 'character', recordId: id }, weapon, weapons: [weapon] };
};
const attack = (naturalRoll, hit = naturalRoll !== 1) => ({ naturalRoll, diceResults: [naturalRoll], hit,
  criticalSuccess: naturalRoll === 20, criticalFailure: naturalRoll === 1, total: naturalRoll + 5, targetDefense: 12 });
const resolution = (actorId, targetId, natural = 20) => ({ actorId, targetId, actorName: actorId, targetName: targetId,
  actionType: 'attack', resolutionMode: 'weapon-attack', profileActionKind: 'weapon', weapon: { name: 'Klinge' },
  attack: attack(natural), followUpAttacks: [], damage: { total: 8 }, resourceCosts: [],
  targetSnapshot: { hitPointsBefore: 40, hitPointsAfter: 32, maximumHitPoints: 40, temporaryHitPointsAfter: 0 } });
const encounter = { encounterId: 'battle', criticalEffectsVersion: 1 };
const apply = (r, rolls, used = new Set()) => attachCriticalConsequences(r, { encounter, actor: profile('a'), target: profile('b'),
  usedConsequenceKeys: used, id: 'post:0:0', rollFor: () => rolls.shift() });
const comment = (r, id = 'action') => ({ id, characterId: r.actorId, commentSegments: [{ combatResolution: r }] });

test('a counter gets its own server-selectable aftermath, replay and UI without copying its critical onto the initiating attack', () => {
  const r = resolution('a', 'b', 8);
  r.attack.hit = false; r.damage = null;
  r.counterAttacks = [{ stance: 'Klaue', actorName: 'b', targetName: 'a', resolution: resolution('b', 'a') }];
  apply(r, [3]);
  assert.equal(r.criticalConsequence, undefined);
  assert.equal(getStoredCriticalConsequences(r)[0].actorId, 'a');
  const states = deriveCombatStateFromComments([comment(r)]);
  assert.equal(states.get('a').temporaryConditions[0].name, 'Unsicherer Griff');
  assert.match(renderCombatEvaluation({ combatResolution: r }), /W20 · 3 · Unsicherer Griff/);
});

test('one paid sequence may have one hit and one failure consequence; limits also cover later segments and counter actors independently', () => {
  const r = resolution('a', 'b');
  r.followUpAttacks = [{ attack: attack(1) }, { attack: attack(20) }];
  r.counterAttacks = [{ resolution: resolution('b', 'a') }];
  const used = new Set();
  const rolls = [7, 2, 3];
  apply(r, rolls, used);
  assert.equal(rolls.length, 0);
  assert.equal(getStoredCriticalConsequences(r).length, 3);
  assert.equal(r.criticalConsequences.length, 2);
  const later = resolution('a', 'b');
  apply(later, [], used);
  assert.equal(later.criticalConsequence, undefined);
  assert.match(later.mechanicNotes.join(' '), /Limit/);
});

test('nested disarms circulate once and legacy singular W10 receipts retain their original representation', () => {
  const r = resolution('a', 'b', 8);
  r.counterAttacks = [{ resolution: resolution('b', 'a') }];
  apply(r, [10]);
  assert.equal(getResolutionSceneItemEvents(r).length, 1);
  assert.equal(deriveSceneItems([comment(r)]).size, 1);
  const old = { criticalConsequence: { id: 'old', version: 1, roll: 10, name: 'Alt' } };
  const before = structuredClone(old);
  assert.deepEqual(getStoredCriticalConsequences(old), [old.criticalConsequence]);
  assert.deepEqual(old, before);
});

test('two aftermaths cannot drop the same held weapon twice in one resolution tree', () => {
  const r = resolution('a', 'b', 1);
  r.counterAttacks = [{ resolution: resolution('b', 'a') }];
  apply(r, [10, 10]);
  assert.equal(getStoredCriticalConsequences(r).length, 2);
  assert.equal(getResolutionSceneItemEvents(r).length, 1);
  assert.equal(getStoredCriticalConsequences(r)[1].name, 'Gleichgewicht verloren');
});

test('summary includes counter damage, costs and highlights without duplicating aggregated follow-up damage or merged reaction receipts', () => {
  const r = resolution('a', 'b', 8);
  r.damage.total = 14; r.followUpAttacks = [{ attack: attack(20), damage: { total: 6 } }];
  const counter = resolution('b', 'a'); counter.damage.total = 24;
  const cost = { sourceActorId: 'b', applicationKey: 'defense', before: [{ id: 'reserve', name: 'Reserve', current: 2 }], after: [{ id: 'reserve', current: 1 }] };
  r.ruleResourceSnapshots = [cost]; counter.ruleResourceSnapshots = [structuredClone(cost)];
  r.counterAttacks = [{ resolution: counter }];
  const participants = ['a', 'b'].map(actorId => ({ actorId, name: actorId, entrySnapshot: { current: 40, maximum: 40 } }));
  const comments = [{ id: 'start', combatEncounter: { ...encounter, operation: 'start', participants } }, comment(r)];
  const summary = buildCombatEncounterSummary({ encounterId: 'battle', participants, comments });
  assert.deepEqual(summary.participants.map(p => p.damage), [14, 24]);
  assert.equal(summary.actionCount, 2);
  assert.equal(summary.participants[1].costs[0].amount, 1);
  assert.equal(summary.highlights.length, 2);
  assert.ok(summary.highlights.every(h => h.actionName === 'Klinge'));
  const event = { ...encounter, operation: 'end', participants, summary: { ...summary,
    participants: summary.participants.map(p => ({ ...p, damage: 0, after: { current: 17, maximum: 40 } })) } };
  const before = structuredClone(event);
  assert.equal(reconcileEncounterSummaryMetrics(event, comments).participants[1].damage, 24);
  assert.equal(reconcileEncounterSummaryMetrics(event, comments).participants[1].after.current, 17);
  assert.match(renderEncounterSummary(event, { comments }), /<td>24<\/td>/);
  assert.deepEqual(event, before, 'historical receipt and stored summary are not rewritten');
});

test('a partial four-hit sequence is labelled by all rolls, including a critical follow-up', () => {
  const r = resolution('a', 'b', 4); r.attack.hit = false;
  r.followUpAttacks = [{ attack: attack(20), damage: { total: 8 } }, { attack: attack(4, false) }, { attack: attack(2, false) }];
  assert.match(renderCombatEvaluation({ combatResolution: r }), /Angriffsfolge · 1\/4 Treffer · kritisch/);
});

test('saving throw dice keep the target’s saving result instead of using attack hit/miss labels', () => {
  const r = resolution('a', 'b', 15);
  r.resolutionMode = 'saving-throw'; r.profileActionKind = 'spell';
  r.attack = { ...r.attack, hit: false, resolutionMode: 'saving-throw', saveSucceeded: true };
  assert.match(renderCombatEvaluation({ combatResolution: r }), /Rettungswurf: W20 \[15\].*gelungen/);
  assert.doesNotMatch(renderCombatEvaluation({ combatResolution: r }), /W20 \[15\][^<]*verfehlt/);
});

test('training and duels reject damage against zero HP before any new die or payment; other scene policies remain explicit', async () => {
  const actor = fighter('Asgeir Wolfshorn');
  const target = { ...fighter('Gawain Draig'), currentHitPoints: 0 };
  const service = new CombatResolutionService({ rollAttack() { throw Error('should not roll'); } });
  for (const combatType of ['training', 'duel']) await assert.rejects(service.resolveAttack({ actor, target }, {
    encounter: { combatType }
  }), /bereits kampfunfähig/);
  await assert.doesNotReject(new CombatResolutionService(receipts()).resolveAttack({ actor, target }, { encounter: { combatType: 'combat' } }));
  const healer = { ...actor, actionResolutionMode: 'automatic', profileActionKind: 'ability',
    selectedAction: { ...actor.selectedAction, resolutionMode: 'automatic', effects: [{ id: 'healing', type: 'healing', target: 'target', on: 'always', formula: '1d4' }] } };
  const healed = await new CombatResolutionService(receipts()).resolveAttack({ actor: healer, target }, { encounter: { combatType: 'training' } });
  assert.ok(healed.targetSnapshot.hitPointsAfter > 0);
});

test('a counter defeat updates the encounter roster and administrative events preserve spent resources and effect clocks', () => {
  const r = resolution('a', 'b', 8);
  const counter = resolution('b', 'a');
  counter.targetSnapshot = { hitPointsBefore: 8, hitPointsAfter: 0 };
  counter.defeat = { occurred: true };
  r.counterAttacks = [{ resolution: counter }];
  r.actorHitPointSnapshot = { after: { current: 0, maximum: 40 } };
  r.actorResourceSnapshot = { after: [{ id: 'action', scope: 'comment', current: 0, maximum: 1 },
    { id: 'special-action', current: 0, maximum: 2 }] };
  const start = { id: 'start', combatEncounter: { ...encounter, operation: 'start', participants: ['a', 'b'].map(actorId => ({ actorId })) } };
  assert.equal(getActiveCombatEncounter([start, comment(r)]).participants.get('a').status, 'defeated');
  const status = { id: 'status', serverValidatedMechanics: true, combatStatus: { actorId: 'a', operation: 'add', after: {
    temporaryConditions: [{ id: 'pending', active: true, name: 'Vorbereitung', durationModel: { kind: 'actor-comments', remainingActorComments: 2 } }]
  } } };
  const end = { id: 'end', characterId: 'a', combatEncounter: { ...encounter, operation: 'end', participants: [] } };
  const state = deriveCombatStateFromComments([start, comment(r), status, end]).get('a');
  assert.equal(state.resources.find(resource => resource.id === 'action').current, 0);
  assert.equal(state.resources.find(resource => resource.id === 'special-action').current, 0);
  assert.equal(state.temporaryConditions[0].durationModel.remainingActorComments, 2);
});

test('the current scene profile documents conditional penalties, preparation, secondary hands and confirmed counter HP transitions', () => {
  const r = resolution('a', 'b', 8);
  const counter = resolution('b', 'a');
  r.counterAttacks = [{ resolution: counter }];
  apply(r, [3]);
  const current = { ...profile('a'), currentHitPoints: 0, maximumHitPoints: 40, conditions: [], temporaryConditions: [
    { ...getStoredCriticalConsequences(r)[0].condition, damageGuard: { charges: 1, reduction: 2 }, counterAttack: { enabled: true } }
  ], combat: { offHandWeaponId: 'dagger' }, weapons: [...profile('a').weapons, { id: 'dagger', name: 'Linker Dolch', weaponType: 'dagger' }] };
  current.sceneDocumentation = getSceneCombatDocumentation(current, [comment(r)], 'scene');
  const markup = renderMiniCombatProfile(current);
  assert.match(markup, /Kampfunfähig/);
  assert.match(markup, /Zweite Hand: Linker Dolch/);
  assert.match(markup, /Unsicherer Griff/);
  assert.match(markup, /Angriff -1/);
  assert.match(markup, /Einmaliger Konter/);
  assert.match(markup, /Nächster Treffer: −2/);
  assert.match(markup, /TP 40 → 32/);
  assert.match(markup, /W20 3/);
});
