import { rollCombatSecondarySave } from './combat-secondary-saving-throw.js';

// Secondary saves can follow the primary hit or a complete attack sequence.
// Conditions bind to the actual participants, never to a character name.
export async function resolveTechniqueSecondarySave(context) {
  const { dice, actor, target, attack, timing } = context;
  const save = actor.selectedAction?.secondarySave;
  if (!save?.enabled || (save.timing || 'after-hit') !== timing
    || (save.requiresHit !== false && !attack.hit)) return { applications: [] };
  if (typeof dice.rollSavingThrow !== 'function') throw new Error('Der Rettungswurf der Technik fehlt.');
  const { applications, save: receipt } = await rollCombatSecondarySave(context, save);
  const succeeded = receipt.succeeded;
  const condition = (template, bindTarget = false) => !succeeded && template?.name ? {
    ...template, id: `${template.id}-${globalThis.crypto.randomUUID()}`, sourceConditionId: template.id,
    sourceActorId: actor.characterId, source: actor.selectedAction.name, active: true,
    durationModel: template.durationModel || { kind: 'actor-comments', remainingActorComments: 1 }, remainingActorComments: 1,
    ...(bindTarget ? { triggerRules: (template.triggerRules || []).map(rule => ({ ...rule, requiredTargetId: target.characterId })) } : {})
  } : null;
  return { applications, save: { ...receipt,
    ...(timing === 'after-sequence' ? { timing } : {}) },
    targetCondition: condition(save.failureCondition), actorCondition: condition(save.actorFailureCondition, true) };
}
