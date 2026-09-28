import { escapeActionHtml as escape, renderActionCosts } from './combat-action-choice.js';
import { renderActionDetails, renderCombatValueStrip } from './combat-action-card.js?v=20260928-equipment-art-v2';
import { actionDescription } from './combat-arsenal-model.js';
import { getCombatResourceIconPresentation } from '../combat-resource-icons.js?v=20260803-composer-design-v1';

export function renderArsenalCard(actor, choice, selectedId) {
  const { action, label, group, groupKey, minimumLevel } = choice;
  return `<article class="combat-arsenal-card" data-arsenal-card="${escape(action.id)}" data-group-key="${escape(groupKey)}"${action.compatible === false ? ' data-unavailable' : ''}>
    <button type="button" class="combat-arsenal-inspect" data-combat-action-option="${escape(action.id)}" aria-pressed="${action.id === selectedId}">
      <small class="combat-arsenal-card-group">${escape(group)}</small><strong>${escape(label)}</strong>
      <span class="combat-arsenal-description">${escape(actionDescription(choice) || 'Wirkung und Voraussetzungen in der Detailansicht.')}</span>
      <span class="combat-arsenal-card-bottom"><small>${minimumLevel ? `Stufe ${minimumLevel}` : 'Grundhandlung'}${action.compatible === false ? ' · Gesperrt' : ''}</small>${renderActionCosts(actor, action)}</span>
    </button>
    <button type="button" class="combat-arsenal-favorite" data-arsenal-favorite="${escape(action.id)}" aria-pressed="false" aria-label="${escape(label)} als Favorit merken" title="Favorit merken">☆</button>
  </article>`;
}

export function renderArsenalDetail(actor, choice) {
  if (!choice) return '<div class="combat-arsenal-detail-empty"><span aria-hidden="true">◇</span><h3>Deine nächste Handlung</h3><p>Wähle eine Karte, um Wirkung, Kosten und Voraussetzungen anzusehen.</p></div>';
  const { action, label, group } = choice;
  const preview = { ...actor, selectedAction: action, weapon: action.weapon || actor.weapon, actionResolutionMode: action.resolutionMode, attackModifier: action.attackModifier ?? actor.attackModifier, damageModifier: action.damageModifier ?? actor.damageModifier };
  return `<div class="combat-arsenal-detail-body"><button type="button" class="combat-arsenal-back" data-action="back-to-arsenal">← Zur Übersicht</button><small>${escape(group)}</small><h3>${escape(label)}</h3>
    <div class="combat-arsenal-detail-costs"><span>Reguläre Kosten</span>${renderActionCosts(actor, action)}</div>
    ${action.formula || action.kind === 'weapon' ? renderCombatValueStrip(preview) : ''}
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
