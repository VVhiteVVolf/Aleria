// Shared by sheets, level-up previews and server-side combat validation.
export const ACTION_POOL_CHOICE_LEVELS = Object.freeze([10, 15, 20]);
export const ACTION_POOL_IDS = Object.freeze(['action', 'bonus-action', 'reaction']);
export const ACTION_POOL_LABELS = Object.freeze({ action: 'Aktion', 'bonus-action': 'Bonusaktion', reaction: 'Reaktion' });
export const COMBAT_RESOURCE_RULES_VERSION = 2;

export function normalizeActionPoolChoices(value = [], level = 1) {
  const candidates = Array.isArray(value) ? value : [];
  const used = new Set();
  return ACTION_POOL_CHOICE_LEVELS.filter(milestone => milestone <= Number(level)).flatMap(milestone => {
    const choice = candidates.find(entry => Number(entry?.level) === milestone && ACTION_POOL_IDS.includes(entry?.resourceId) && !used.has(entry.resourceId));
    if (!choice) return [];
    used.add(choice.resourceId);
    return [{ level: milestone, resourceId: choice.resourceId }];
  });
}

export function fillActionPoolChoices(value = [], level = 1) {
  const choices = normalizeActionPoolChoices(value, level);
  const preferred = ['action', 'reaction', 'bonus-action'];
  for (const milestone of ACTION_POOL_CHOICE_LEVELS.filter(entry => entry <= Number(level))) {
    if (choices.some(entry => entry.level === milestone)) continue;
    const resourceId = preferred.find(id => !choices.some(entry => entry.resourceId === id));
    choices.push({ level: milestone, resourceId });
  }
  return choices.sort((a, b) => a.level - b.level);
}

export function getActionPoolChoiceGroups(choices = [], level = 1) {
  const normalized = normalizeActionPoolChoices(choices, level);
  return ACTION_POOL_CHOICE_LEVELS.filter(milestone => milestone <= Number(level)).map(milestone => ({
    level: milestone,
    selectedId: normalized.find(entry => entry.level === milestone)?.resourceId || '',
    options: ACTION_POOL_IDS.filter(id => !normalized.some(entry => entry.level !== milestone && entry.resourceId === id))
      .map(id => ({ id, name: ACTION_POOL_LABELS[id] }))
  }));
}

export function getSpecialActionMaximum(level = 1) {
  return 2 + [8, 10, 15, 20].filter(milestone => Number(level) >= milestone).length;
}

export function getCombatActionEconomy(level = 1, _specialLevels = 0, choices = []) {
  const result = { action: 1, 'bonus-action': 1, reaction: 1, 'special-action': getSpecialActionMaximum(level) };
  for (const choice of normalizeActionPoolChoices(choices, level)) result[choice.resourceId] = 2;
  return Object.freeze(result);
}
