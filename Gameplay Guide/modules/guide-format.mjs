import { getCombatResourceIconPresentation } from '../../AleriaAlmanach/modules/combat/combat-resource-icons.js';

export const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const COST_LABELS = { action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion', 'special-action': 'Besondere Aktion' };
export function renderIcon(source, className = '', lazy = true) {
  return source ? `<img class="icon ${className}" src="${escapeHtml(source)}" alt="" width="40" height="40"${lazy ? ' loading="lazy"' : ''} decoding="async">` : '';
}
export function renderCosts(entries = [], compact = false) {
  return entries.map(cost => {
    const label = `${cost.amount > 1 ? cost.amount + '× ' : ''}${COST_LABELS[cost.resourceId] || cost.name || cost.resourceId}`;
    const icon = getCombatResourceIconPresentation({ id: cost.resourceId }, 'https://aleria.invalid/AleriaAlmanach/');
    const source = icon.source.replace('https://aleria.invalid', '');
    return `<span class="cost cost-${escapeHtml(cost.resourceId)}${compact ? ' cost-compact' : ''}" title="${escapeHtml(label)}">${source ? renderIcon(source) : `<span aria-hidden="true">${escapeHtml(icon.fallback)}</span>`}<span${compact ? ' class="sr-only"' : ''}>${escapeHtml(label)}</span>${compact && cost.amount > 1 ? `<b aria-hidden="true">${cost.amount}</b>` : ''}</span>`;
  }).join('');
}
export function renderRuleText(text = '') {
  // Escape first; only wrap complete mechanical tokens, never interpret stored HTML.
  return escapeHtml(text).replace(/\b(?:KRF|GES|KON|INT|WEI|CHA)?\s*SG\s*\d+|\b\d+[Wd]\d+(?:\s*[+−-]\s*\d+)?|[+−-]\d+\s*(?:RK|Angriff|Schaden|maximale TP)|\b\d+\s*(?:TP|RK|%)/g,
    token => `<strong class="rule-number${/SG/.test(token) ? ' rule-save' : /Angriff|W20|d20/.test(token) ? ' rule-attack' : ''}">${token}</strong>`)
    .replace(/\n/g, '<br>');
}
export function renderFact(label, value, kind = '', icon = '') {
  return `<div class="mechanic mechanic-${escapeHtml(kind)}">${renderIcon(icon)}<div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div></div>`;
}
