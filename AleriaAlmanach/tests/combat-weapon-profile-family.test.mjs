import test from 'node:test';
import assert from 'node:assert/strict';
import { isCombatWeaponProfileAllowed, getCombatWeaponProfileFamilies } from '../modules/combat/combat-weapon-profile-family.js';
import { sanitizeCharacterCombatProfile } from '../modules/combat/combat-profile-model.js';
import { resolveCenyrTechniqueWeaponRules } from '../modules/classes/cenyr/cenyr-technique-weapon-rules.js';
import { getCenyrClassProgression } from '../modules/classes/cenyr/cenyr-class-progression.js';

function owner(classId, weaponProfileId, weaponType = 'sword') {
  return sanitizeCharacterCombatProfile({ templateSelections: { classId },
    identity: { archetype: classId, ancestry: 'Cenyr' }, progression: { level: 20, development: { mode: 'purchase' } },
    weapons: [{ id: 'test-standard', name: weaponProfileId, weaponType, weaponProfileId,
      damageFormula: '1d8', equipped: true }], combat: { mainHandWeaponId: 'test-standard' } });
}
const rules = (classId, technique, profileId, type) => {
  const profile = owner(classId, profileId, type), before = structuredClone(profile);
  const result = resolveCenyrTechniqueWeaponRules(profile, technique, profile.weapons[0]);
  assert.deepEqual(profile, before);
  return result;
};

test('weapon-family access is narrow and keeps bow lengths, harpoons and specialized blades distinct', () => {
  for (const [family, variants] of [
    ['sword', ['sword', 'greatsword', 'shortsword']], ['crossbow', ['crossbow', 'light-crossbow', 'heavy-crossbow', 'hand-crossbow']],
    ['warhammer', ['warhammer', 'maul']], ['staff', ['staff', 'quarterstaff', 'magic-staff']]
  ]) for (const variant of variants) assert.equal(isCombatWeaponProfileAllowed([family], variant), true, variant);
  for (const [allowed, actual] of [['shortbow', 'longbow'], ['longbow', 'shortbow'], ['spear', 'harpoon'],
    ['harpoon', 'spear'], ['greatsword', 'sword'], ['rapier', 'sword'], ['sword', 'rapier']]) {
    assert.equal(isCombatWeaponProfileAllowed([allowed], actual), false, `${actual} is not ${allowed}`);
  }
  assert.deepEqual(getCombatWeaponProfileFamilies('heavy-crossbow'), ['heavy-crossbow', 'crossbow']);
});

test('Cenyr sword training accepts real normalized sword sizes without rewriting profile identities', () => {
  const technique = getCenyrClassProgression('teulu', 20).attackCatalog.find(entry => entry.cenyrTraining.classWeaponProfiles?.teulu?.includes('sword'));
  assert.ok(technique);
  for (const profile of ['sword', 'greatsword', 'shortsword']) assert.equal(rules('teulu', technique, profile).compatible, true, profile);
  assert.equal(rules('teulu', technique, 'rapier').compatible, false);
});

test('actual rapier and halberd variants retain their own critical and target rules after the family lookup', () => {
  const shared = getCenyrClassProgression('barddwyr', 20).attackCatalog.find(entry => entry.id.endsWith('-sicherer-drachenhieb'));
  assert.ok(shared);
  assert.equal(rules('barddwyr', shared, 'rapier').criticalThreshold, 19);
  assert.equal(rules('barddwyr', shared, 'sword').criticalThreshold, 20);
  assert.equal(rules('barddwyr', shared, 'greatsword').criticalThreshold, 20);
  const spear = getCenyrClassProgression('cantref', 20).attackCatalog.find(entry =>
    entry.cenyrTraining.weaponRuleSetId === 'cantref-polearm' && !entry.cenyrTraining.singleTargetOnly);
  assert.ok(spear);
  assert.equal(rules('cantref', spear, 'halberd', 'polearm').maximumTargets, 4);
  assert.equal(rules('cantref', spear, 'spear', 'spear').maximumTargets, 1);
  assert.equal(rules('cantref', spear, 'partisan', 'polearm').attackBonus, 1);
  assert.equal(rules('cantref', spear, 'spear', 'spear').attackBonus, 0);
});
