import { getAttributeIconPresentation } from './attribute-icon-registry.js?v=20261015-check-options-v1';
import { getCheckDescription } from './skill-check-guidance.js?v=20261015-check-options-v1';
import { getSkillIconPresentation } from './skill-icon-registry.js';
import { bindDelegatedTooltips } from '../tooltips/tooltip-controller.js?v=20261015-skill-challenges-v2';
import { getCheckDefinition } from './skill-check-model.js?v=20261016-guided-checks-v1';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function renderSkillIcon(skill) {
  const icon = getAttributeIconPresentation(skill) || getSkillIconPresentation(typeof skill === 'string' ? skill : skill?.name || skill?.label || skill?.id);
  return `<img class="skill-medallion" src="${icon.src}" data-skill-icon="${icon.id}" alt="" width="32" height="32" loading="lazy" decoding="async">`;
}

export function skillTooltipAttributes(text) {
  return `data-skill-tooltip="${escape(text)}"`;
}

export function renderSkillHint(skill, hint) {
  return `<button type="button" class="skill-icon-hint" ${skillTooltipAttributes(hint)} aria-label="${escape(skill?.label || skill?.name || 'Fertigkeit')} – Hinweis">${renderSkillIcon(skill)}</button>`;
}

export function describeSkillChoice(skill, { preferred = null } = {}) {
  const label = skill?.label || skill?.name || 'Fertigkeit';
  const description = getCheckDescription(skill);
  if (preferred === null) return `${label}: ${description} Für diesen Versuch auswählen.`;
  return `${preferred ? 'Passende Probe:' : 'Alternative Probe:'} „${label}“. ${description} Es zählt der Wert aus deinem Charakterbogen einschließlich geltender Effekte.`;
}

export function bindSkillIconTooltips(root) {
  return bindDelegatedTooltips(root, { attribute: 'data-skill-tooltip', className: 'skill-icon-tooltip', idPrefix: 'skill-icon-tooltip' });
}

export function renderSkillChoiceGroup({ skills, selectedId, segmentId, target = null, profileDetail = '' }) {
  return `<fieldset class="skill-choice-group"><legend>Probe auswählen</legend><div class="skill-choice-grid">${skills.map(skill => {
    const preferred = target ? target.preferredSkills.includes(skill.id) : null;
    const hint = describeSkillChoice(skill, { preferred });
    return `<label class="skill-choice${preferred ? ' skill-choice-preferred' : ''}" ${skillTooltipAttributes(hint)}><input type="radio" name="skill-choice-${escape(segmentId)}" data-skill-input="skillId" value="${escape(skill.id)}"${skill.id === selectedId ? ' checked' : ''}><span class="skill-choice-face">${renderSkillIcon(skill)}<span class="skill-choice-copy"><strong>${escape(skill.label)}</strong>${target ? `<small>${preferred ? 'Passend' : 'Alternative'} · Charakterbogen</small>` : ''}${skill.id === selectedId ? '<small class="skill-choice-selected">✓ Für diesen Wurf gewählt</small>' : ''}</span></span></label>`;
  }).join('')}</div><small>${escape(profileDetail)}</small></fieldset>`;
}

export function renderPreferredSkillHints(target) {
  const skills = (target?.preferredSkills || []).map(getCheckDefinition).filter(Boolean);
  return `<span class="skill-icon-list" aria-label="Passende Proben">${skills.map(skill => renderSkillHint(skill, describeSkillChoice(skill, { preferred: true }))).join('') || '<span>Keine bevorzugte Probe</span>'}</span>`;
}
