import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { createSceneSkillProfileResolver } from '../modules/skill-checks/skill-scene-profile.js';
import { resolveSkillModifier } from '../modules/skill-checks/skill-check-model.js';
import { refreshRuntimeCondition, reconcileConcentrationConditions } from '../modules/combat/combat-condition-lifecycle.js';
import { createManualCombatCondition } from '../modules/combat-status/combat-status-model.js';
import { renderMiniCombatProfile } from '../modules/comments/comments-combat-mini-profile-view.js';
import { DRACHENTANZ_COMBAT_STYLE } from '../modules/combat-styles/drachentanz/drachentanz-registry.js';
import { normalizeCombatEffect } from '../modules/combat/combat-effect-model.js';

const load = async slug => JSON.parse(await readFile(new URL(`../../Charakter%20Archiv%20Exporte/${slug}.json`, import.meta.url), 'utf8')).character;
const gawain = await load('gawain-draig');
const rhiannon = await load('rhiannon-draig');
const base = resolveCombatProfile(gawain);
const status = after => ({ id: 'status', serverValidatedMechanics: true, combatStatus: { actorId: gawain.id, operation: 'add', after } });
const buff = (mechanics, extra = {}) => ({ id: 'test-buff', name: 'Prüfzustand', active: true, mechanics, durationModel: { kind: 'actor-comments', amount: 2 }, ...extra });
class Dice {
  async rollAttack({ modifier = 0, rollMode }) { const dice = rollMode === 'normal' ? [15] : [15, 15]; return { natural: 15, dice, keptDice: [15], total: 15 + modifier }; }
  async rollDamage() { return { notation: '1d4', keptDice: [2], total: 2, modifier: 0 }; }
  async rollSavingThrow({ modifier = 0 }) { return { natural: 1, dice: [1], keptDice: [1], total: 1 + modifier }; }
}

test('Zauberangriffsbonus wirkt ausschließlich bei magischen Handlungen, allgemeiner Angriff bei beiden', () => {
  const weapon = resolveCombatProfile(rhiannon);
  const spell = resolveCombatProfile(rhiannon, { actionId: 'spell:rhiannon-person-festhalten' });
  const state = { temporaryConditions: [buff({ spellAttack: 3, attack: -1 })] };
  assert.equal(overlayCombatHitPointState(weapon, state).attackModifier, weapon.attackModifier - 1);
  assert.equal(overlayCombatHitPointState(spell, state).attackModifier, spell.attackModifier + 2);
});

test('Miniansicht und Auswertung verwenden dieselbe eingeschränkte Bewegung und Initiative', () => {
  const resolved = overlayCombatHitPointState(base, { temporaryConditions: [buff({ movement: -99, initiative: -2, armorClass: 1 })],
    channeling: { actionName: 'Prüfritual', progress: 1, requiredComments: 3 } });
  const html = renderMiniCombatProfile(resolved);
  assert.match(html, /<b>0 m<\/b>/);
  assert.match(html, /1\/3 Beiträge/);
  assert.equal(resolved.aiSnapshot.derivedCombatValues.movementMeters, 0);
  assert.equal(resolved.aiSnapshot.derivedCombatValues.initiative, resolved.initiative);
  assert.equal(resolved.aiSnapshot.derivedCombatValues.armorClass, resolved.totalDefense);
});

test('Fertigkeitsvorschau übernimmt aktive Zustände aller beteiligten Figuren', () => {
  const condition = createManualCombatCondition({ name: 'Mut', durationKind: 'actor-comments', durationAmount: 1, mechanics: { skill: 3 } }, { id: 'manual:mut' });
  const scene = createSceneSkillProfileResolver([status({ temporaryConditions: [condition] })]);
  const resolved = scene.resolve(gawain);
  assert.equal(resolveSkillModifier(resolved, 'persuasion').modifier, resolveSkillModifier(base, 'persuasion').modifier + 3);
  assert.equal(resolved.temporaryConditions[0].remainingActorComments, 1);
  assert.equal(resolved.aiSnapshot.skills[0].total, base.aiSnapshot.skills[0].total + 3);
  assert.equal(resolved.passivePerception, base.passivePerception + 3);
});

test('Fertigkeitsreaktionen bleiben nach Neuladen und innerhalb desselben Entwurfs verbraucht', () => {
  const snapshot = { sourceActorId: gawain.id, after: [{ id: 'reaction', name: 'Reaktion', maximum: 1, current: 0, recovery: 'comment' }] };
  const resolution = { actorId: gawain.id, ruleResourceSnapshots: [snapshot] };
  const comments = [{ id: 'skill', commentSegments: [{ skillResolution: resolution }] }];
  assert.equal(deriveCombatStateFromComments(comments).get(gawain.id).resources[0].current, 0);
  const scene = createSceneSkillProfileResolver([]);
  scene.appendResolution(resolution);
  assert.equal(scene.resolve(gawain).resources.find(resource => resource.id === 'reaction').current, 0);
});

test('Erneuern eines Effekts lässt andere Quellen und manuelle Einträge unangetastet', () => {
  const effect = buff({ attack: -1 }, { sourceActorId: 'freya', sourceConditionId: 'spott' });
  const manual = buff({ attack: 1 }, { id: 'manual:one' });
  const other = { ...effect, id: 'other-caster', sourceActorId: 'bard' };
  const refreshed = refreshRuntimeCondition([effect, manual, other], { ...effect, id: 'new-cast' });
  assert.deepEqual(refreshed.map(condition => condition.id), ['manual:one', 'other-caster', 'new-cast']);
});

test('Konzentration mit mehreren Zielen endet erst nach dem letzten Effekt', () => {
  const linked = id => buff({}, { id, concentrationOwnerId: 'caster', concentrationInstanceId: 'cast' });
  const states = new Map([
    ['caster', { concentration: { instanceId: 'cast', tracksConditions: true } }],
    ['a', { temporaryConditions: [linked('a')] }], ['b', { temporaryConditions: [linked('b')] }]
  ]);
  states.set('a', { temporaryConditions: [] });
  reconcileConcentrationConditions(states, { pruneEmpty: true });
  assert.ok(states.get('caster').concentration);
  states.set('b', { temporaryConditions: [] });
  reconcileConcentrationConditions(states, { pruneEmpty: true });
  assert.equal(states.get('caster').concentration, null);
});

test('Reinigungsfähigkeiten finden die stabile Zustandskennung trotz individueller Laufzeit-ID', async () => {
  const actor = { ...base, selectedAction: { name: 'Reinigung', effects: [{ type: 'remove-condition', on: 'always', conditionId: 'curse' }] }, resourceCosts: [], actionResolutionMode: 'automatic' };
  const target = overlayCombatHitPointState({ ...base, characterId: 'target' }, { temporaryConditions: [buff({ attack: -2 }, { id: 'curse-instance-123', sourceConditionId: 'curse' })] });
  const result = await new CombatResolutionService(new Dice()).resolveAttack({ actor, target });
  assert.equal(result.targetConditionSnapshot.after.length, 0);
  assert.equal(result.damage, null);
});

// All authored Drachentanz conditions: exercise their actual numeric payload,
// recipient, hit/save gate and expiration, without conflating damage balance.
for (const form of DRACHENTANZ_COMBAT_STYLE.forms) {
  test(`${form.name}: sämtliche ausgearbeiteten Buffs und Debuffs anwenden und auslaufen lassen`, async () => {
    const effects = form.techniques.flatMap(technique => [
      ...(technique.effects || []).filter(effect => effect.condition).map(effect => ({ technique, effect })),
      ...(technique.secondarySave?.failureCondition ? [{ technique, effect: { type: 'debuff', target: 'target', on: 'hit',
        condition: { ...technique.secondarySave.failureCondition, durationModel: { kind: 'actor-comments', amount: 1 } } } }] : [])
    ]);
    for (const { technique, effect: raw } of effects) {
      const effect = normalizeCombatEffect(raw);
      const actor = { ...base, selectedAction: { name: technique.name, effects: [effect] }, resourceCosts: [], actionResolutionMode: 'automatic' };
      const target = { ...base, characterId: 'target', name: 'Prüfziel' };
      const result = await new CombatResolutionService(new Dice()).resolveAttack({ actor, target });
      const recipientId = effect.target === 'self' ? actor.characterId : target.characterId;
      let comments = [{ id: 'cast', commentSegments: [{ combatResolution: result }] }];
      const applied = deriveCombatStateFromComments(comments).get(recipientId)?.temporaryConditions || [];
      assert.equal(applied.length, 1, technique.name);
      for (const [key, value] of Object.entries(effect.condition.mechanics)) assert.deepEqual(applied[0].mechanics[key], value, `${technique.name}: ${key}`);
      const resolved = overlayCombatHitPointState(recipientId === actor.characterId ? base : target, { temporaryConditions: applied });
      assert.equal(resolved.attackModifier, base.attackModifier + (effect.condition.mechanics.attack || 0), technique.name);
      assert.equal(resolved.totalDefense, base.totalDefense + (effect.condition.mechanics.armorClass || 0), technique.name);
      for (let index = 0; index < applied[0].remainingActorComments; index++) comments.push({ characterId: recipientId });
      assert.equal(deriveCombatStateFromComments(comments).get(recipientId).temporaryConditions.length, 0, `${technique.name}: Ablauf`);
    }
  });
}
