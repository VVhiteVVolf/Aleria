import { getActionGroups } from './combat-action-card.js?v=20260909-dragon-parent-v2';
import { escapeActionHtml as escapeHtml, renderActionCosts as renderCosts, renderActionChoice, filterActionChoices } from './combat-action-choice.js';
import { bindActionTable } from './combat-action-table.js';
export { getActionCostPresentation } from './combat-action-choice.js';

export function renderActionPicker(actor = {}, selectedId = '', groups = getActionGroups(actor)) {
  const selected = [...groups.values()].flat().find(({ action }) => action.id === selectedId);
  return `<div class="combat-action-picker-views"><span>Listenauswahl</span><button type="button" data-action="open-action-table" aria-haspopup="dialog">▦ Übersicht öffnen</button></div><details class="combat-action-picker" data-combat-details="action-picker">
    <summary><span>${escapeHtml(selected?.label || 'Handlung wählen')}</span>${selected ? renderCosts(actor, selected.action) : ''}<b aria-hidden="true">⌄</b></summary>
    <div class="combat-action-picker-panel">
      <input type="search" data-combat-action-search placeholder="Angriff oder Form suchen …" aria-label="Angriffe und Formen durchsuchen" autocomplete="off">
      <div class="combat-action-picker-options" role="listbox" aria-label="Handlungen und reguläre Kosten">
      ${[...groups.values()].map(actions => renderGroup(actor, actions, selectedId)).join('')}
      </div>
      <small data-combat-action-empty role="status" hidden>Keine passende Handlung gefunden.</small>
      <small class="combat-action-picker-hint">Reguläre Kosten · Aura-Fokus als Alternative unter „Kosten“.</small>
    </div>
  </details>`;
}

function renderGroup(actor, actions, selectedId) {
  const group = actions[0].group;
  return `<div role="group" aria-label="${escapeHtml(group)}" data-combat-action-group>
    <div class="combat-action-picker-group" aria-hidden="true"><span>${escapeHtml(group)}</span><span class="combat-action-group-count" data-combat-group-count>${actions.length}</span></div>
    ${actions.map(choice => renderActionChoice(actor, choice, selectedId)).join('')}
  </div>`;
}

export function filterCombatActions(composer, value = '') {
  const picker = composer?.querySelector('[data-combat-details="action-picker"]');
  if (!picker) return;
  filterActionChoices(picker, value);
  const options = [...picker.querySelectorAll('[data-combat-action-option]')];
  const available = options.filter(option => !option.disabled && !option.hidden);
  const tabStop = available.find(option => option.getAttribute('aria-selected') === 'true') || available[0];
  options.forEach(option => { option.tabIndex = option === tabStop ? 0 : -1; });
}

export function bindActionPicker(composer, actor = {}) {
  const picker = composer.querySelector('[data-combat-details="action-picker"]');
  const select = composer.querySelector('[data-combat-input="actionId"]');
  if (!picker || !select) return;
  select.hidden = true;
  const summary = picker.querySelector('summary');
  const search = picker.querySelector('[data-combat-action-search]');
  const options = [...picker.querySelectorAll('[data-combat-action-option]')];
  const available = () => options.filter(option => !option.disabled && !option.hidden);
  filterCombatActions(composer, search.value);
  const close = () => { picker.open = false; summary.focus({ preventScroll: true }); };
  const choose = option => {
    if (!option || option.disabled || option.hidden) return;
    select.value = option.dataset.combatActionOption;
    close();
    select.dispatchEvent(new Event('change', { bubbles: true }));
  };
  bindActionTable(composer, actor, select, choose);
  picker.addEventListener('click', event => {
    const option = event.target.closest('[data-combat-action-option]');
    if (option) choose(option);
  });
  picker.addEventListener('input', event => {
    if (event.target !== search) return;
    filterCombatActions(composer, search.value);
    picker.querySelector('.combat-action-picker-options').scrollTop = 0;
  });
  picker.addEventListener('focusin', event => {
    if (!event.target.matches?.('[data-combat-action-option]')) return;
    options.forEach(option => { option.tabIndex = option === event.target ? 0 : -1; });
  });
  picker.addEventListener('toggle', () => {
    if (picker.open && picker.ownerDocument.activeElement === summary) search.focus({ preventScroll: true });
  });
  composer.addEventListener('pointerdown', event => {
    if (!picker.contains(event.target)) picker.open = false;
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
