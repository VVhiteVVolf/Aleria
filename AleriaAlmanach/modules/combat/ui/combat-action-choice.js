import { getActionPaymentCosts } from '../combat-action-economy.js?v=20260905-resource-balance-v2';
import { getCombatResourceIconPresentation } from '../combat-resource-icons.js?v=20260803-composer-design-v1';
export function escapeActionHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function getActionCostPresentation(actor = {}, action = {}) {
  const selected = action.id === actor.selectedAction?.id ? actor.selectedAction : action;
  const totals = new Map();
  for (const cost of getActionPaymentCosts(selected, 'standard', actor)) {
    const resource = (actor.resources || []).find(entry => entry.id === cost.resourceId) || { id: cost.resourceId, name: cost.name };
    const previous = totals.get(cost.resourceId);
    totals.set(cost.resourceId, { resource, amount: (previous?.amount || 0) + cost.amount, icon: getCombatResourceIconPresentation(resource) });
  }
  return [...totals.values()];
}

export function renderActionCosts(actor, action) {
  const costs = getActionCostPresentation(actor, action);
  const label = costs.map(({ resource, amount }) => `${amount} ${resource.name || resource.id}`).join(' + ') || 'Kostenlos';
  return `<span class="combat-mini-costs" aria-label="${escapeActionHtml(label)}" title="${escapeActionHtml(label)}">${costs.map(({ amount, icon }) => `<span class="combat-mini-cost"><span class="combat-mini-cost-icon" aria-hidden="true"><b>${escapeActionHtml(icon.fallback)}</b>${icon.source ? `<img src="${escapeActionHtml(icon.source)}" alt="" loading="lazy" data-combat-picker-image>` : ''}</span><span aria-hidden="true">${amount}</span></span>`).join('') || 'Kostenlos'}</span>`;
}

export function renderActionChoice(actor, { action, label, group, minimumLevel, entry = {} }, selectedId, { detailed = false } = {}) {
  const description = String(entry.effect || entry.description || action.weapon?.notes || '');
  const searchText = `${group} ${label} ${description}`.toLocaleLowerCase('de');
  return `<button type="button"${detailed ? '' : ' role="option" tabindex="-1"'} data-combat-action-option="${escapeActionHtml(action.id)}" data-search-text="${escapeActionHtml(searchText)}" ${detailed ? 'aria-pressed' : 'aria-selected'}="${action.id === selectedId}"${action.compatible === false ? ' disabled' : ''}>
    <span>${escapeActionHtml(label)}${minimumLevel ? `<small class="combat-action-level">Ab Stufe ${minimumLevel}</small>` : ''}${detailed && description ? `<small class="combat-action-choice-description">${escapeActionHtml(description)}</small>` : ''}${action.compatible === false ? `<small>${escapeActionHtml(action.disabledReason || 'Zurzeit nicht verfügbar')}</small>` : ''}</span>${renderActionCosts(actor, action)}
  </button>`;
}

export function filterActionChoices(root, value = '', { onlyAvailable = false } = {}) {
  const query = String(value).trim().toLocaleLowerCase('de');
  const options = [...root.querySelectorAll('[data-combat-action-option]')];
  options.forEach(option => { option.hidden = !option.dataset.searchText.includes(query) || onlyAvailable && option.disabled; });
  root.querySelectorAll('[data-combat-action-group]').forEach(group => {
    const count = [...group.querySelectorAll('[data-combat-action-option]')].filter(option => !option.hidden).length;
    group.hidden = count === 0;
    const header = group.dataset.actionColumn != null ? root.querySelector(`th[data-action-column="${group.dataset.actionColumn}"]`) : group;
    if (header) {
      header.hidden = count === 0;
      const badge = header.querySelector('[data-combat-group-count]');
      if (badge) badge.textContent = String(count);
    }
  });
  const empty = root.querySelector('[data-combat-action-empty]');
  if (empty) empty.hidden = options.some(option => !option.hidden);
}
