// Presentation state stays in the composer DOM; combat state belongs to the controller.
import { filterCombatActions } from './combat-action-picker.js?v=20260909-dragon-parent-v2';

const CONTROL_ATTRIBUTES = Object.freeze([
  'data-combat-input', 'data-combat-target-search', 'data-combat-action-search', 'data-combat-action-option', 'data-weapon-id', 'data-role',
  'data-payment-mode', 'data-combat-rule-toggle', 'data-combat-rule-distance',
  'data-source-actor-id', 'data-rule-id'
]);

export function filterCombatTargets(composer, query = '') {
  const select = composer?.querySelector('[data-combat-input="targetId"], [data-combat-input="targetIds"]');
  if (!select) return;
  const normalized = String(query).trim().toLocaleLowerCase('de');
  [...select.options].forEach(option => {
    option.hidden = !!option.value && !!normalized && !option.textContent.toLocaleLowerCase('de').includes(normalized);
  });
  select.querySelectorAll?.('optgroup').forEach(group => {
    group.hidden = ![...group.children].some(option => !option.hidden);
  });
}

export function captureComposerViewState(composer) {
  if (!composer) return null;
  const focused = composer.ownerDocument.activeElement;
  const ownsFocus = focused && composer.contains(focused);
  return {
    details: [...composer.querySelectorAll('[data-combat-details]')].map(detail => [detail.dataset.combatDetails, detail.open]),
    search: composer.querySelector('[data-combat-target-search]')?.value || '',
    actionSearch: composer.querySelector('[data-combat-action-search]')?.value || '',
    actionScroll: composer.querySelector('.combat-action-picker-options')?.scrollTop || 0,
    focusAttributes: ownsFocus ? CONTROL_ATTRIBUTES.filter(name => focused.hasAttribute(name)).map(name => [name, focused.getAttribute(name)]) : [],
    focusedSummary: ownsFocus && focused.tagName === 'SUMMARY' ? focused.closest('[data-combat-details]')?.dataset.combatDetails : '',
    selection: ownsFocus && focused.tagName === 'INPUT' && ['search', 'text'].includes(focused.type)
      ? [focused.selectionStart, focused.selectionEnd] : null
  };
}

export function restoreComposerViewState(composer, state) {
  if (!composer || !state) return;
  [...composer.querySelectorAll('[data-combat-details]')].forEach(detail => {
    const previous = state.details.find(([key]) => key === detail.dataset.combatDetails);
    if (previous) detail.open = previous[1];
  });
  const search = composer.querySelector('[data-combat-target-search]');
  if (search) {
    search.value = state.search;
    filterCombatTargets(composer, state.search);
  }
  const actionSearch = composer.querySelector('[data-combat-action-search]');
  if (actionSearch) {
    actionSearch.value = state.actionSearch || '';
    filterCombatActions(composer, actionSearch.value);
  }
  const actionList = composer.querySelector('.combat-action-picker-options');
  if (actionList) actionList.scrollTop = state.actionScroll || 0;
  const control = state.focusAttributes.length
    ? [...composer.querySelectorAll('input, select, button')].find(element => state.focusAttributes.every(([name, value]) => element.getAttribute(name) === value))
    : [...composer.querySelectorAll('[data-combat-details]')].find(detail => detail.dataset.combatDetails === state.focusedSummary)?.querySelector('summary');
  if (!control || control.disabled || control.hidden) return;
  control.focus({ preventScroll: true });
  if (state.selection && typeof control.setSelectionRange === 'function') control.setSelectionRange(...state.selection);
}
