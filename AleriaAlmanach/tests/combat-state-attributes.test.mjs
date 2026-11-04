import test from 'node:test';
import assert from 'node:assert/strict';
import { resolveCombatProfile } from '../modules/combat/combat-profile-resolver.js';
import { overlayCombatHitPointState } from '../modules/combat/combat-state-model.js';
import { getEffectiveCombatAttribute, getSavingThrowTotal, getSkillTotal } from '../modules/combat/combat-profile-model.js';
import { SkillResolutionService } from '../modules/skill-checks/skill-resolution-service.js';
import { createSubstanceIntoxication } from '../modules/character-health/substance-state.js';

const keys = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
function actor(extra = {}, options = {}) {
  return resolveCombatProfile({ id: 'attribute-state', name: 'Attributprobe', combatProfile: {
    templateSelections: { classId: 'custom' }, progression: { level: 1, development: { mode: 'purchase' } },
    attributes: keys.map(key => ({ key, score: 10 })), hitPoints: { current: 9, maximumOverride: 30 },
    weapons: [{ id: 'bow', name: 'Bogen', equipped: true, weaponType: 'bow', attackAttribute: 'dexterity', damageFormula: '1d6' }],
    ...extra
  } }, options);
}
function overlay(profile, mechanics) {
  return overlayCombatHitPointState(profile, { current: 7, maximum: 30,
    temporaryConditions: [{ id: 'attribute-condition', name: 'Temporäre Prägung', active: true, mechanics }] });
}

test('temporary attribute effects reach all six AI attributes, skills and saves without rewriting HP or base values', () => {
  const base = actor(), before = structuredClone(base);
  const current = overlay(base, { attributeModifiers: keys.map(attributeKey => ({ attributeKey, bonus: 4 })), naturalOneReroll: true });
  for (const key of keys) {
    assert.equal(getEffectiveCombatAttribute(current, key).score, 14, key);
    assert.equal(current.aiSnapshot.attributes.find(attribute => attribute.key === key).score, 14, key);
    assert.equal(current.aiSnapshot.attributes.find(attribute => attribute.key === key).modifier, 2, key);
    assert.equal(getSavingThrowTotal(current, key), getSavingThrowTotal(base, key) + 2, key);
    assert.equal(current.aiSnapshot.savingThrows.find(save => save.attributeKey === key).total,
      base.aiSnapshot.savingThrows.find(save => save.attributeKey === key).total + 2, key);
  }
  for (const skill of base.aiSnapshot.skills) {
    assert.equal(current.aiSnapshot.skills.find(entry => entry.id === skill.id).total, skill.total + 2, skill.name);
  }
  assert.equal(current.attackModifier, base.attackModifier + 2);
  assert.equal(current.damageModifier, base.damageModifier + 2);
  assert.equal(current.totalDefense, base.totalDefense + 2);
  assert.equal(current.initiative, base.initiative + 2);
  assert.equal(current.passivePerception, base.passivePerception + 2);
  assert.equal(current.aiSnapshot.weapons[0].totalAttackModifier, base.aiSnapshot.weapons[0].totalAttackModifier + 2);
  assert.equal(current.aiSnapshot.weapons[0].totalDamageModifier, base.aiSnapshot.weapons[0].totalDamageModifier + 2);
  assert.equal(current.currentHitPoints, 7);
  assert.equal(current.maximumHitPoints, 30);
  assert.equal(current.aiSnapshot.naturalRollPolicy.naturalOneReroll, true);
  assert.deepEqual(current.attributes, base.attributes);
  assert.deepEqual(base, before);
});

test('mixed ordinary modifiers and attribute bonuses are counted once in combat and AI', () => {
  const base = actor();
  const current = overlay(base, { attributeModifiers: ['dexterity', 'intelligence', 'wisdom'].map(attributeKey => ({ attributeKey, bonus: 4 })),
    attack: 1, damage: 2, armorClass: 3, initiative: 1, skill: 1, savingThrow: 1, spellAttack: 1, spellSaveDc: 1 });
  assert.equal(current.attackModifier, base.attackModifier + 3);
  assert.equal(current.damageModifier, base.damageModifier + 4);
  assert.equal(current.totalDefense, base.totalDefense + 5);
  assert.equal(current.initiative, base.initiative + 3);
  assert.equal(current.passivePerception, base.passivePerception + 3);
  assert.equal(current.spellAttackModifier, base.spellAttackModifier + 4);
  assert.equal(current.spellSaveDc, base.spellSaveDc + 3);
  assert.equal(current.aiSnapshot.derivedCombatValues.armorClass, current.totalDefense);
  assert.equal(current.aiSnapshot.derivedCombatValues.initiative, current.initiative);
  assert.equal(current.aiSnapshot.derivedCombatValues.passivePerception, current.passivePerception);
});

test('temporary INT, WEI and CHA changes update the actual selected spell and honor explicit spell overrides', () => {
  for (const castingAttribute of ['intelligence', 'wisdom', 'charisma']) {
    const base = actor({ magic: { enabled: true, castingAttribute, spells: [{ id: 'test-spell', name: 'Prüfzauber', level: 0,
      prepared: true, rollFormula: '1d6', resolutionType: 'spell-attack' }] } }, { actionId: 'spell:test-spell' });
    const current = overlay(base, { attributeModifiers: [{ attributeKey: castingAttribute, bonus: 4 }] });
    assert.equal(current.attackModifier, base.attackModifier + 2, castingAttribute);
    assert.equal(current.spellAttackModifier, base.spellAttackModifier + 2, castingAttribute);
    assert.equal(current.actionSpellSaveDc, base.actionSpellSaveDc + 2, castingAttribute);
    assert.equal(current.damageModifier, base.damageModifier, 'attribute damage effects are resolved separately');
  }
  const overridden = actor({ magic: { enabled: true, castingAttribute: 'intelligence', spellAttackOverride: 18, spellSaveDcOverride: 25 } });
  const current = overlay(overridden, { attributeModifiers: [{ attributeKey: 'intelligence', bonus: 4 }], spellAttack: 2, spellSaveDc: 2 });
  assert.equal(current.spellAttackModifier, 18);
  assert.equal(current.spellSaveDc, 25);
});

test('temporary caps constrain free modifiers, dynamic secondary save DCs and light damage while total defense overrides stay fixed', () => {
  const technique = { id: 'control', name: 'Kontrollschuss', active: true, weaponTypes: ['bow'],
    damageModel: { mode: 'weapon-dice', lightAttack: true, baseDieCap: 4 },
    secondarySave: { enabled: true, attributeKey: 'strength', useWeaponAttribute: true, dcBase: 10, addProficiency: true } };
  const base = actor({ attributes: keys.map(key => ({ key, score: 18, modifierOverride: 6 })),
    armorClass: { override: 35, overrideMode: 'total' }, techniques: [technique] }, { actionId: 'technique:control' });
  const current = overlay(base, { attributeCaps: [{ attributeKey: 'dexterity', maximum: 3 }], armorClass: 5 });
  assert.equal(current.attackModifier, base.attackModifier - 10);
  assert.equal(current.damageModifier, -4);
  assert.equal(current.selectedAction.secondarySave.dc, base.selectedAction.secondarySave.dc - 10);
  assert.equal(current.totalDefense, 35);
  assert.equal(current.aiSnapshot.attributes.find(attribute => attribute.key === 'dexterity').maximum, 3);
  const fixed = actor({ techniques: [{ ...technique, secondarySave: { ...technique.secondarySave, fixedDc: 17 } }] }, { actionId: 'technique:control' });
  assert.equal(overlay(fixed, { attributeModifiers: [{ attributeKey: 'dexterity', bonus: 4 }] }).selectedAction.secondarySave.dc, 17);
});

test('a physical ability keeps the equipped weapon attribute when its display action carries no weapon attribute', () => {
  const base = actor({ abilities: [{ id: 'physical-ability', name: 'Körperliche Fähigkeit', active: true, combatUsable: true,
    rollFormula: '1d6', resolutionType: 'weapon-attack' }] }, { actionId: 'ability:physical-ability' });
  assert.equal(base.profileActionKind, 'ability');
  const current = overlay(base, { attributeModifiers: [{ attributeKey: 'dexterity', bonus: 4 }] });
  assert.equal(current.attackModifier, base.attackModifier + 2);
  assert.equal(current.damageModifier, base.damageModifier + 2);
});

test('ordinary named condition modifiers reach real skill rolls, weapon attacks, contextual saves and AI once', async () => {
  const base = actor();
  const current = overlay(base, {
    skillModifiers: [{ name: 'Wahrnehmung', bonus: 2 }],
    weaponModifiers: [{ weaponTypes: ['bow'], attack: 1, damage: 2 }],
    saveModifiers: [{ kind: 'fear', bonus: 2 }], saveAttributeModifiers: [{ attributeKey: 'constitution', bonus: 1 }]
  });
  const perception = current.skills.find(skill => skill.name === 'Wahrnehmung');
  const total = getSkillTotal(current, perception);
  const result = await new SkillResolutionService({ rollSkill: async ({ modifier }) => ({
    id: 'named-condition-check', natural: 10, dice: [10], keptDice: [10], total: 10 + modifier
  }) }).resolve({ actor: current, settings: { skillId: 'perception', difficulty: 10 } }, { actorProfile: current });
  assert.equal(total, getSkillTotal(base, perception) + 2);
  assert.equal(result.profileModifier, total);
  assert.equal(result.total, 10 + total);
  assert.equal(current.aiSnapshot.skills.find(skill => skill.id === perception.id).total, total);
  assert.equal(current.passivePerception, base.passivePerception + 2);
  assert.equal(current.attackModifier, base.attackModifier + 1);
  assert.equal(current.damageModifier, base.damageModifier + 2);
  assert.equal(current.aiSnapshot.weapons[0].totalAttackModifier, base.aiSnapshot.weapons[0].totalAttackModifier + 1);
  assert.equal(getSavingThrowTotal(current, 'constitution'), getSavingThrowTotal(base, 'constitution') + 1);
  assert.equal(current.aiSnapshot.savingThrows.find(save => save.attributeKey === 'constitution').total, getSavingThrowTotal(current, 'constitution'));
  assert.equal(getSavingThrowTotal(current, 'wisdom', { saveTags: ['fear'] }), getSavingThrowTotal(base, 'wisdom') + 2);
  assert.equal(getSavingThrowTotal(current, 'wisdom'), getSavingThrowTotal(base, 'wisdom'));
  assert.deepEqual(current.aiSnapshot.conditionsAndEffects.at(-1).mechanics.saveModifiers, [{ kind: 'fear', bonus: 2 }]);
});

test('substance and ordinary named skill effects are neither lost nor counted twice in scene and AI totals', () => {
  const base = actor();
  const kriss = createSubstanceIntoxication('kriss', { seconds: 0, actorId: base.characterId, sceneId: 'attribute-test' });
  const current = overlayCombatHitPointState(base, { current: 7, maximum: 30, temporaryConditions: [kriss,
    { id: 'ordinary-perception', name: 'Aufmerksamer Blick', active: true, mechanics: {
      skillModifiers: [{ name: 'Wahrnehmung', bonus: 1 }], skillProficiencies: [{ name: 'Nachforschungen', proficiency: 'trained' }]
    } }] });
  const perception = current.skills.find(skill => skill.name === 'Wahrnehmung');
  assert.equal(getSkillTotal(current, perception), getSkillTotal(base, perception) + 3);
  assert.equal(current.aiSnapshot.skills.find(skill => skill.id === perception.id).total, getSkillTotal(current, perception));
  assert.equal(current.passivePerception, base.passivePerception + 3);
  const investigation = current.skills.find(skill => skill.name === 'Nachforschungen');
  assert.equal(getSkillTotal(current, investigation), getSkillTotal(base, investigation) + 2);
  assert.equal(current.aiSnapshot.skills.find(skill => skill.id === investigation.id).total, getSkillTotal(current, investigation));
  assert.equal(current.aiSnapshot.skills.find(skill => skill.id === investigation.id).effectiveProficiency, 'trained');
  assert.equal(current.aiSnapshot.savingThrows.find(save => save.attributeKey === 'dexterity').total, getSavingThrowTotal(current, 'dexterity'));
});
