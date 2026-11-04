import { summarizeCombatMechanics } from '../combat/ui/combat-mechanics-presentation.js';
import { describeCombatTriggerRule } from '../combat/ui/combat-rule-presentation.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function renderCreatureRuleSummary(entry = {}) {
  const mechanics = summarizeCombatMechanics(entry.mechanics);
  const rules = (entry.triggerRules || []).filter(rule => rule.enabled !== false).map(describeCombatTriggerRule);
  return `${mechanics ? `<p class="creature-rule-summary">${escape(mechanics)}</p>` : ''}${rules.length ? `<ul class="creature-rule-summary">${rules.map(rule => `<li>${escape(rule)}</li>`).join('')}</ul>` : ''}`;
}
