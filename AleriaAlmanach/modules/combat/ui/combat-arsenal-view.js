import { escapeActionHtml as escape, renderActionCosts } from './combat-action-choice.js?v=20261015-scenarios-v2';
import { renderActionDetails, renderCombatValueStrip } from './combat-action-card.js?v=20261015-scenarios-v2';
import { actionDescription } from './combat-arsenal-model.js?v=20261015-scenarios-v2';
import { getCombatResourceIconPresentation } from '../combat-resource-icons.js?v=20260803-composer-design-v1';
import { renderWeaponCrest } from './combat-presentation-icons.js?v=20261015-scenarios-v2';
import { getActionWeaponSections } from './combat-action-taxonomy.js?v=20261015-scenarios-v2';

export function renderArsenalNavigation(groups) {
  return [...groups].map(([key, choices]) => `<div class="combat-arsenal-nav-group"><button type="button" data-arsenal-section="${escape(key)}" aria-pressed="false"><span data-arsenal-label>${escape(choices[0].group)}</span><b data-arsenal-count>${choices.length}</b></button>${getActionWeaponSections(choices).map(section => `<button type="button" class="combat-arsenal-nav-weapon" data-arsenal-section="${escape(section.key)}" aria-pressed="false">${renderWeaponCrest(section.weapon)}<span data-arsenal-label>${escape(section.weapon.label)}</span><b data-arsenal-count>${section.choices.length}</b></button>`).join('')}</div>`).join('');
}

export function renderArsenalSections(actor, groups, selectedId) {
  return [...groups].map(([key, choices]) => `<h4 class="combat-arsenal-section-heading" data-arsenal-section-heading="${escape(key)}">${escape(choices[0].group)}</h4>${getActionWeaponSections(choices).map(section => `<h5 class="combat-arsenal-weapon-heading" data-arsenal-section-heading="${escape(section.key)}">${renderWeaponCrest(section.weapon, { withLabel: true })}<span>${section.choices.length}</span></h5>${section.choices.map(choice => renderArsenalCard(actor, choice, selectedId)).join('')}`).join('')}`).join('');
}

export function renderArsenalCard(actor, choice, selectedId) {
  const { action, label, group, groupKey, minimumLevel, weaponCategory } = choice;
  return `<article class="combat-arsenal-card" data-arsenal-card="${escape(action.id)}" data-group-key="${escape(groupKey)}" data-weapon-category="${escape(weaponCategory?.id)}"${action.compatible === false ? ' data-unavailable' : ''}>
    <button type="button" class="combat-arsenal-inspect" data-combat-action-option="${escape(action.id)}" aria-pressed="${action.id === selectedId}">
      <small class="combat-arsenal-card-group">${escape(group)}</small><span class="combat-arsenal-card-title">${renderWeaponCrest(weaponCategory)}<strong>${escape(label)}</strong></span>
      <small class="combat-arsenal-card-weapon">${escape(weaponCategory?.label || 'Waffenbereich')}${weaponCategory?.mounted ? ' · Beritten' : ''}</small>
      <span class="combat-arsenal-description">${escape(actionDescription(choice) || 'Wirkung und Voraussetzungen in der Detailansicht.')}</span>
      <span class="combat-arsenal-card-bottom"><small>${minimumLevel ? `Stufe ${minimumLevel}` : 'Grundhandlung'}${action.compatible === false ? ' · Gesperrt' : ''}</small>${renderActionCosts(actor, action)}</span>
    </button>
    <button type="button" class="combat-arsenal-favorite" data-arsenal-favorite="${escape(action.id)}" aria-pressed="false" aria-label="${escape(label)} als Favorit merken" title="Favorit merken">☆</button>
  </article>`;
}

export function renderArsenalDetail(actor, choice) {
  if (!choice) return '<div class="combat-arsenal-detail-empty"><span aria-hidden="true">◇</span><h3>Deine nächste Handlung</h3><p>Wähle eine Karte, um Wirkung, Kosten und Voraussetzungen anzusehen.</p></div>';
  const { action, label, group, weaponCategory } = choice;
  const preview = { ...actor, selectedAction: action, weapon: action.weapon || actor.weapon, actionResolutionMode: action.resolutionMode, attackModifier: action.attackModifier ?? actor.attackModifier, damageModifier: action.damageModifier ?? actor.damageModifier };
  const unavailableTechnique = action.kind === 'technique' && action.compatible === false;
  return `<div class="combat-arsenal-detail-body"><button type="button" class="combat-arsenal-back" data-action="back-to-arsenal">← Zur Übersicht</button><small>${escape(group)}</small><h3>${escape(label)}</h3>${renderWeaponCrest(weaponCategory, { withLabel: true })}<p class="combat-arsenal-weapon-requirements">${escape(weaponCategory?.title || '')}</p>
    <div class="combat-arsenal-detail-costs"><span>Reguläre Kosten</span>${renderActionCosts(actor, action)}</div>
    ${unavailableTechnique ? '<p class="combat-action-notice">Die Kampfwerte werden mit einer passenden Waffenführung aktualisiert.</p>' : action.formula || action.nonDamaging || action.kind === 'weapon' ? renderCombatValueStrip(preview) : ''}
    ${renderActionDetails(preview, { open: true })}
    ${action.compatible === false ? `<p class="combat-arsenal-blocked">${escape(action.disabledReason || 'Zurzeit nicht verfügbar')}</p>` : ''}
    </div><div class="combat-arsenal-detail-footer"><button type="button" data-action="choose-arsenal-action"${action.compatible === false ? ' disabled' : ''}>${action.compatible === false ? 'Derzeit nicht einsetzbar' : 'Handlung wählen →'}</button><small>Die Kosten reservierst du anschließend im Beitrag.</small></div>`;
}

export function renderArsenalResources(actor) {
  return (actor.resources || []).filter(resource => ['action', 'bonus-action', 'reaction', 'special-action'].includes(resource.id)).map(resource => {
    const icon = getCombatResourceIconPresentation(resource);
    return `<span title="${escape(resource.name)}" aria-label="${escape(resource.name)}: ${Number(resource.current) || 0} von ${Number(resource.maximum) || 0}"><span class="combat-mini-cost-icon" aria-hidden="true"><b>${escape(icon.fallback)}</b>${icon.source ? `<img src="${escape(icon.source)}" alt="" data-combat-picker-image>` : ''}</span> ${Number(resource.current) || 0}<small> / ${Number(resource.maximum) || 0}</small></span>`;
  }).join('');
}
