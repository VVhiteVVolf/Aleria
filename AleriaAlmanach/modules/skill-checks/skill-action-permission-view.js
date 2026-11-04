import { getVoluntaryCombatActionBlock } from '../combat/combat-action-permission.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function getSkillActionPermissionBlock(profile, definition = {}) {
  return definition.checkType === 'saving-throw' ? null : getVoluntaryCombatActionBlock(profile);
}

export function renderSkillActionPermissionBlock(block) {
  return block ? `<div class="skill-check-warning" role="status" data-skill-action-block><p>${escape(block.message)}</p><p>Ein Abschnitt ohne Probe bleibt möglich. Rettungswürfe bleiben verfügbar.</p><button type="button" data-skill-action="set-mode" data-value="normal">Ohne Probe schildern</button></div>` : '';
}
