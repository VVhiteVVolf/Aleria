import { escapeCombatMarkup as escape } from './combat-status-view.js';
import { getActionCostPresentation } from '../combat/ui/combat-action-choice.js';
import { withCombatActionWeaponAvailability } from '../combat/combat-weapon-availability.js';
import { getCombatActionAvailability } from '../combat/ui/combat-action-availability.js';

// The same resolved actions used by the composer provide compatibility and costs.
export function renderCombatArsenalSummary(profile, { personalOnly = false } = {}) {
  const personal = new Map((profile.techniques || []).filter(t => /^Persönliche Techniken(?:\s|$| ·)/.test(t.trainingForm || '')).map(t => [t.id, t]));
  const actions = (profile.actions || []).filter(a => a.kind === 'technique' && personal.has(a.sourceId));
  const otherActions = personalOnly ? [] : (profile.actions || []).filter(action => !actions.includes(action) && action.kind !== 'equipment-switch');
  const entries = new Map([['weapon', profile.weapons], ['technique', profile.techniques], ['ability', profile.abilities], ['spell', profile.magic?.spells]]
    .flatMap(([kind, values]) => (values || []).map(entry => [`${kind}:${entry.id}`, entry])));
  const list = choices => `<ul class="comment-combat-conditions">${choices.map(stored => {
    const action = withCombatActionWeaponAvailability(profile, stored);
    const price = getActionCostPresentation(profile, action);
    const sourceKind = String(action.id).startsWith('ability:') ? 'ability' : ['spell', 'song', 'prayer'].includes(action.kind) ? 'spell' : action.kind;
    const entry = entries.get(`${sourceKind}:${action.sourceId}`) || action;
    const status = getCombatActionAvailability(profile, action).reason;
    const costs = price.map(cost => `${cost.amount > 1 ? cost.amount + '× ' : ''}${cost.resource.name || cost.resource.id}`).join(' + ') || 'Kostenlos';
    return `<li class="comment-combat-condition"><div><strong>${escape(action.name)}</strong><small>${escape(costs)} · ${escape(status)}${sourceKind === 'ability' && entry.usesMaximum > 0 ? ` · Nutzungen ${Number(entry.usesCurrent) || 0}/${entry.usesMaximum}` : ''}</small><small>${escape(entry.description || entry.effect || entry.notes || '')}</small>${entry.requirements ? `<small>${escape(entry.requirements)}</small>` : ''}${action.requiresVoice || entry.requiresVoice ? '<small>Eigene Stimme erforderlich</small>' : ''}</div></li>`;
  }).join('')}</ul>`;
  return `${actions.length ? `<details data-profile-details-key="personal-techniques"><summary>Persönliche Techniken (${actions.length})</summary>${list(actions)}</details>` : ''}${otherActions.length ? `<details data-profile-details-key="arsenal"><summary>Weiteres Arsenal (${otherActions.length})</summary>${list(otherActions)}</details>` : ''}`;
}
