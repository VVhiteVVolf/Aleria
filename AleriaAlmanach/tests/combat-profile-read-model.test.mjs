import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { createCombatProfileReadModel, sanitizeCharacterCombatProfile, getEffectiveCombatLevel, getProficiencyBonus,
  getEffectiveCombatAttribute, getMaximumHitPoints, getArmorClass, getSavingThrowTotal, getSkillTotal,
  getWeaponAttackModifier, getWeaponDamageModifier, getSpellcastingValues, getUniversalDamageBonus } from '../modules/combat/combat-profile-model.js';

const characters = JSON.parse(await readFile(new URL('../../CharakterDatenbank/generated/characters.snapshot.json', import.meta.url), 'utf8')).characters
  .filter(character => /Duncan|Rhiannon|Guinevere|Gildas|Gawain|Nudd|Asgeir|Ylva/.test(character.name));

for (const character of characters) test(`${character.name}: immutable calculation view preserves all attributes, defenses, skills, saves and weapons`, () => {
  const raw = character.combatProfile, view = createCombatProfileReadModel(raw);
  for (const getter of [getEffectiveCombatLevel, getProficiencyBonus, getMaximumHitPoints, getArmorClass, getSpellcastingValues, getUniversalDamageBonus]) {
    assert.deepEqual(getter(view), getter(raw), getter.name);
  }
  for (const attribute of view.attributes) {
    assert.deepEqual(getEffectiveCombatAttribute(view, attribute.key), getEffectiveCombatAttribute(raw, attribute.key));
    assert.equal(getSavingThrowTotal(view, attribute.key), getSavingThrowTotal(raw, attribute.key));
  }
  for (const skill of view.skills) assert.equal(getSkillTotal(view, skill.id), getSkillTotal(raw, skill.id));
  for (const weapon of view.weapons) {
    assert.equal(getWeaponAttackModifier(view, weapon.id), getWeaponAttackModifier(raw, weapon.id));
    assert.equal(getWeaponDamageModifier(view, weapon.id), getWeaponDamageModifier(raw, weapon.id));
  }
});

test('calculation views never freeze or cache mutable sheets; edits produce a fresh view and transported data is validated again', () => {
  const raw = structuredClone(characters.find(character => character.name === 'Gawain Draig').combatProfile);
  const original = structuredClone(raw), view = createCombatProfileReadModel(raw);
  assert.deepEqual(raw, original);
  assert.equal(Object.isFrozen(raw), false);
  assert.throws(() => { view.attributes[0].score = 1; }, TypeError);
  raw.attributes[0].score = Number(raw.attributes[0].score) + 2;
  const next = createCombatProfileReadModel(raw);
  assert.notEqual(next, view);
  assert.notEqual(next.attributes[0].score, view.attributes[0].score);
  assert.equal(createCombatProfileReadModel(view), view);
  const transported = structuredClone(view);
  transported.attributes[0].score = '9999';
  assert.deepEqual(getEffectiveCombatAttribute(transported, 'strength'),
    getEffectiveCombatAttribute(sanitizeCharacterCombatProfile(transported), 'strength'));
  assert.notEqual(sanitizeCharacterCombatProfile(view), view, 'explicit schema validation remains defensive');
});
