import test from 'node:test';
import assert from 'node:assert/strict';
import { getVennyrClassProgression } from '../modules/classes/vennyr/vennyr-class-progression.js';
import { getSirenentanzBasicTechniques } from '../modules/combat-styles/sirenentanz/sirenentanz-basic-techniques.js';
import { getSirenentanzExpertTechniques } from '../modules/combat-styles/sirenentanz/sirenentanz-expert-techniques.js';
import { resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { parseDamageFormula } from '../modules/combat/rules/combat-mvp-rules.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';

const classIds = ['morwyr', 'rhyfelwyr', 'ceidwyn', 'rhiddwyr', 'derwyn', 'milwr'];
const catalogue = id => [...getSirenentanzBasicTechniques(id), ...getSirenentanzExpertTechniques(id)];
const mean = formula => {
  const parsed = parseDamageFormula(formula);
  return (parsed.terms || [{ diceCount: parsed.diceCount, sides: parsed.sides }]).reduce((sum, term) => sum + term.diceCount * (term.sides + 1) / 2, parsed.fixedModifier || 0);
};

test('Vennyr experts offer a weapon lesson on each Teulu training level through 20', () => {
  for (const id of classIds.filter(id => id !== 'milwr')) {
    const plan = getVennyrClassProgression(id, 20);
    for (const form of plan.styles.flatMap(style => style.forms).filter(form => form.kind === 'path')) {
      assert(form.techniques.length >= 12, `${id}: ${form.name}`);
      assert.deepEqual([...new Set(form.techniques.map(technique => technique.minimumLevel))].sort((a, b) => a - b),
        Array.from({ length: 12 }, (_, index) => index + 9), `${id}: no missing intermediate level`);
    }
  }
  assert(catalogue('milwr').every(technique => technique.minimumLevel <= 15));
});

test('the broad weapon classes retain damaging options for each route before expert training', () => {
  const routes = {
    morwyr: ['polearm', 'axe', 'spear'], rhyfelwyr: ['sword', 'axe', 'mace'],
    ceidwyn: ['bow', 'crossbow', 'sword', 'spear'], rhiddwyr: ['crossbow', 'polearm', 'mace', 'axe'],
    derwyn: ['sword', 'staff', 'spear', 'mace'], milwr: ['spear', 'axe', 'mace', 'sword']
  };
  for (const [id, weaponTypes] of Object.entries(routes)) {
    const lessons = catalogue(id).filter(technique => technique.minimumLevel <= 8 && technique.effects.some(effect => effect.type === 'damage'));
    for (const type of weaponTypes) assert(lessons.some(technique => technique.weaponTypes.includes(type)), `${id}: ${type}`);
    if (['rhyfelwyr', 'rhiddwyr'].includes(id)) for (const profileId of ['warhammer', 'flail']) {
      assert(lessons.some(technique => technique.weaponTypes.includes('mace')
        && (!technique.cultureTraining.weaponProfileIds.length || technique.cultureTraining.weaponProfileIds.includes(profileId))), `${id}: ${profileId}`);
    }
  }
});

test('additional options keep replacement scaling, light-attack caps and real resource costs', () => {
  for (const id of classIds) for (const technique of catalogue(id)) {
    assert.equal(technique.status, 'confirmed');
    assert.equal(technique.active, false);
    assert.equal(technique.live, false);
    assert.deepEqual(sanitizeCharacterCombatProfile({ techniques: [technique] }).techniques[0].weaponTypes, technique.weaponTypes);
    assert(technique.minimumLevel <= 20);
    assert(technique.costs.length && technique.costs.every(cost => cost.amount === 1));
    assert.equal(technique.followUpAttack.enabled, false);
    if (!technique.effects.some(effect => effect.type === 'damage')) {
      assert.equal(resolveTechniqueDamageFormula(technique, { damageFormula: '2d6' }, { progression: { level: 20 } }), '');
      continue;
    }
    assert.equal(technique.damageModel.weaponDiceMultiplier, 1);
    const bonusOnly = technique.costs.length === 1 && technique.costs[0].resourceId === 'bonus-action';
    if (bonusOnly) {
      assert.equal(technique.damageModel.baseDieCap, 4);
      assert.deepEqual(technique.damageModel.scalingSteps, []);
    }
    for (const weaponFormula of ['1d6', '1d10', '2d6']) {
      let previous = -Infinity;
      for (let level = technique.minimumLevel; level <= 20; level++) {
        const damage = mean(resolveTechniqueDamageFormula(technique, { damageFormula: weaponFormula }, { progression: { level } }));
        assert(damage >= previous, `${id}: ${technique.name} ${weaponFormula} ${level}`);
        previous = damage;
      }
    }
  }
});

test('learning more named guards or preparations does not create stacking condition sources', () => {
  for (const classId of classIds) {
    const guards = new Set(), aims = new Set(), penalties = new Set();
    for (const technique of catalogue(classId)) {
      for (const effect of technique.effects.filter(effect => effect.condition)) {
        if (effect.condition.mechanics.armorClass > 0) guards.add(effect.condition.id);
        if (effect.condition.mechanics.attack > 0) aims.add(effect.condition.id);
        assert.equal(effect.condition.durationModel.remainingActorComments, 1);
      }
      if (technique.secondarySave.enabled) {
        if (technique.secondarySave.failureCondition.mechanics.attack) penalties.add(technique.secondarySave.failureCondition.id);
        assert.equal(technique.secondarySave.dcBase, technique.costs.some(cost => cost.resourceId === 'special-action') ? 11 : 10);
      }
    }
    assert.equal(guards.size, 1, classId);
    assert.equal(aims.size, 1, classId);
    assert.equal(penalties.size, 1, classId);
  }
});
