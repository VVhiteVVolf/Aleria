import { getStatusIcon } from './combat-status-catalog.js?v=20260906-effect-rolls-v1';
import { formatStatusDuration } from './combat-status-model.js?v=20260906-effect-rolls-v1';
import { describeCombatTriggerRule } from '../combat/ui/combat-rule-presentation.js';
import { getCombatDamageTypeLabel, summarizeCombatMechanics } from '../combat/ui/combat-mechanics-presentation.js';
import { getActionBlockingCondition } from '../combat/combat-wait-action.js';
import { describeCombatWardDeflection } from '../combat/ui/combat-ward-presentation.js';
import { getCombatConditionIconId, getCombatConditionIconSource } from './combat-condition-icons.js';
import { getPeriodicConditionDamage, withCombatConditionRules } from './combat-condition-rules.js';

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

export function renderCombatStatusChips(conditions = [], label = 'Aktive Zustände') {
  const visible = conditions.filter(condition => condition?.active !== false && condition?.name);
  if (!visible.length) return '';
  return `<ul class="combat-status-chips" aria-label="${e(label)}">${visible.map(condition =>
    `<li data-condition-emblem="${e(getCombatConditionIconId(condition))}" title="${e(formatStatusDuration(condition))}">${renderCombatIcon(getCombatConditionIconSource(condition), '◆')}<span>${e(condition.name)}</span></li>`).join('')}</ul>`;
}

export function renderCombatCondition(condition, { removable = false, temporary = false, controls = '', diamond = temporary } = {}) {
  condition = withCombatConditionRules(condition, { scene: temporary });
  const periodic = getPeriodicConditionDamage(condition);
  const rules = (condition.triggerRules || []).filter(rule => rule.enabled !== false)
    .map(describeCombatTriggerRule);
  const preparation = [condition.blockedResource ? `${({ action: 'Aktion', reaction: 'Reaktion', 'bonus-action': 'Bonusaktion' })[condition.blockedResource] || condition.blockedResource} gesperrt` : '',
    getActionBlockingCondition({ conditions: [condition] }) ? 'Freiwillige Handlungen und Reaktionen gesperrt. Abwarten und Rettungen bleiben möglich.' : '',
    condition.blocksMovement ? 'Eigenständige Bewegung gesperrt' : '',
    condition.blocksVoice ? 'Eigene Stimme gesperrt' : '',
    condition.blockedSense ? `${({ vision: 'Sicht', hearing: 'Gehör', smell: 'Geruchssinn', taste: 'Geschmackssinn' })[condition.blockedSense] || condition.blockedSense} eingeschränkt` : '',
    condition.restraint?.dc > 0 ? `Befreiung im nächsten Beitrag · SG ${condition.restraint.dc} · Athletik, Stärke oder Geschick` : '',
    condition.damageGuard?.charges > 0 ? `Nächster Treffer: −${condition.damageGuard.reduction} Schaden · ${condition.damageGuard.charges} Ladung` : '',
    condition.ward?.enabled ? describeCombatWardDeflection(condition.ward) : '',
    condition.ward?.enabled && condition.ward.breaksOnCriticalHit ? 'Magische Abwehr zerbricht bei einem kritischen Treffer' : '',
    condition.counterAttack?.enabled ? 'Einmaliger Konter nach gegnerischem Fehlschlag' : '',
    condition.blockPreparedCounter ? 'Vorbereitete Konter gesperrt' : '',
    condition.criticalPeriodicLoss > 0 ? `Nachschaden: −${condition.criticalPeriodicLoss} TP zu Beginn jedes eigenen Beitrags` : '',
    periodic ? `${periodic.damageType ? `${periodic.amount} ${getCombatDamageTypeLabel(periodic.damageType)}-Schaden` : `−${periodic.amount} TP`} zu Beginn jedes eigenen Beitrags` : '',
    condition.endsOnHealing ? 'Endet bei Heilung regulärer TP' : '',
    condition.usage?.remaining > 0 ? `${condition.usage.remaining} verbleibende Anwendung${condition.usage.remaining === 1 ? '' : 'en'}` : '', ...rules].filter(Boolean).join(' · ');
  const modifiers = summarizeCombatMechanics({ ...condition.mechanics, blocksActions: false });
  const conditional = summarizeCombatMechanics(condition.conditionalMechanics);
  const duration = (temporary ? formatStatusDuration(condition) : condition.duration || 'Aus dem Charakterbogen')
    + (condition.concentrationOwnerId && condition.durationModel?.kind !== 'concentration' ? ' · Konzentration' : '');
  return `<li class="comment-combat-condition" data-condition-id="${e(condition.id)}" data-status-kind="${e(condition.statusKind || 'condition')}">
    <span class="comment-combat-condition-icon">${diamond ? renderCombatIcon(getCombatConditionIconSource(condition), '◆') : renderCombatIcon(getStatusIcon(condition) || condition.icon)}</span>
    <div><strong>${e(condition.name)}</strong><small>${e(duration)}${condition.ward?.enabled ? ` · ${e(condition.ward.charges)} Abwehrladungen` : ''}</small>
      ${modifiers ? `<small class="comment-combat-condition-modifiers">${e(modifiers)}</small>` : ''}
      ${conditional ? `<small class="comment-combat-condition-modifiers">Nur beim passenden Auslöser: ${e(conditional)}</small>` : ''}
      ${preparation ? `<small class="comment-combat-condition-modifiers">${e(preparation)}</small>` : ''}
      ${condition.description || condition.source ? `<details data-profile-details-key="condition:${e(condition.id)}"><summary>Wirkung & Quelle</summary><p>${e(condition.description || '')}</p>${condition.source ? `<p>${e(condition.source)}</p>` : ''}</details>` : ''}${controls}
    </div>${removable ? `<button type="button" data-action="remove-comment-combat-condition" data-condition-id="${e(condition.id)}" aria-label="${e(condition.name)} entfernen" title="Effekt entfernen">×</button>` : ''}</li>`;
}
