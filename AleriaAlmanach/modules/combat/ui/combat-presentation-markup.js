export function escapeCombatHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
}

export function combatTooltipAttributes(text, { focusable = false } = {}) {
  return `data-combat-tooltip="${escapeCombatHtml(text)}"${focusable ? ' tabindex="0"' : ''}`;
}
