import test from 'node:test';
import assert from 'node:assert/strict';
import { DRACHENTANZ_COMBAT_STYLE as style } from '../modules/combat-styles/drachentanz/drachentanz-registry.js';
import { DRACHENTANZ_FORM_IDS as F } from '../modules/combat-styles/drachentanz/drachentanz-ids.js';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';
import { resolveCenyrTechniqueWeaponRules } from '../modules/classes/cenyr/cenyr-technique-weapon-rules.js';
import { getAuraFocusMaximum, getCombatActionEconomy } from '../modules/combat/combat-resource-progression.js';
import { resolveTechniqueDamageFormula } from '../modules/combat/combat-technique-damage.js';
import { parseDamageFormula } from '../modules/combat/rules/combat-mvp-rules.js';

const attacks = style.forms.flatMap(form => form.techniques);
const byName = name => attacks.find(attack => attack.name === name);
const profile = (classId, mounted = false) => ({ templateSelections: { classId: classId === 'milwr' ? 'cenyr-milwr' : classId }, progression: { level: 20 }, combat: { mounted } });
const average = formula => {
  const parsed = parseDamageFormula(formula);
  return (parsed.terms || [parsed]).reduce((sum, term) => sum + term.diceCount * (term.sides + 1) / 2, parsed.fixedModifier);
};

test('expert forms have a full choice of attacks without exceeding the Teulu level ceiling', () => {
  for (const form of style.forms.filter(form => form.kind === 'path')) {
    assert(form.techniques.length >= 12, form.id);
    assert(form.techniques.every(attack => attack.minimumLevel <= (form.id === F.drachling ? 15 : 20)), form.id);
  }
  assert.equal(getCenyrClassProgression('helwyr', 20).styles[0].forms.find(form => form.id === F.vertiefung).techniques.length, 8);
  for (const classId of ['teulu', 'cantref', 'uchelwyr', 'helwyr', 'arthwyr', 'barddwyr', 'milwr']) {
    const plan = getCenyrClassProgression(classId, 20);
    assert(plan.styles.every(style => style.forms.every(form => form.techniques.length > 0)), classId);
    assert(plan.attackCatalog.every(attack => attack.status === 'confirmed'), classId);
  }
});

test('all costs are available at unlock and support options never roll weapon damage', () => {
  for (const attack of attacks) {
    const economy = getCombatActionEconomy(attack.minimumLevel);
    for (const cost of attack.costs) {
      const maximum = cost.resourceId === 'aura-focus' ? getAuraFocusMaximum(attack.minimumLevel) : economy[cost.resourceId];
      assert(cost.amount <= maximum, `${attack.id}: ${cost.resourceId}`);
    }
    if (attack.damageModel.mode === 'fixed' && !attack.damageFormula) {
      assert.equal(resolveTechniqueDamageFormula(attack, { damageFormula: '2d6' }, profile('teulu')), '', attack.id);
    }
    if (attack.damageModel?.lightAttack) {
      assert.equal(attack.damageModel.baseDieCap, 4, attack.id);
      assert.deepEqual(attack.damageModel.scalingSteps, [], attack.id);
    }
  }
});

test('militia, rider and heavy weapon options enforce their actual equipment', () => {
  const cases = [
    ['Speersaum', 'milwr', 'spear', 'spear', 'axe', false],
    ['Hieb am Axtrand', 'milwr', 'axe', 'axe', 'sword', false],
    ['Kolbenantwort', 'milwr', 'mace', 'mace', 'spear', false],
    ['Schwertgasse', 'milwr', 'sword', 'sword', 'axe', false],
    ['Gerade Lanze', 'uchelwyr', 'spear', 'lance', 'sword', true],
    ['Knapper Sattelhieb', 'uchelwyr', 'sword', 'sword', 'lance', true],
    ['Axt im Gedränge', 'arthwyr', 'axe', 'battleaxe', 'greatsword', false],
    ['Kolben am Griff', 'arthwyr', 'mace', 'mace', 'battleaxe', false],
    ['Breite Schwertlinie', 'arthwyr', 'sword', 'greatsword', 'mace', false]
  ];
  for (const [name, classId, weaponType, weaponProfileId, wrong, mounted] of cases) {
    const attack = byName(name);
    assert(attack, name);
    assert.equal(resolveCenyrTechniqueWeaponRules(profile(classId, mounted), attack, { weaponType, weaponProfileId }).compatible, true, name);
    assert.equal(resolveCenyrTechniqueWeaponRules(profile(classId, mounted), attack, { weaponType, weaponProfileId: wrong }).compatible, false, name);
    if (mounted) assert.equal(resolveCenyrTechniqueWeaponRules(profile(classId), attack, { weaponType, weaponProfileId }).compatible, false, name);
  }
  const shield = byName('Schulterwacht');
  assert.equal(resolveCenyrTechniqueWeaponRules(profile('milwr'), shield, { weaponType: 'sword', weaponProfileId: 'sword' }).compatible, false);
});

test('Barddwyr retain four sword and four rapier choices in both training phases', () => {
  const plan = getCenyrClassProgression('barddwyr', 20);
  for (const [formId, profileId] of [[F.jungdrache, 'sword'], [F.jungdrache, 'rapier'], [F.vertiefung, 'sword'], [F.traellernder, 'rapier']]) {
    assert.equal(plan.attackCatalog.filter(attack => attack.combatStyleFormId === formId
      && attack.cenyrTraining.classWeaponProfiles.barddwyr?.includes(profileId)).length, 4, `${formId}/${profileId}`);
  }
});

test('new full attacks grow with training while light supplements keep their lower budget', () => {
  for (const [name, classId, levels] of [['Speersaum', 'milwr', [2, 6, 10, 15]], ['Axt im Gedränge', 'arthwyr', [12, 13, 17]]]) {
    const attack = byName(name);
    const damage = levels.map(level => average(resolveTechniqueDamageFormula(attack, { damageFormula: '2d6' }, { progression: { level } })));
    assert(damage.every((value, index) => !index || value > damage[index - 1]), `${classId}/${name}`);
  }
  const light = byName('Kurze Tatze');
  assert.equal(resolveTechniqueDamageFormula(light, { damageFormula: '2d6' }, { progression: { level: 9 } }), '2d4');
  assert.equal(resolveTechniqueDamageFormula(light, { damageFormula: '2d6' }, { progression: { level: 20 } }), '2d4');
});
