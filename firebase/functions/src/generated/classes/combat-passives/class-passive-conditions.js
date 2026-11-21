export const CLASS_PASSIVE_POSITION_RULE = 'class-passive-position';

export function activeCondition(profile, id) {
  const conditions = id.startsWith('cp-') ? profile?.temporaryConditions || []
    : [...(profile?.temporaryConditions || []), ...(profile?.conditions || [])];
  return conditions.find(condition =>
    condition.active !== false && (condition.sourceConditionId === id || condition.id === id || condition.presetId === id));
}

export function trainingCondition(id, name, target, data = {}, lifetime = 'next-end') {
  return {
    id, type: 'apply-condition', target, on: 'always',
    condition: { id, name, ...data, durationModel: {
      kind: 'actor-comments', remainingActorComments: 1,
      ...(lifetime === 'next-start' ? { expiresAt: 'actor-start' } : {})
    } }
  };
}

export function removeTrainingCondition(condition, target = 'self') {
  return { id: `use-${condition.id}`, type: 'remove-condition', target, conditionId: condition.id, on: 'always' };
}

export function actionProvidesGuard(action, hit) {
  return (action?.effects || []).some(effect => effect.target === 'self'
    && (effect.on === 'always' || (hit && effect.on !== 'miss'))
    && (Number(effect.condition?.mechanics?.armorClass) > 0
      || Number(effect.condition?.damageGuard?.reduction) > 0
      || effect.condition?.stanceGroup === 'martial-position-guard'));
}

export function actionPreparesAttack(action) {
  return (action?.effects || []).some(effect => effect.target === 'self' && Number(effect.condition?.mechanics?.attack) > 0);
}

export function positionPenalty(profile) {
  return Boolean(activeCondition(profile, 'martial-position-penalty'));
}
