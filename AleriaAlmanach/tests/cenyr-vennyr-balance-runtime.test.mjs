import test from 'node:test';
import assert from 'node:assert/strict';
import { getCombatStyle } from '../modules/combat-styles/combat-style-registry.js';
import { getSirenentanzBasicTechniques } from '../modules/combat-styles/sirenentanz/sirenentanz-basic-techniques.js';
import { resolveTechniqueDamageFormula, getTechniqueDamageScaling, describeTechniqueDamage } from '../modules/combat/combat-technique-damage.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { getCombatTechniqueIconSource } from '../modules/combat-styles/combat-technique-icons.js';

const attacks = getCombatStyle('drachentanz').forms.flatMap(form => form.techniques);
const cantref = attacks.find(entry => entry.id.endsWith('cantref-jungdrache-haken-des-jungdrachen'));
const mounted = getSirenentanzBasicTechniques('rhiddwyr').find(entry => entry.id.endsWith('-streifender-anritt'));
const profile = (technique, weapon, overrides = {}) => sanitizeCharacterCombatProfile({
  identity: { archetype: 'Cantref', ancestry: 'Cenyr' }, templateSelections: { classId: 'cantref' },
  progression: { level: 20, development: { mode: 'purchase' } },
  combat: { mainHandWeaponId: weapon.id }, weapons: [{ ...weapon, equipped: true }],
  techniques: [{ ...technique, active: true }], ...overrides
});
const action = (combatProfile, id) => resolveCombatProfile({ id: 'balance-fixture', combatProfile }).actions
  .find(entry => entry.sourceId === id);

test('weapon-expanded area attacks use the authored area caps without changing their source', () => {
  const original = structuredClone(cantref);
  const weapon = { damageFormula: '1d12' }, actor = { progression: { level: 20 } };
  assert.equal(resolveTechniqueDamageFormula(cantref, weapon, actor), '1d12+1d6+1d10');
  assert.equal(resolveTechniqueDamageFormula(cantref, weapon, actor, { maximumTargets: 4 }), '1d12+1d6');
  assert.equal(getTechniqueDamageScaling(cantref, actor, { maximumTargets: 4 }), null);
  assert.doesNotMatch(describeTechniqueDamage(cantref, actor, { maximumTargets: 4 }), /Ausbildungsbonus/);
  assert.deepEqual(cantref, original);
});

test('the real Cantref resolver keeps four halberd targets and a single-target spear progression', () => {
  const halberd = { id: 'polearm', name: 'Hellebarde', weaponType: 'polearm', weaponProfileId: 'halberd', damageFormula: '1d12' };
  const original = profile(cantref, halberd);
  const before = structuredClone(original);
  const sweep = action(original, cantref.id);
  assert.equal(sweep.maximumTargets, 4);
  assert.equal(sweep.formula, '1d12+1d6');
  assert.equal(sweep.compatible, true);
  const lance = action(profile(cantref, { ...halberd, name: 'Lanze', weaponProfileId: 'lance' }), cantref.id);
  assert.equal(lance.maximumTargets, 1);
  assert.equal(lance.formula, '1d12+1d6+1d10');
  assert.deepEqual(original, before);
});

test('a purchased Vennyr mounted technique remains locked on foot after real storage normalization', () => {
  const spear = { id: 'rider-spear', name: 'Reiterspieß', weaponType: 'polearm', weaponProfileId: 'rider-spear', damageFormula: '1d8' };
  const before = profile(mounted, spear, { templateSelections: { classId: 'rhiddwyrr' }, identity: { archetype: 'Rhiddwyr', ancestry: 'Vennyr' } });
  const foot = action(before, mounted.id);
  assert.equal(foot.compatible, false);
  assert.match(foot.disabledReason, /beritten/);
  const riding = action({ ...before, combat: { ...before.combat, mounted: true } }, mounted.id);
  assert.equal(riding.compatible, true);
  assert.equal(before.cultureTraining, undefined);
  assert.equal(before.techniques[0].cultureTraining.requiresMounted, true);
  assert.match(getCombatTechniqueIconSource(before.techniques[0]), /mounted-charge\.png$/);
});
