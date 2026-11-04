import { createCombatProfileReadModel, getAttributeModifier, getEffectiveCombatAttribute } from '../combat/combat-profile-model.js';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const signed = value => `${value >= 0 ? '+' : '−'}${Math.abs(value)}`;

export function getDevelopmentAttributePreview(profile = {}) {
  const calculation = createCombatProfileReadModel(profile);
  return calculation.attributes.map(base => {
    const effective = getEffectiveCombatAttribute(calculation, base.key);
    return { key: base.key, label: base.label, shortLabel: base.shortLabel, base: base.score, score: effective.score,
      modifier: getAttributeModifier(effective), maximum: effective.effectiveMaximum ?? null };
  });
}

export function renderDevelopmentAttributePreview(profile) {
  return `<div class="cp-setup-resource-grid" data-development-role="effective-attributes" aria-label="Wirksame Attribute nach der Entwicklung">${getDevelopmentAttributePreview(profile).map(entry => `<article><div><strong>${escape(entry.label)}</strong><b>${entry.score} (${signed(entry.modifier)})</b><small>Grundwert ${entry.base}${entry.maximum == null ? '' : ` · Obergrenze ${entry.maximum}`}</small></div></article>`).join('')}</div>`;
}
