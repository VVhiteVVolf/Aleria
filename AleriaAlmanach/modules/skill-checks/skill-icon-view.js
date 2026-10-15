import { getSkillIconPresentation } from './skill-icon-registry.js';
import { bindDelegatedTooltips } from '../tooltips/tooltip-controller.js';
import { getChallengeAffinityModifier, getSkillDefinition } from './skill-check-model.js?v=20260928-equipment-art-v4';

const escape = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function renderSkillIcon(skill) {
  const icon = getSkillIconPresentation(typeof skill === 'string' ? skill : skill?.name || skill?.label || skill?.id);
  return `<img class="skill-medallion" src="${icon.src}" data-skill-icon="${icon.id}" alt="" width="32" height="32" loading="lazy" decoding="async">`;
}

export function skillTooltipAttributes(text) {
  return `data-skill-tooltip="${escape(text)}"`;
}

export function renderSkillHint(skill, hint) {
  return `<button type="button" class="skill-icon-hint" ${skillTooltipAttributes(hint)} aria-label="${escape(skill?.label || skill?.name || 'Fertigkeit')} – Hinweis">${renderSkillIcon(skill)}</button>`;
}

export function describeSkillChoice(skill, { preferred = null, modifier = 0 } = {}) {
  const label = skill?.label || skill?.name || 'Fertigkeit';
  if (preferred === null) return `${label} für diesen Versuch auswählen.`;
  return `${preferred ? 'Hier passt' : 'Alternative Fertigkeit:'} „${label}“. ${modifier >= 0 ? '+' : '−'}${Math.abs(modifier)} auf die Probe.`;
}

export function bindSkillIconTooltips(root) {
  return bindDelegatedTooltips(root, { attribute: 'data-skill-tooltip', className: 'skill-icon-tooltip', idPrefix: 'skill-icon-tooltip' });
}

export function renderSkillChoiceGroup({ skills, selectedId, segmentId, target = null, profileDetail = '' }) {
  return `<fieldset class="skill-choice-group"><legend>Fertigkeit auswählen</legend><div class="skill-choice-grid">${skills.map(skill => {
    const preferred = target ? target.preferredSkills.includes(skill.id) : null;
    const modifier = target ? getChallengeAffinityModifier(target, skill.id) : 0;
    const hint = describeSkillChoice(skill, { preferred, modifier });
    return `<label class="skill-choice" ${skillTooltipAttributes(hint)}><input type="radio" name="skill-choice-${escape(segmentId)}" data-skill-input="skillId" value="${escape(skill.id)}"${skill.id === selectedId ? ' checked' : ''}><span class="skill-choice-face">${renderSkillIcon(skill)}<span class="skill-choice-copy"><strong>${escape(skill.label)}</strong>${target ? `<small>${preferred ? 'Passend' : 'Alternative'} · ${modifier >= 0 ? '+' : '−'}${Math.abs(modifier)}</small>` : ''}</span></span></label>`;
  }).join('')}</div><small>${escape(profileDetail)}</small></fieldset>`;
}

export function renderPreferredSkillHints(target) {
  const skills = (target?.preferredSkills || []).map(getSkillDefinition).filter(Boolean);
  return `<span class="skill-icon-list" aria-label="Passende Fertigkeiten">${skills.map(skill => renderSkillHint(skill, describeSkillChoice(skill, { preferred: true, modifier: getChallengeAffinityModifier(target, skill.id) }))).join('') || '<span>Keine bevorzugte Fertigkeit</span>'}</span>`;
}
