import { escapeCombatMarkup as escape } from './combat-status-view.js';

// The same resolved actions used by the composer provide compatibility and costs.
export function renderPersonalTechniquesSummary(profile) {
  const personal = new Map((profile.techniques || []).filter(t => /^Persönliche Techniken(?:\s|$| ·)/.test(t.trainingForm || '')).map(t => [t.id, t]));
  const actions = (profile.actions || []).filter(a => a.kind === 'technique' && personal.has(a.sourceId));
  if (!actions.length) return '';
  return `<details data-profile-details-key="personal-techniques"><summary>Persönliche Techniken (${actions.length})</summary><ul class="comment-combat-conditions">${actions.map(action => {
    const affordable = (action.costs || []).every(cost => Number(profile.resources?.find(r => r.id === cost.resourceId)?.current || 0) >= cost.amount);
    const available = action.compatible !== false && !profile.weaponUnavailable && profile.currentHitPoints > 0 && affordable;
    const status = action.compatible === false ? action.disabledReason || 'Voraussetzungen nicht erfüllt' : !available ? 'Derzeit nicht verfügbar' : 'Verfügbar';
    const costs = (action.costs || []).map(c => `${c.amount > 1 ? c.amount + '× ' : ''}${c.name || c.resourceId}`).join(' + ');
    const entry = personal.get(action.sourceId);
    return `<li class="comment-combat-condition"><div><strong>${escape(action.name)}</strong><small>${escape(costs)} · ${escape(status)}</small><small>${escape(entry.description || entry.effect)}</small></div></li>`;
  }).join('')}</ul></details>`;
}
