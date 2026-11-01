import { getEquipmentPreparationCosts, describeEquipmentPreparationCosts } from './equipment-preparation-costs.js';

export function describeConditionalEquipmentDefense(combat = {}) {
  return (combat.triggerRules || []).filter(rule => rule.enabled !== false && rule.phase === 'pre-roll'
    && rule.recipient === 'target' && rule.sourceRelation === 'self' && rule.activation === 'passive'
    && rule.condition === 'always' && rule.frequency === 'always' && rule.weaponAttackOnly === true
    && ['melee', 'ranged'].includes(rule.attackRange) && Number(rule.effects?.defenseModifier) > 0)
    .map(rule => `${rule.attackRange === 'melee' ? 'Nahkampf' : 'Fernkampf'} +${rule.effects.defenseModifier} RK`);
}

export function describeEquipmentStats(combat = {}) {
  const result = [];
  const dice = value => String(value || '').replace(/d/gi, 'W');
  if (combat.kind === 'weapon') {
    if (combat.damageFormula) result.push(`Schaden: ${dice(combat.damageFormula)} ${combat.damageType || ''}`.trim());
    if (combat.versatileDamageFormula) result.push(`Zweihändig: ${dice(combat.versatileDamageFormula)}`);
  } else {
    const shield = combat.armorKind === 'shield' || combat.kind === 'shield';
    if (shield) {
      const conditional = describeConditionalEquipmentDefense(combat);
      if (Number(combat.armorClassBonus) || !conditional.length) result.push(`Schild: +${Number(combat.armorClassBonus) || 0} RK`);
      result.push(...conditional);
    }
    else if (combat.baseArmorClass != null) {
      result.push(`Basis-RK: ${combat.baseArmorClass}`);
      if (combat.armorCategory === 'medium') result.push('GES bis +2 auf Stufe 1–9, bis +4 auf Stufe 10–15, voll ab Stufe 16');
      else result.push(combat.dexterityMode === 'none' ? 'Kein GES-Bonus' : combat.dexterityMode === 'capped' ? `GES bis +${combat.dexterityCap}` : 'Voller GES-Bonus');
    }
    if (combat.armorRuleVersion === 2) {
      if (combat.mechanics?.movement) result.push(`Bewegung ${combat.mechanics.movement > 0 ? '+' : ''}${combat.mechanics.movement} m`);
      if (combat.mechanics?.initiative) result.push(`Initiative ${combat.mechanics.initiative > 0 ? '+' : ''}${combat.mechanics.initiative}`);
    }
    if (shield) result.push(`Anlegen/Aufstellen nach der Startaufstellung: ${describeEquipmentPreparationCosts(getEquipmentPreparationCosts(combat))}`);
  }
  if (combat.properties) result.push(combat.properties);
  return result;
}
