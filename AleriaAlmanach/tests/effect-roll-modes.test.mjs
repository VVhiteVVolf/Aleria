import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { SkillResolutionService, getSkillRollContext } from '../modules/skill-checks/skill-resolution-service.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState, deriveCombatStateFromComments } from '../modules/combat/combat-state-model.js';
import { createManualCombatCondition } from '../modules/combat-status/combat-status-model.js';
import { getActiveRollModes } from '../modules/combat/combat-profile-model.js';
import { mergeRollModes } from '../modules/combat/combat-roll-mode.js';
import { renderAutomaticRollMode } from '../modules/combat/ui/combat-roll-mode-view.js';
import { getCommentConditionActorIds, renderCommentActorConditions } from '../modules/comments/comments-condition-tracker.js';

const record = JSON.parse(await readFile(new URL('../../Charakter%20Archiv%20Exporte/gawain-draig.json', import.meta.url), 'utf8')).character;
const enemy = resolveCombatProfile({ ...structuredClone(record), id: 'enemy', name: 'Gegner' });
const effect = (mode, extra = {}) => createManualCombatCondition({ presetId: mode, durationKind: 'actor-comments', durationAmount: 2, ...extra }, { id: `manual:${mode}` });
const actor = (conditions = []) => overlayCombatHitPointState(resolveCombatProfile(record), { temporaryConditions: conditions });
const dice = {
  async rollAttack({ modifier = 0, rollMode }) { return { natural: 12, total: 12 + modifier, dice: rollMode === 'normal' ? [12] : [12, 8] }; },
  async rollSkill(options) { return this.rollAttack(options); },
  async rollDamage() { return { total: 2, dice: [2] }; }
};
const attack = (profile, rollMode = 'normal') => new CombatResolutionService(dice).resolveAttack({ actor: profile, target: enemy, rollMode });
const skill = (profile, rollMode = 'normal') => new SkillResolutionService(dice).resolve({ actor: record, settings: { skillId: 'athletics', difficulty: 10, rollMode } }, { actorProfile: profile });

test('Gawains bestehende Eigenheit bestimmt Vorschau und Auswertung sozialer Proben', async () => {
  const params = { actor: record, settings: { skillId: 'persuasion', difficulty: 10, rollMode: 'advantage' } };
  for (const [conditions, mode] of [[[], 'disadvantage'], [[effect('advantage')], 'normal']]) {
    const options = { actorProfile: actor(conditions) };
    assert.equal(getSkillRollContext(params, options).rollMode, mode);
    assert.equal((await new SkillResolutionService(dice).resolve(params, options)).rollMode, mode);
  }
});

test('freie und gespeicherte Wurfart-Vorgaben erzeugen weder Vorteil noch Nachteil', async () => {
  for (const mode of ['advantage', 'disadvantage']) {
    assert.equal((await attack(actor(), mode)).attack.rollMode, 'normal');
    assert.equal((await skill(actor(), mode)).rollMode, 'normal');
  }
});

test('aktive Effekte bestimmen Angriff und Fertigkeitsprobe automatisch', async () => {
  for (const mode of ['advantage', 'disadvantage']) {
    const profile = actor([effect(mode)]);
    const combat = await attack(profile);
    assert.equal(combat.attack.rollMode, mode);
    assert.equal(combat.attack.diceResults.length, 2);
    assert.equal((await skill(profile)).rollMode, mode);
  }
});

test('Vorteil und Nachteil neutralisieren sich unabhängig von Anzahl und Reihenfolge', async () => {
  for (const modes of [['advantage', 'disadvantage', 'advantage'], ['disadvantage', 'advantage', 'disadvantage']]) {
    const profile = actor(modes.map((mode, i) => ({ ...effect(mode), id: `effect-${i}` })));
    assert.equal((await attack(profile)).attack.rollMode, 'normal');
    assert.equal((await skill(profile)).rollMode, 'normal');
    assert.equal(mergeRollModes(modes), 'normal');
    assert.match(renderAutomaticRollMode(getActiveRollModes(profile)), /heben sich auf/);
  }
});

test('Wurfbonus kann ausdrücklich auf Angriffe oder Fertigkeiten begrenzt werden', async () => {
  const attacksOnly = actor([effect('advantage', { mechanics: { attackRollMode: 'advantage', skillRollMode: 'normal' } })]);
  assert.equal((await attack(attacksOnly)).attack.rollMode, 'advantage');
  assert.equal((await skill(attacksOnly)).rollMode, 'normal');
  const skillsOnly = actor([effect('advantage', { mechanics: { attackRollMode: 'normal', skillRollMode: 'advantage' } })]);
  assert.equal((await attack(skillsOnly)).attack.rollMode, 'normal');
  assert.equal((await skill(skillsOnly)).rollMode, 'advantage');
});

test('inaktive Effekte zählen nicht; regelgebundene Technikvorteile bleiben wirksam', async () => {
  assert.equal((await attack(actor([{ ...effect('advantage'), active: false }]))).attack.rollMode, 'normal');
  assert.equal((await attack({ ...actor(), forcedRollMode: 'advantage' })).attack.rollMode, 'advantage');
  assert.equal((await attack({ ...actor([effect('disadvantage')]), forcedRollMode: 'advantage' })).attack.rollMode, 'normal');
});

test('die letzte eigene Beitragsdauer gilt noch für alle Abschnitte und läuft danach ab', async () => {
  const buff = effect('advantage', { durationAmount: 1 });
  const event = { id: 'status', serverValidatedMechanics: true, combatStatus: { actorId: record.id, operation: 'add', after: { temporaryConditions: [buff] } } };
  const post = { id: 'own-post', commentSegments: [{ characterId: record.id }, { characterId: record.id }] };
  const history = [event, post];
  const during = deriveCombatStateFromComments(history, { commentId: post.id, segmentIndex: 1 }).get(record.id);
  assert.equal((await attack(overlayCombatHitPointState(resolveCombatProfile(record), during))).attack.rollMode, 'advantage');
  const after = deriveCombatStateFromComments(history).get(record.id);
  assert.equal(after.temporaryConditions.length, 0);
  assert.equal((await attack(overlayCombatHitPointState(resolveCombatProfile(record), after))).attack.rollMode, 'normal');
});

test('Zustandsübersicht dedupliziert Figuren und zeigt Quelle, Uhr, Wirkungsbereich und sichere Namen', () => {
  assert.deepEqual(getCommentConditionActorIds({ selectedCharacterId: record.id, segments: [{}, { actorId: record.id }, { sceneActorId: 'wolf' }] }), [record.id, 'wolf']);
  const profile = actor([effect('advantage', { source: '<script>Quelle</script>' }), effect('disadvantage', { durationKind: 'scene-comments', durationAmount: 3 })]);
  const html = renderCommentActorConditions(profile, { actorId: record.id, threadId: 'scene' });
  for (const value of ['2 eigene Beiträge', '3 Szenenbeiträge', 'Vorteil: Angriffe', 'Nachteil: Fertigkeitsproben', '&lt;script&gt;Quelle']) assert.ok(html.includes(value), value);
  assert.ok(!html.includes('<script>'));
  assert.ok(!renderCommentActorConditions(profile, { canManage: false }).includes('data-action='));
});

test('manuelle Wurfarten werden validiert, reine Beschreibungen lösen sie nicht aus', async () => {
  assert.throws(() => effect('advantage', { mechanics: { attackRollMode: 'always-critical' } }), /Wurfart/);
  const textOnly = createManualCombatCondition({ name: 'Vorteil', description: 'Vorteil', durationKind: 'permanent' }, { id: 'text' });
  assert.equal((await attack(actor([textOnly]))).attack.rollMode, 'normal');
});
