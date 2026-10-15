import { COMBAT_ATTRIBUTE_DEFINITIONS,
  getSavingThrowTotal, getSavingThrowRollModes, getSkillTotal } from '../combat/combat-profile-model.js';

// Stable IDs distinguish untrained attribute checks from trained saving throws.
export const ATTRIBUTE_CHECK_DEFINITIONS = Object.freeze(COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => Object.freeze({
  id: `attribute:${attribute.key}`, label: `${attribute.label} – Attributswurf`,
  attributeKey: attribute.key, attributeLabel: attribute.label, checkType: 'attribute'
})));
export const SAVING_THROW_DEFINITIONS = Object.freeze(COMBAT_ATTRIBUTE_DEFINITIONS.map(attribute => Object.freeze({
  id: `save:${attribute.key}`, label: `${attribute.label} – Rettungswurf`,
  attributeKey: attribute.key, attributeLabel: attribute.label, checkType: 'saving-throw'
})));

export function resolveAttributeCheckModifier(profile, definition) {
  const savingThrow = definition.checkType === 'saving-throw';
  return { definition, profile, profileSkill: null,
    modifier: savingThrow ? getSavingThrowTotal(profile, definition.attributeKey)
      : getSkillTotal(profile, { id: definition.id, name: definition.attributeLabel,
        attributeKey: definition.attributeKey, proficiency: 'none', bonus: 0 }),
    source: savingThrow ? 'saving-throw' : 'attribute-check' };
}

export function getCheckProfileRollModes(profile, definition, skillModes = []) {
  return definition.checkType === 'saving-throw'
    ? getSavingThrowRollModes(profile, definition.attributeKey) : skillModes;
}

export function describeCheckModifierSource(source) {
  return ({ 'character-sheet': 'Fertigkeit, Attribut und Übung', 'attribute-fallback': 'Attribut (Fertigkeit ungeübt)',
    'attribute-check': 'Attribut und geltende Effekte', 'saving-throw': 'Rettungswurf, Ausbildung und geltende Effekte' })[source] || 'Charakterbogen';
}
