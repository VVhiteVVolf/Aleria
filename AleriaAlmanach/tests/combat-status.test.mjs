import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import { createManualCombatCondition, buildCombatStatusChange, formatStatusDuration } from '../modules/combat-status/combat-status-model.js';
import { COMBAT_STATUS_PRESETS, getStatusIcon } from '../modules/combat-status/combat-status-catalog.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { renderMiniCombatProfile, safeCombatImage } from '../modules/comments/comments-combat-mini-profile-view.js';

const condition = (overrides = {}) => createManualCombatCondition({ name: 'Ermutigt', durationKind: 'actor-comments', durationAmount: 2, mechanics: { attack: 2, armorClass: 1 }, ...overrides }, { id: 'manual:buff' });
const status = (after, extras = {}) => ({ id: 'status', serverValidatedMechanics: true, combatStatus: { actorId: 'gawain', operation: 'add', after }, ...extras });
const resources = [{ id: 'action', name: 'Aktion', current: 0, maximum: 1, recovery: 'comment' }, { id: 'special-action', name: 'Besondere Aktion', current: 1, maximum: 2 }];

test('manuelle Effekte übernehmen nur erlaubte, begrenzte Werte', () => {
  const effect = condition({ mechanics: { attack: 2, maximumHitPoints: 999, damage: -1 }, triggerRules: [{ effects: { damageModifier: 999 } }] });
  assert.deepEqual(effect.mechanics, { attack: 2, damage: -1 });
  assert.equal(effect.triggerRules, undefined);
  assert.throws(() => condition({ durationAmount: 0 }), /Dauer/);
  assert.throws(() => condition({ mechanics: { attack: 31 } }), /Boni/);
  assert.throws(() => condition({ durationKind: 'unknown' }), /Dauer/);
});

test('Zustandsverwaltung füllt keine Ressourcen und verbraucht keine Effektdauer', () => {
  const original = status({ resources, temporaryConditions: [condition()] });
  const after = buildCombatStatusChange({ operation: 'add', profile: {}, state: original.combatStatus.after, condition: condition({ name: 'Schutz' }) });
  const result = deriveCombatStateFromComments([original, status(after)]).get('gawain');
  assert.equal(result.resources[0].current, 0);
  assert.equal(result.resources[1].current, 1);
  assert.equal(result.temporaryConditions[0].durationModel.remainingActorComments, 2);
});

test('eigene Beiträge zählen einmal, auch bei mehreren Attacken; fremde nicht', () => {
  const start = status({ temporaryConditions: [condition()] });
  const own = { characterId: 'gawain', commentSegments: [{ characterId: 'gawain' }, { characterId: 'gawain' }] };
  let state = deriveCombatStateFromComments([start, { characterId: 'gildas' }, own]).get('gawain');
  assert.equal(formatStatusDuration(state.temporaryConditions[0]), '1 eigener Beitrag');
  state = deriveCombatStateFromComments([start, own, own]).get('gawain');
  assert.equal(state.temporaryConditions.length, 0);
});

test('ungeprüfte und importierte Zustandsänderungen werden nicht übernommen', () => {
  for (const invalid of [{ serverValidatedMechanics: false }, { importedHistoricalMechanics: true }]) {
    assert.equal(deriveCombatStateFromComments([status({ current: 999 }, invalid)]).size, 0);
  }
});

test('Vorher-Ansicht sieht spätere Änderungen nicht; Buffs wirken genau einmal', () => {
  const history = [status({ temporaryConditions: [condition()] })];
  assert.equal(deriveCombatStateFromComments(history, { commentId: 'status' }).size, 0);
  const base = { attackModifier: 5, totalDefense: 16, maximumHitPoints: 39, currentHitPoints: 39, conditions: [] };
  const resolved = overlayCombatHitPointState(base, deriveCombatStateFromComments(history).get('gawain'));
  assert.equal(resolved.attackModifier, 7);
  assert.equal(resolved.totalDefense, 17);
  assert.equal(resolved.currentHitPoints, 39);
});

test('Tageszustände enden beim Szenentagwechsel; andere bleiben', () => {
  const start = status({ temporaryConditions: [condition({ durationKind: 'day' }), condition({ name: 'Bleibt', durationKind: 'permanent' })] });
  const state = deriveCombatStateFromComments([start, { sceneTimeEvent: { anchorDay: 2 } }]).get('gawain');
  assert.deepEqual(state.temporaryConditions.map(item => item.name), ['Bleibt']);
});

test('Reset räumt temporäre Effekte auf und füllt auch begrenzte Fähigkeiten', () => {
  const after = buildCombatStatusChange({ operation: 'reset', profile: {}, resetState: {
    hitPoints: { current: 39, maximum: 39, temporary: 8 }, resources,
    abilities: [{ id: 'rare', usesCurrent: 0, usesMaximum: 1 }]
  } });
  assert.equal(after.current, 39); assert.equal(after.temporary, 0);
  assert.equal(after.resources[1].current, 2); assert.equal(after.abilities[0].usesCurrent, 1);
  assert.deepEqual(after.temporaryConditions, []); assert.equal(after.concentration, null);
  assert.throws(() => buildCombatStatusChange({ operation: 'remove', profile: { temporaryConditions: [{ id: 'aura', encounterAura: true }] }, conditionId: 'aura' }), /Kampfliste/);
});

test('alle Ressourcen, Restdauern und sichere Namen erscheinen in der Karte', () => {
  const profile = { name: '<script>unsafe</script>', effectiveLevel: 8, maximumHitPoints: 39, currentHitPoints: 10,
    resources: [...resources, { id: 'bonus-action', name: 'Bonusaktion', current: 1, maximum: 1 }, { id: 'reaction', name: 'Reaktion', current: 0, maximum: 1 }, { id: 'aura-focus', name: 'Aura-Fokus', current: 0, maximum: 1 }, { id: 'mana', name: 'Mana', current: 3, maximum: 15 }],
    conditions: [condition()], temporaryConditions: [condition()] };
  const html = renderMiniCombatProfile(profile, profile.name, { canManage: true, encounter: {} });
  for (const name of ['Bonusaktion', 'Reaktion', 'Aura-Fokus', 'Mana', '2 eigene Beiträge', '10/39']) assert.ok(html.includes(name));
  assert.ok(!html.includes('<script>'));
  assert.match(html, /reset-comment-combat-profile" disabled/);
  assert.ok(!renderMiniCombatProfile(profile, '', { canManage: true, historical: true }).includes('add-comment-combat-condition'));
  assert.equal(safeCombatImage('javascript:alert(1)'), '');
});

test('sämtliche angebotenen Baldurs-Gate-Icons liegen lokal vor', async () => {
  for (const preset of COMBAT_STATUS_PRESETS) await access(new URL(`../../${getStatusIcon({ presetId: preset.id }).slice(3)}`, import.meta.url));
});
