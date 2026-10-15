import { bindDelegatedTooltips } from '../../tooltips/tooltip-controller.js?v=20261015-skill-challenges-v2';

export function bindCombatTooltips(root) {
  return bindDelegatedTooltips(root, {
    attribute: 'data-combat-tooltip', className: 'combat-tooltip', idPrefix: 'combat-tooltip',
    clickSelector: '[data-combat-tooltip][tabindex]'
  })?.dispose;
}
