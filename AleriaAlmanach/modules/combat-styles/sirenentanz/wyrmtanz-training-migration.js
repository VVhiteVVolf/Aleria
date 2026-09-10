import { DERWYN_FORM_IDS as F, SIRENENTANZ_FORM_IDS as OLD } from './sirenentanz-forms.js?v=20260909-dragon-parent-v2';
import { getDerwynBasicTechniques, getDerwynCenyrFoundationTechniques, getDerwynExpertTechniques } from './derwyn-techniques.js?v=20260909-dragon-parent-v2';

const currentTechniqueIds = new Set([
  ...getDerwynBasicTechniques(), ...getDerwynCenyrFoundationTechniques(), ...getDerwynExpertTechniques()
].map(technique => technique.id));
const retiredPathIds = new Set([OLD.breaker, OLD.current, OLD.depths]);

// The former mixed-weapon expert paths have no faithful one-to-one replacement.
// Release their selections so the player chooses a new weapon path explicitly.
// Keep still valid learned techniques by stable ID; the training boundary checks
// that their new form, level and slot are actually available to that character.
export function migrateDerwynFormId(formId) {
  const value = String(formId || '');
  if (value === OLD.advanced) return F.creative;
  return retiredPathIds.has(value) ? '' : value;
}

export function migrateDerwynTechniqueId(techniqueId) {
  const value = String(techniqueId || '');
  if (!value.startsWith('combat-style-sirenentanz-derwyn-')) return value;
  return currentTechniqueIds.has(value) ? value : '';
}

export function migrateDerwynTechniqueSlotId(slotId) {
  return String(slotId || '').replace(/^advanced-/, 'duelist-');
}
