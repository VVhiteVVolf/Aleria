import { getActionPaymentCosts } from '../combat-action-economy.js?v=20260905-resource-balance-v2';
import { getCombatResourceIconPresentation } from '../combat-resource-icons.js?v=20260803-composer-design-v1';
import { getActionGroups } from './combat-action-card.js?v=20260905-party-combat-v1';

function escapeHtml(value) {
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

function renderCosts(actor, action) {
  const costs = getActionCostPresentation(actor, action);
  const label = costs.map(({ resource, amount }) => `${amount} ${resource.name || resource.id}`).join(' + ') || 'Kostenlos';
  return `<span class="combat-mini-costs" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">${costs.map(({ amount, icon }) => `<span class="combat-mini-cost"><span class="combat-mini-cost-icon" aria-hidden="true"><b>${escapeHtml(icon.fallback)}</b>${icon.source ? `<img src="${escapeHtml(icon.source)}" alt="" loading="lazy" data-combat-picker-image>` : ''}</span><span aria-hidden="true">${amount}</span></span>`).join('') || 'Kostenlos'}</span>`;
}

export function renderActionPicker(actor = {}, selectedId = '') {
  const groups = getActionGroups(actor);
  const selected = [...groups.values()].flat().find(({ action }) => action.id === selectedId);
  return `<details class="combat-action-picker" data-combat-details="action-picker">
    <summary aria-label="Angriff oder Handlung wählen"><span>${escapeHtml(selected?.label || 'Handlung wählen')}</span>${selected ? renderCosts(actor, selected.action) : ''}<b aria-hidden="true">⌄</b></summary>
    <div class="combat-action-picker-panel">
      <input type="search" data-combat-action-search placeholder="Angriff oder Form suchen …" aria-label="Angriffe und Formen durchsuchen" autocomplete="off">
      <div class="combat-action-picker-options" role="listbox" aria-label="Handlungen und reguläre Kosten">
      ${[...groups].map(([group, actions]) => `<div role="group" aria-label="${escapeHtml(group)}" data-combat-action-group><div class="combat-action-picker-group" aria-hidden="true">${escapeHtml(group)}</div>${actions.map(({ action, label }) => `<button type="button" role="option" tabindex="-1" data-combat-action-option="${escapeHtml(action.id)}" data-search-text="${escapeHtml(`${group} ${label}`.toLocaleLowerCase('de'))}" aria-selected="${action.id === selectedId}"${action.compatible === false ? ' disabled' : ''}><span>${escapeHtml(label)}${action.compatible === false ? `<small>${escapeHtml(action.disabledReason || 'Zurzeit nicht verfügbar')}</small>` : ''}</span>${renderCosts(actor, action)}</button>`).join('')}</div>`).join('')}
      </div>
      <small data-combat-action-empty hidden>Keine passende Handlung gefunden.</small>
      <small class="combat-action-picker-hint">Reguläre Kosten · Aura-Fokus als Alternative unter „Kosten“.</small>
    </div>
  </details>`;
}

export function bindActionPicker(composer) {
  const picker = composer.querySelector('[data-combat-details="action-picker"]');
  const select = composer.querySelector('[data-combat-input="actionId"]');
  if (!picker || !select) return;
  select.hidden = true;
  const summary = picker.querySelector('summary');
  const search = picker.querySelector('[data-combat-action-search]');
  const options = [...picker.querySelectorAll('[data-combat-action-option]')];
  const available = () => options.filter(option => !option.disabled && !option.hidden);
  const close = () => { picker.open = false; summary.focus({ preventScroll: true }); };
  const choose = option => {
    if (!option || option.disabled || option.hidden) return;
    select.value = option.dataset.combatActionOption;
    close();
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };
  picker.addEventListener('click', event => {
    const option = event.target.closest('[data-combat-action-option]');
    if (option) choose(option);
  });
  picker.addEventListener('input', event => {
    if (event.target !== search) return;
    const query = search.value.trim().toLocaleLowerCase('de');
    options.forEach(option => { option.hidden = !option.dataset.searchText.includes(query); });
    picker.querySelectorAll('[data-combat-action-group]').forEach(group => {
      group.hidden = ![...group.querySelectorAll('[data-combat-action-option]')].some(option => !option.hidden);
    });
    picker.querySelector('[data-combat-action-empty]').hidden = options.some(option => !option.hidden);
  });
  picker.addEventListener('keydown', event => {
    if (event.key === 'Escape' && picker.open) { event.preventDefault(); close(); return; }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key) && (event.target !== search || event.key.startsWith('Arrow'))) {
      event.preventDefault();
      picker.open = true;
      const visible = available();
      const index = visible.indexOf(picker.ownerDocument.activeElement);
      const next = event.key === 'Home' ? 0 : (event.key === 'End' ? visible.length - 1
        : (index < 0 ? (event.key === 'ArrowDown' ? 0 : visible.length - 1) : Math.max(0, Math.min(visible.length - 1, index + (event.key === 'ArrowDown' ? 1 : -1)))));
      visible[next]?.focus();
    } else if (event.key === 'Enter' && event.target === search) {
      event.preventDefault(); choose(available()[0]);
    }
  });
  picker.addEventListener('focusout', event => {
    if (event.relatedTarget && !picker.contains(event.relatedTarget)) picker.open = false;
  });
  picker.addEventListener('error', event => {
    if (event.target.matches?.('[data-combat-picker-image]')) event.target.remove();
  }, true);
}
