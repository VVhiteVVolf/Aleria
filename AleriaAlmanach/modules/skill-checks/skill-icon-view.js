import { getAttributeIconPresentation } from './attribute-icon-registry.js?v=20261015-check-options-v1';
import { getCheckDescription } from './skill-check-guidance.js?v=20261015-check-options-v1';
import { getSkillIconPresentation } from './skill-icon-registry.js';
import { bindDelegatedTooltips } from '../tooltips/tooltip-controller.js?v=20261015-skill-challenges-v2';
import { getCheckDefinition, CHECK_DEFINITIONS } from './skill-check-model.js?v=20261016-check-policy-v1';
import { getChallengeCheckRule } from '../herausforderung/herausforderung-check-policy.js?v=20261016-check-policy-v1';

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

function renderCheckChoice(skill, { selectedId, segmentId, target, checkValues }) {
  const rule = getChallengeCheckRule(target, skill.id);
  const preferred = target ? target.preferredSkills.includes(skill.id) : null;
  const value = checkValues[skill.id];
  const signed = value => `${value >= 0 ? '+' : '−'}${Math.abs(value)}`;
  const status = !rule.allowed ? 'Gesperrt' : rule.modifier ? `Erschwert ${signed(rule.modifier)}` : preferred ? 'Erlaubt' : 'Alternative';
  const hint = `${describeSkillChoice(skill, { preferred })} ${rule.allowed ? rule.modifier ? `Fester Malus ${rule.modifier}: ${rule.reason || 'Für diesen Ansatz erschwert.'}` : '' : rule.reason}`;
  return `<label class="skill-choice${preferred ? ' skill-choice-preferred' : ''}${!rule.allowed ? ' skill-choice-blocked' : ''}${rule.modifier ? ' skill-choice-penalized' : ''}" ${skillTooltipAttributes(hint)}${rule.allowed ? '' : ' aria-disabled="true" tabindex="0"'}><input type="radio" name="skill-choice-${escape(segmentId)}" data-skill-input="skillId" value="${escape(skill.id)}"${skill.id === selectedId && rule.allowed ? ' checked' : ''}${rule.allowed ? '' : ' disabled'}><span class="skill-choice-face">${renderSkillIcon(skill)}<span class="skill-choice-copy"><strong>${escape(skill.label)}</strong>${target ? `<small class="skill-choice-status">${escape(status)}</small>` : ''}<span class="skill-choice-description">${escape(getCheckDescription(skill))}</span><small class="skill-choice-value">${!rule.allowed ? 'Für diesen Lösungsweg nicht freigegeben' : value == null ? 'Zuerst Figur wählen' : `Bogen ${signed(value)}${rule.modifier ? ` · Malus ${signed(rule.modifier)} = ${signed(value + rule.modifier)}` : ''}`}</small>${rule.modifier ? `<small class="skill-choice-penalty-reason">${escape(rule.reason || 'Für diesen Ansatz erschwert.')}</small>` : ''}${skill.id === selectedId && rule.allowed ? '<small class="skill-choice-selected">✓ Für diesen Wurf gewählt</small>' : ''}</span></span></label>`;
}

export function renderSkillChoiceGroup({ skills, selectedId, segmentId, target = null, profileDetail = '', checkValues = {} }) {
  const restricted = target?.source === 'herausforderung';
  const choices = restricted ? CHECK_DEFINITIONS : skills;
  const allowed = choices.filter(skill => getChallengeCheckRule(target, skill.id).allowed);
  const blocked = choices.filter(skill => !getChallengeCheckRule(target, skill.id).allowed);
  const context = { selectedId, segmentId, target, checkValues };
  return `<fieldset class="skill-choice-group"><legend>Probe auswählen${restricted ? ` · ${allowed.length} erlaubt` : ''}</legend><p class="skill-choice-instruction">Wähle genau eine Probe. Bogenwerte und aktive Effekte werden automatisch berücksichtigt.</p><div class="skill-choice-grid">${allowed.map(skill => renderCheckChoice(skill, context)).join('')}</div>${blocked.length ? `<details class="skill-choice-blocked-list"><summary>${blocked.length} gesperrte Proben anzeigen</summary><div class="skill-choice-grid">${blocked.map(skill => renderCheckChoice(skill, context)).join('')}</div></details>` : ''}<small>${escape(profileDetail)}</small></fieldset>`;
}

export function renderPreferredSkillHints(target) {
  const skills = (target?.preferredSkills || []).map(getCheckDefinition).filter(Boolean);
  return `<span class="skill-icon-list" aria-label="Passende Proben">${skills.map(skill => renderSkillHint(skill, describeSkillChoice(skill, { preferred: true }))).join('') || '<span>Keine bevorzugte Probe</span>'}</span>`;
}
