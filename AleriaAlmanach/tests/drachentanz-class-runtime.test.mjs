import test from 'node:test';
import assert from 'node:assert/strict';
import { DRACHENTANZ_FORM_IDS as F } from '../modules/combat-styles/drachentanz/drachentanz-ids.js';
import { DRACHENTANZ_COMBAT_STYLE } from '../modules/combat-styles/drachentanz/drachentanz-registry.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { CombatResolutionService } from '../modules/combat/combat-resolution-service.js';
import { deriveCombatStateFromComments, overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';

const getAttack = slug => DRACHENTANZ_COMBAT_STYLE.forms.flatMap(form => form.techniques).find(technique => technique.id === `combat-style-drachentanz-${slug}`);

function character(classId, attack, weaponType = 'spear', weaponProfileId = weaponType) {
  return { id: `${classId}-runtime`, name: classId, combatProfile: {
    templateSelections: { classId }, progression: { level: 9 },
    attributes: [{ key: 'strength', score: 14 }, { key: 'dexterity', score: 14 }],
    hitPoints: { current: 30, maximumOverride: 30 }, armorClass: { base: 12 },
    weapons: [{ id: 'held', name: weaponProfileId, weaponType, weaponProfileId, damageFormula: '1d6',
      attackAttribute: 'dexterity', equipped: true, range: weaponType === 'bow' ? 'Fernkampf' : 'Nahkampf' }],
    classTraining: { curriculumId: `cenyr-${classId}`,
      selections: [{ kind: 'path', selectionId: attack.combatStyleFormId, selectedAtLevel: 9 }],
      techniqueSelections: [{ slotId: 'expert-01', techniqueId: attack.id, selectedAtLevel: 9 }] },
    techniques: [{ ...attack, status: 'confirmed' }]
  } };
}

class Dice {
  attacks = [];
  damage = [];
  constructor(natural = 15) { this.natural = natural; }
  async rollAttack(request) { this.attacks.push(request); return { natural: this.natural, dice: [this.natural], keptDice: [this.natural], total: this.natural + request.modifier }; }
  async rollDamage(request) { this.damage.push(request); return { total: 3, keptDice: [3], notation: request.damageFormula }; }
}

test('Ruhige Schwelle resolves without hit or damage roll and expires after the next own contribution', async () => {
  const guard = getAttack('huetender-ruhige-schwelle');
  const source = character('cantref', guard);
  const actor = resolveCombatProfile(source, { actionId: `technique:${guard.id}` });
  assert.equal(actor.selectedAction.compatible, true);
  assert.equal(actor.actionResolutionMode, 'automatic');
  const dice = new Dice();
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: actor });
  assert.equal(dice.attacks.length, 0);
  assert.equal(dice.damage.length, 0);
  assert.equal(result.damage, null);
  const comments = [{ id: 'guard', characterId: actor.characterId, commentSegments: [{ combatResolution: result }] }];
  let state = deriveCombatStateFromComments(comments).get(actor.characterId);
  assert.equal(state.temporaryConditions.length, 2, 'Explicit defence and the learned path stance each apply once.');
  const protectedActor = overlayCombatHitPointState(actor, state);
  assert.equal(protectedActor.totalDefense, actor.totalDefense + 2, 'Nur die stärkste RK-Haltung gilt');
  assert.equal(protectedActor.currentHitPoints, actor.currentHitPoints);
  comments.push({ id: 'foreign', characterId: 'other-actor' });
  assert.equal(deriveCombatStateFromComments(comments).get(actor.characterId).temporaryConditions.length, 2);
  comments.push({ id: 'own', characterId: actor.characterId });
  state = deriveCombatStateFromComments(comments).get(actor.characterId);
  assert.equal(state.temporaryConditions.length, 0);
  assert.equal(overlayCombatHitPointState(actor, state).totalDefense, actor.totalDefense);
});

test('Hinterhaltsschuss grants its bonus only against an actively surprised target and keeps bow requirements', async () => {
  const shot = getAttack('jagender-hinterhaltsschuss');
  const source = character('helwyr', shot, 'bow', 'longbow');
  const actor = resolveCombatProfile(source, { actionId: `technique:${shot.id}` });
  assert.equal(actor.selectedAction.compatible, true);
  assert.equal(actor.selectedAction.targetDefenseModifier, 0, 'No unconditional ambush defence bypass remains.');
  const target = resolveCombatProfile({ id: 'target', name: 'Wache', combatProfile: { hitPoints: { current: 30, maximumOverride: 30 } } });
  for (const [conditions, bonus] of [
    [[], 0],
    [[{ id: 'surprised', name: 'Überrascht', active: true }], 1],
    [[{ id: 'surprised', name: 'Überrascht', active: false }], 0],
    [[{ id: 'other', name: 'Verletzt', active: true }], 0]
  ]) {
    const dice = new Dice();
    const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: { ...target, conditions } });
    assert.equal(dice.attacks[0].modifier, actor.attackModifier + bonus);
    const rules = result.ruleApplications.filter(rule => rule.ruleId === 'jagender-vorbereiteter-hinterhalt');
    assert.equal(rules.length, bonus ? 1 : 0);
  }
  const ordinaryShot = resolveCombatProfile(source, { actionId: 'weapon:held' });
  const ordinaryDice = new Dice();
  const ordinaryResult = await new CombatResolutionService(ordinaryDice).resolveAttack({ actor: ordinaryShot,
    target: { ...target, conditions: [{ id: 'surprised', name: 'Überrascht', active: true }] } });
  assert.equal(ordinaryDice.attacks[0].modifier, ordinaryShot.attackModifier, 'The conditional bonus stays on this technique.');
  assert.equal(ordinaryResult.ruleApplications.some(rule => rule.ruleId === 'jagender-vorbereiteter-hinterhalt'), false);
  const wrongWeapon = structuredClone(source);
  Object.assign(wrongWeapon.combatProfile.weapons[0], { weaponType: 'sword', weaponProfileId: 'sword', range: 'Nahkampf' });
  const wrongActor = resolveCombatProfile(wrongWeapon, { actionId: `technique:${shot.id}` });
  assert.equal(wrongActor.selectedAction.compatible, false);
});

test('Ehrenzweikampf requires exactly one active enemy in a declared encounter', () => {
  const attack = getAttack('schwertdrache-eroeffnung-des-einen');
  const source = character('teulu', attack, 'sword');
  const actionId = `technique:${attack.id}`;
  const baseline = resolveCombatProfile(source, { actionId, hostileOpponentCount: 2 });
  assert.equal(baseline.selectedAction.compatible, true);
  for (const [hostileOpponentCount, bonus] of [[undefined, 0], [null, 0], [0, 0], [1, 2], [2, 0]]) {
    const profile = resolveCombatProfile(source, { actionId, hostileOpponentCount });
    assert.equal(profile.attackModifier, baseline.attackModifier + bonus, String(hostileOpponentCount));
  }
});

test('Klingenbindung senkt die Verteidigung bis zum ersten Treffer und erneuert sich pro Beitrag', async () => {
  const technique = getAttack('schwertdrache-eroeffnung-des-einen');
  const source = character('teulu', technique, 'sword');
  source.combatProfile.progression.level = 15;
  const actor = resolveCombatProfile(source, { actionId: `technique:${technique.id}`, hostileOpponentCount: 1 });
  const totalDefense = 18 + actor.attackModifier;
  const target = { characterId: 'defender', name: 'Gegner', totalDefense, currentHitPoints: 40, maximumHitPoints: 40 };
  const attack = (natural, comment, prior) => new CombatResolutionService(new Dice(natural)).resolveAttack({ actor, target },
    { rulePeriods: { comment }, usedRuleFrequencyKeys: new Set(prior?.usedRuleFrequencyKeys) });

  const miss = await attack(2, 'turn');
  assert.equal(miss.attack.hit, false);
  assert.equal(miss.attack.targetDefense, totalDefense - 1);
  assert.equal(miss.ruleApplications.find(rule => rule.ruleName === 'Klingenbindung').usedKey, '');
  const first = await attack(17, 'turn', miss);
  assert.equal(first.attack.hit, true);
  assert.equal(first.attack.targetDefense, totalDefense - 1);
  assert.ok(first.ruleApplications.find(rule => rule.ruleName === 'Klingenbindung').usedKey);
  const second = await attack(17, 'turn', first);
  assert.equal(second.attack.hit, false);
  assert.equal(second.attack.targetDefense, totalDefense);
  const nextTurn = await attack(17, 'next-turn', second);
  assert.equal(nextTurn.attack.hit, true);
  assert.equal(nextTurn.attack.targetDefense, totalDefense - 1);
});

test('Gedeckter Wechsel resolves the movement allowance and defence without automatically granting concealment', async () => {
  const move = getAttack('jagender-gedeckter-wechsel');
  const source = character('helwyr', move, 'bow', 'shortbow');
  source.combatProfile.progression.level = 11;
  source.combatProfile.classTraining.techniqueSelections[0].slotId = 'expert-02';
  source.combatProfile.classTraining.techniqueSelections[0].selectedAtLevel = 11;
  const actor = resolveCombatProfile(source, { actionId: `technique:${move.id}` });
  assert.equal(actor.actionResolutionMode, 'automatic');
  const dice = new Dice();
  const result = await new CombatResolutionService(dice).resolveAttack({ actor, target: actor });
  assert.equal(dice.attacks.length, 0);
  assert.equal(dice.damage.length, 0);
  const movement = result.effectResults.find(entry => entry.condition?.stanceGroup === 'martial-position-guard');
  assert.ok(movement, 'Einmalige Deckung ersetzt die bisherige Meterwirkung.');
  assert.equal(movement.condition.triggerRules[0].effects.attackModifier, -1);
  const state = deriveCombatStateFromComments([{ id: 'move', commentSegments: [{ combatResolution: result }] }]).get(actor.characterId);
  assert.equal(overlayCombatHitPointState(actor, state).totalDefense, actor.totalDefense + 2);
  assert(state.temporaryConditions.every(condition => !/verbor|unsicht|überrascht/i.test(condition.name)));
});
