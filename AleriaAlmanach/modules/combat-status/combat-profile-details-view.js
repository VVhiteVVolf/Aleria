import { createCombatProfileReadModel, getAttributeModifier, getEffectiveCombatAttribute,
  getEffectiveSkillProficiency, getSavingThrowTotal, getSkillTotal } from '../combat/combat-profile-model.js';
import { escapeCombatMarkup as e, formatCombatModifier as signed, renderCombatCondition } from './combat-status-view.js';
import { isHealthTraitMechanicallyActive } from '../character-health/health-trait-policy.js';
import { isPsychologicalTraitMechanicallyActive } from '../character-development/development-psychological-policy.js';
import { isFamilyTraitMechanicallyActive } from '../character-development/development-family-policy.js';

export function renderCombatProfileAttributes(profile = {}) {
  if (!profile.attributes?.length) return '';
  const calculation = createCombatProfileReadModel(profile);
  const attributes = calculation.attributes.map(base => {
    const effective = getEffectiveCombatAttribute(calculation, base.key);
    return `<li class="comment-combat-condition"><div><strong>${e(base.label)} ${effective.score} (${signed(getAttributeModifier(effective))})</strong><small>Grundwert ${base.score}${effective.effectiveMaximum == null ? '' : ` · Obergrenze ${effective.effectiveMaximum}`} · Rettung ${signed(getSavingThrowTotal(calculation, base.key))}</small></div></li>`;
  });
  const proficiency = { none: 'Ungeübt', trained: 'Geübt', expertise: 'Expertise' };
  const skills = calculation.skills.map(skill => `<li class="comment-combat-condition"><div><strong>${e(skill.name)} ${signed(getSkillTotal(calculation, skill))}</strong><small>${e(proficiency[getEffectiveSkillProficiency(calculation, skill)])}</small></div></li>`);
  return `<details class="comment-combat-profile-section" data-profile-details-key="attributes"><summary>Attribute &amp; Rettungswürfe</summary><p class="comment-combat-profile-note">Wirksame Werte einschließlich aktiver Merkmale und Zustände. Situative Regeln gelten bei der passenden Probe.</p><ul class="comment-combat-conditions">${attributes.join('')}</ul></details>${skills.length ? `<details class="comment-combat-profile-section" data-profile-details-key="skills"><summary>Fertigkeiten (${skills.length})</summary><ul class="comment-combat-conditions">${skills.join('')}</ul></details>` : ''}`;
}

export function renderCombatProfileTraits(profile = {}) {
  const traits = profile.quirks || [];
  if (!traits.length) return '';
  return `<details class="comment-combat-profile-section" data-profile-details-key="traits"><summary>Eigenschaften &amp; Marotten (${traits.length})</summary><p class="comment-combat-profile-note">Die Beschreibung nennt Auslöser und Grenzen. Bedingte Wirkungen zählen erst bei passendem Auslöser.</p><ul class="comment-combat-conditions">${traits.map(trait => {
    const status = trait.active === false ? 'inaktiv' : !isHealthTraitMechanicallyActive(trait, profile)
      || !isPsychologicalTraitMechanicallyActive(trait, profile) || !isFamilyTraitMechanicallyActive(trait, profile) ? 'derzeit ohne Rechenwirkung' : 'aktiv';
    return renderCombatCondition({ ...trait, name: `${trait.name} · ${status}`, duration: trait.appliesWhen || trait.duration || 'Dauerhaft',
      description: [trait.description, trait.limitations].filter(Boolean).join(' ') });
  }).join('')}</ul></details>`;
}
