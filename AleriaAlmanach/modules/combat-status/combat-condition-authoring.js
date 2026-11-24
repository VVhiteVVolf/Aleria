import { COMBAT_CONDITION_RULES, getCombatConditionRule, withCombatConditionRules } from './combat-condition-rules.js';
import { escapeCombatMarkup } from './combat-status-view.js';
import { normalizeRuntimeCondition } from '../combat/combat-condition-duration.js';

export function renderCombatConditionPresetOptions(selected, { scene = true } = {}) {
  return '<option value="">Eigener Zustand</option>' + Object.entries(COMBAT_CONDITION_RULES)
    .filter(([id, rule]) => scene || !rule.periodicDamage || id === selected)
    .map(([id, rule]) => `<option value="${escapeCombatMarkup(id)}"${selected === id ? ' selected' : ''}>${escapeCombatMarkup(rule.name)}</option>`).join('');
}

export function selectCombatConditionPreset(condition = {}, presetId = '', { scene = true } = {}) {
  const previous = getCombatConditionRule(condition.presetId);
  const rule = getCombatConditionRule(presetId);
  const result = { ...condition };
  const modifiers = { ...condition.mechanics };
  for (const [key, value] of Object.entries(previous?.mechanics || {})) {
    if (JSON.stringify(modifiers[key]) === JSON.stringify(value)) delete modifiers[key];
  }
  for (const [key, value] of Object.entries(previous || {})) {
    if (!['mechanics', 'name', 'description', 'kind', 'tags'].includes(key)
      && JSON.stringify(result[key]) === JSON.stringify(value)) delete result[key];
  }
  const previousTags = new Set(String(previous?.tags || '').split(',').map(tag => tag.trim()).filter(Boolean));
  if (result.tags && previousTags.size) result.tags = result.tags.split(',').map(tag => tag.trim()).filter(tag => tag && !previousTags.has(tag)).join(', ');
  if (!rule) return { ...result, presetId: '', mechanics: modifiers };
  const name = !condition.name || condition.name === previous?.name ? rule.name : condition.name;
  const description = !condition.description || condition.description === previous?.description ? rule.description : condition.description;
  const projected = withCombatConditionRules({ ...result, presetId, name, description,
    statusKind: rule.kind || 'condition', mechanics: { ...modifiers, ...rule.mechanics } }, { scene });
  return scene && !projected.durationModel ? { ...projected, durationModel: normalizeRuntimeCondition(projected).durationModel } : projected;
}
