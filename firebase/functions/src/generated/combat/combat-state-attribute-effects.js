import {
  COMBAT_ATTRIBUTE_DEFINITIONS, createCombatProfileReadModel, getEffectiveCombatAttribute,
  getAttributeModifier, getArmorClass, getWeaponAttackModifier, getWeaponDamageModifier,
  getSpellcastingValues, getUniversalDamageBonus, getSkillTotal, getSavingThrowTotal, getPassivePerception,
  getEffectiveSkillProficiency, getNaturalRollPolicy, getCombatInitiative, getCombatMovement
} from './combat-profile-model.js';
import { resolveTechniqueSaveDc } from './combat-technique-save-dc.js';
import { getCombatStoredConditions } from './combat-runtime-condition-projection.js';

// Derive current stat changes through the same rules as a fresh character sheet.
// Replay-owned HP, resources, concentration and durations are intentionally absent.
export function getCombatStateAttributeEffects(profile, temporaryConditions = []) {
  const before = createCombatProfileReadModel(profile);
  const after = createCombatProfileReadModel({ ...profile,
    conditions: getCombatStoredConditions(profile), temporaryConditions });
  const attributes = COMBAT_ATTRIBUTE_DEFINITIONS.map(({ key }) => {
    const effective = getEffectiveCombatAttribute(after, key);
    return { ...effective, modifier: getAttributeModifier(effective),
      modifierDelta: getAttributeModifier(effective) - getAttributeModifier(getEffectiveCombatAttribute(before, key)) };
  });
  const modifierDeltas = Object.fromEntries(attributes.map(attribute => [attribute.key, attribute.modifierDelta]));
  const weaponDelta = weapon => ({
    attack: getWeaponAttackModifier(after, weapon) - getWeaponAttackModifier(before, weapon),
    damage: getWeaponDamageModifier(after, weapon) - getWeaponDamageModifier(before, weapon)
  });
  // Physical abilities may use the equipped weapon's attribute while their
  // display-only action weapon has no attribute of its own.
  const activeWeapon = profile.weapons?.find(weapon => weapon.equipped) || profile.weapons?.[0];
  const selectedWeapon = profile.weapon?.attackAttribute ? profile.weapon : activeWeapon || profile.weapon || {};
  const weapon = weaponDelta(selectedWeapon);
  const beforeSpell = getSpellcastingValues(before), afterSpell = getSpellcastingValues(after);
  const save = profile.selectedAction?.secondarySave;
  const secondarySaveDelta = save?.enabled
    ? resolveTechniqueSaveDc(save, after, selectedWeapon) - resolveTechniqueSaveDc(save, before, selectedWeapon) : 0;
  return { attributes, modifierDeltas, weapon,
    weapons: (profile.weapons || []).map(entry => ({ id: entry.id, ...weaponDelta(entry) })),
    skills: (profile.skills || []).map(entry => ({ id: entry.id, delta: getSkillTotal(after, entry) - getSkillTotal(before, entry),
      effectiveProficiency: getEffectiveSkillProficiency(after, entry) })),
    savingThrows: Object.fromEntries(COMBAT_ATTRIBUTE_DEFINITIONS.map(({ key }) => [key,
      getSavingThrowTotal(after, key) - getSavingThrowTotal(before, key)])),
    passivePerceptionDelta: getPassivePerception(after) - getPassivePerception(before),
    naturalRollPolicy: getNaturalRollPolicy(after),
    initiativeDelta: getCombatInitiative(after) - getCombatInitiative(before),
    movementDelta: getCombatMovement(after) - getCombatMovement(before),
    armorClassDelta: getArmorClass(after) - getArmorClass(before),
    spellAttackDelta: afterSpell.attack - beforeSpell.attack,
    spellSaveDcDelta: afterSpell.saveDc - beforeSpell.saveDc,
    universalDamageDelta: getUniversalDamageBonus(after) - getUniversalDamageBonus(before),
    secondarySaveDelta };
}
