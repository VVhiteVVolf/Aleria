import { getStatusIcon, STATUS_MODIFIERS, STATUS_ROLL_MODES } from './combat-status-catalog.js?v=20260906-effect-rolls-v1';
import { getRollModeLabel } from '../combat/combat-roll-mode.js?v=20260906-effect-rolls-v1';
import { formatStatusDuration } from './combat-status-model.js?v=20260906-effect-rolls-v1';

export function escapeCombatMarkup(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}
export function safeCombatImage(value) {
  const source = String(value || '').trim();
  return /^(?:https?:\/\/|\.{0,2}\/)/i.test(source) ? source : '';
}
const e = escapeCombatMarkup;
export const formatCombatModifier = value => `${Number(value) >= 0 ? '+' : ''}${Number(value) || 0}`;
export const renderCombatIcon = (source, fallback = '✦') => safeCombatImage(source)
  ? `<img src="${e(source)}" data-combat-image-fallback="${e(fallback)}" alt="" loading="lazy" decoding="async">` : `<span class="combat-status-icon-fallback" aria-hidden="true">${e(fallback)}</span>`;

export function renderCombatCondition(condition, { removable = false, temporary = false } = {}) {
  const modifiers = [...STATUS_MODIFIERS, ['movement', 'Bewegung'], ['initiative', 'Initiative']].filter(([key]) => Number(condition.mechanics?.[key]))
    .map(([key, label]) => `${label} ${formatCombatModifier(condition.mechanics[key])}`).join(' · ');
  const rollModes = STATUS_ROLL_MODES.filter(([key]) => ['advantage', 'disadvantage'].includes(condition.mechanics?.[key]))
    .map(([key, label]) => `${getRollModeLabel(condition.mechanics[key])}: ${label}`).join(' · ');
  const duration = (temporary ? formatStatusDuration(condition) : condition.duration || 'Aus dem Charakterbogen')
    + (condition.concentrationOwnerId && condition.durationModel?.kind !== 'concentration' ? ' · Konzentration' : '');
  return `<li class="comment-combat-condition" data-condition-id="${e(condition.id)}" data-status-kind="${e(condition.statusKind || 'condition')}">
    <span class="comment-combat-condition-icon">${renderCombatIcon(getStatusIcon(condition) || condition.icon)}</span>
    <div><strong>${e(condition.name)}</strong><small>${e(duration)}${condition.ward?.enabled ? ` · ${e(condition.ward.charges)} Abwehrladungen` : ''}</small>
      ${modifiers ? `<small class="comment-combat-condition-modifiers">${e(modifiers)}</small>` : ''}
      ${rollModes ? `<small class="comment-combat-condition-modifiers">${e(rollModes)}</small>` : ''}
      ${condition.description || condition.source ? `<details><summary>Wirkung & Quelle</summary><p>${e(condition.description || '')}</p>${condition.source ? `<p>${e(condition.source)}</p>` : ''}</details>` : ''}
    </div>${removable ? `<button type="button" data-action="remove-comment-combat-condition" data-condition-id="${e(condition.id)}" aria-label="${e(condition.name)} entfernen" title="Effekt entfernen">×</button>` : ''}</li>`;
}
