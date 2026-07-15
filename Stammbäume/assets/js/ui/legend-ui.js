import { FAMILY_ROLES } from '../config/family-colors.js';
import { escapeHtml } from './dom.js';

export function renderFamilyLegend(container) {
  container.innerHTML = Object.values(FAMILY_ROLES).map(role => `
    <span class="legend-item ${role.cssClass}" title="${escapeHtml(role.description)}">
      <span class="legend-swatch" aria-hidden="true"></span>
      ${escapeHtml(role.label)}
    </span>
  `).join('');
}

