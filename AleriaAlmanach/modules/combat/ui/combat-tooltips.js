import { bindDelegatedTooltips } from '../../tooltips/tooltip-controller.js';

export function bindCombatTooltips(root) {
  return bindDelegatedTooltips(root, {
    attribute: 'data-combat-tooltip', className: 'combat-tooltip', idPrefix: 'combat-tooltip',
    clickSelector: '[data-combat-tooltip][tabindex]'
  })?.dispose;
}
