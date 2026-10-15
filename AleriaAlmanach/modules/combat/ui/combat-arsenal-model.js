import { getActionCostPresentation } from './combat-action-choice.js?v=20261015-scenarios-v2';

export function actionDescription({ action, entry = {} }) {
  return String(entry.effect || entry.description || action.weapon?.notes || '');
}

export function matchesArsenalChoice(choice, { query = '', section = 'all', filter = 'all', onlyAvailable = false, favorites = new Set() } = {}, actor = {}) {
  const { action, group, groupKey, label, weaponCategory = {} } = choice;
  const search = query.trim().toLocaleLowerCase('de');
  // Search deliberately crosses section boundaries, including favorites.
  if (search) {
    if (!`${group} ${weaponCategory.label} ${weaponCategory.title} ${label} ${actionDescription(choice)}`.toLocaleLowerCase('de').includes(search)) return false;
  } else if (section === 'favorites' ? !favorites.has(action.id) : section !== 'all' && section !== groupKey && section !== `${groupKey}|weapon:${weaponCategory.id}`) return false;
  if (onlyAvailable && action.compatible === false) return false;
  if (filter === 'special') return getActionCostPresentation(actor, action).some(cost => cost.resource.id === 'special-action');
  const attacking = action.resolutionMode !== 'automatic' && (action.kind === 'weapon' || !!action.formula || action.effects?.some(effect => effect.type === 'damage'));
  if (filter === 'attack') return !!attacking;
  if (filter === 'support') return !attacking;
  return true;
}

export function getArsenalSectionCounts(choices, state = {}, actor = {}) {
  const counts = new Map([['all', 0], ['favorites', 0]]);
  const increment = key => counts.set(key, (counts.get(key) || 0) + 1);
  for (const choice of choices) {
    if (!matchesArsenalChoice(choice, { ...state, query: '', section: 'all' }, actor)) continue;
    increment('all');
    if (state.favorites?.has(choice.action.id)) increment('favorites');
    increment(choice.groupKey);
    increment(`${choice.groupKey}|weapon:${choice.weaponCategory.id}`);
  }
  return counts;
}

/** UI preference only: never written to a character or a combat record. */
export function arsenalFavorites(actor, storage) {
  const key = `aleria:arsenal-favorites:v1:${actor.actorType || 'character'}:${actor.characterId || actor.id || actor.name || ''}`;
  let ids = new Set();
  try {
    const saved = JSON.parse(storage?.getItem(key) || '[]');
    if (Array.isArray(saved)) ids = new Set(saved.filter(id => typeof id === 'string'));
  } catch { /* Storage may be unavailable; favorites still work for this dialog. */ }
  return { ids, save() { try { storage?.setItem(key, JSON.stringify([...ids])); } catch { /* Keep the local preference. */ } } };
}
