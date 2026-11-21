import { getCommentActorIds } from '../../combat/combat-condition-duration.js';

// One window per owner, including attacks suffered between their own posts.
// The window is derived from the same chronological comments used for combat
// state replay. Rolling back a contribution also rolls back its passive uses.
export function withClassPassivePeriods(periods, history = [], draft = {}) {
  const actorComments = new Map();
  history.forEach((comment, index) => {
    if (comment.importedHistoricalMechanics || comment.combatEncounter || comment.combatStatus || comment.combatRulesRelease
      || comment.sceneRest || comment.sceneRegeneration || comment.sceneElementSignal || comment.sceneElementInteraction
      || comment.sceneElementDetection || (comment.herausforderung?.elementType && comment.herausforderung.elementType !== 'challenge')) return;
    for (const actorId of getCommentActorIds(comment)) {
      actorComments.set(actorId, String(comment.id || comment.commentId || `legacy-${index}`));
    }
  });
  for (const actorId of getCommentActorIds(draft)) actorComments.set(actorId, String(periods.comment || 'draft'));
  return { ...periods, actorComments };
}

export function classPassivePeriod(periods, sourceId, acting = false) {
  return periods.actorComments?.get(sourceId) || (acting ? periods.comment : '') || `entry:${periods.scene || ''}`;
}
