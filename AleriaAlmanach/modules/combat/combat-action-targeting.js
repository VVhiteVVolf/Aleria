// Structured effects own targeting for abilities, techniques, spells and creatures.
// A self component on an otherwise targeted action must not hide its other targets.
export function isSelfTargetAction(action = {}) {
  if (action?.kind === 'equipment-switch') return true;
  const effects = Array.isArray(action?.effects) ? action.effects : [];
  return effects.length > 0 && effects.every(effect => effect.target === 'self');
}

export function actionAllowsSelfTarget(action = {}) {
  if (isSelfTargetAction(action)) return true;
  const effects = Array.isArray(action?.effects) ? action.effects : [];
  return effects.length > 0 && !effects.some(effect => effect.target !== 'self' && ['damage', 'debuff'].includes(effect.type));
}

export function getCombatTargetSelection(action, actorId, selectedIds = []) {
  const ownId = String(actorId || '');
  if (isSelfTargetAction(action)) return ownId ? [ownId] : [];
  return [...new Set(selectedIds.map(id => String(id || '')).filter(Boolean))]
    .filter(id => id !== ownId || actionAllowsSelfTarget(action));
}
