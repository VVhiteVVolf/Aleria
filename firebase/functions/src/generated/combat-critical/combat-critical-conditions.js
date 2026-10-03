// W20-only condition construction. Stored W10 conditions are replayed verbatim.
export function extendCriticalCondition(condition, effect, { actor, target, affected, kind, roll }) {
  const sourceId = `critical-v2:${kind}:${roll}`;
  const next = { ...condition, sourceConditionId: sourceId, stanceGroup: sourceId,
    duration: 'Bis zum Ende des nächsten eigenen Beitrags',
    durationModel: { ...condition.durationModel, remainingActorComments: effect.duration || 1 } };
  if (effect.prone) next.tags = 'liegend';
  if (effect.periodicHitPointLoss) next.criticalPeriodicLoss = effect.periodicHitPointLoss;
  if (effect.temporaryHitPoints) next.criticalTemporaryHitPoints = effect.temporaryHitPoints;
  if (effect.blockPreparedCounter) next.blockPreparedCounter = true;
  if (!effect.once) return next;
  const incoming = effect.incoming || effect.save;
  const opponentId = affected.characterId === actor.characterId ? target.characterId : actor.characterId;
  const damage = Object.keys(effect.once).some(key => ['damageModifier', 'damageReduction', 'damageReductionBypass'].includes(key));
  const rule = {
    id: `${sourceId}:once`, name: effect.name, phase: effect.save ? 'pre-secondary-save' : damage ? 'pre-hit-damage' : 'pre-roll',
    recipient: effect.save ? 'target' : 'actor', sourceRelation: effect.save ? 'self' : incoming ? 'enemy' : 'self',
    activation: 'passive', frequency: 'comment', actionKinds: ['weapon', 'technique'],
    ...(!effect.save ? { weaponAttackOnly: true } : { saveAttributes: ['strength', 'dexterity'] }),
    ...(effect.opponent ? { requiredActorId: incoming ? opponentId : affected.characterId,
      requiredTargetId: incoming ? affected.characterId : opponentId } : {}),
    condition: damage ? 'would-hit' : 'always', effects: effect.once,
    resultEffects: [{ id: `${sourceId}:consume`, type: 'remove-condition', target: incoming ? 'target' : 'self',
      conditionId: sourceId, on: 'always' }]
  };
  next.triggerRules = [rule];
  // Martial actions resolved directly by a saving throw use the same charge.
  if (effect.save) next.triggerRules.push({ ...rule, phase: 'pre-roll' });
  return next;
}
