import { renderSkillIcon, skillTooltipAttributes } from '../skill-checks/skill-icon-view.js?v=20261016-check-policy-v1';
import { getCheckDescription } from '../skill-checks/skill-check-guidance.js';

const bindings = new WeakMap();
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function renderChallengeCheckOption(approach, skill, index) {
  const allowed = approach.preferredSkills.includes(skill.id);
  const penalty = approach.checkPenalties?.find(entry => entry.checkId === skill.id);
  return `<div class="herausforderung-check-option${allowed ? ' is-allowed' : ''}" data-hcp-option data-check-id="${skill.id}">
    <label class="herausforderung-skill-check" ${skillTooltipAttributes(`${skill.label}: ${getCheckDescription(skill)} Aktivieren, um diese Probe zu erlauben.`)}><input type="checkbox" data-herausforderung-approach-index="${index}" data-herausforderung-field="preferredSkill" data-skill-id="${skill.id}"${allowed ? ' checked' : ''}><span>${renderSkillIcon(skill)}${escape(skill.label)}</span></label>
    <div class="herausforderung-check-adjustment"><label>Malus<input type="number" min="-30" max="0" step="1" value="${escape(penalty?.modifier || 0)}" data-hcp-field="modifier" data-approach-index="${index}" aria-label="Malus für ${escape(skill.label)}"${allowed ? '' : ' disabled'}></label><label>Begründung<input maxlength="240" value="${escape(penalty?.reason || '')}" placeholder="Optional, z. B. unempfänglich für Flirten" data-hcp-field="reason" data-approach-index="${index}" aria-label="Begründung für ${escape(skill.label)}"${allowed ? '' : ' disabled'}></label></div>
  </div>`;
}

export function refreshChallengeCheckPolicyEditor(root, approaches) {
  for (const row of root.querySelectorAll('[data-herausforderung-approach-row]')) {
    const approach = approaches[Number(row.dataset.approachIndex)];
    if (!approach) continue;
    for (const option of row.querySelectorAll('[data-hcp-option]')) {
      const allowed = approach.preferredSkills.includes(option.dataset.checkId);
      option.classList.toggle('is-allowed', allowed);
      const entry = approach.checkPenalties?.find(entry => entry.checkId === option.dataset.checkId);
      for (const input of option.querySelectorAll('[data-hcp-field]')) {
        input.disabled = !allowed;
        if (input !== root.ownerDocument.activeElement) input.value = input.dataset.hcpField === 'modifier' ? (entry?.modifier || 0) : (entry?.reason || '');
      }
    }
  }
}

export function mountChallengeCheckPolicyEditor(root, binding) {
  const previous = bindings.has(root); bindings.set(root, binding);
  if (previous) return;
  root.addEventListener('input', event => {
    const input = event.target.closest('[data-hcp-field]');
    if (!input || root.getAttribute('aria-busy') === 'true') return;
    const current = bindings.get(root), approach = current.approaches[Number(input.dataset.approachIndex)];
    const checkId = input.closest('[data-hcp-option]').dataset.checkId;
    if (!approach?.preferredSkills.includes(checkId)) return;
    approach.checkPenalties ||= [];
    let entry = approach.checkPenalties.find(entry => entry.checkId === checkId);
    if (!entry) { entry = { checkId, modifier: 0, reason: '' }; approach.checkPenalties.push(entry); }
    entry[input.dataset.hcpField] = input.dataset.hcpField === 'modifier' ? Number(input.value) : input.value;
    current.onChange();
  });
}
