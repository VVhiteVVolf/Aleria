// Classification only: trust and replay authority are checked separately.
function segmentsOf(comment) {
  return Array.isArray(comment?.commentSegments) ? comment.commentSegments : [];
}

export function containsPersistentMechanics(comment = {}) {
  return !!(
    comment.combatResolution
    || comment.combatResolutions
    || comment.combatTransaction
    || comment.inventoryTransaction
    || comment.restTransaction
    || comment.sceneRest
    || comment.sceneRegeneration
    || comment.combatEncounter
    || comment.combatStatus
    || comment.encounterTransaction
    || comment.sceneInventoryTransfer
    || comment.sceneTrade
    || comment.lootClaim
    || comment.skillResolution
    || comment.serverValidatedMechanics
    || segmentsOf(comment).some(segment => segment?.combatResolution || segment?.combatResolutions || segment?.inventoryUse || segment?.skillResolution || segment?.sceneTrade)
  );
}

export function containsImmutableAuditMechanics(comment = {}) {
  return !!(
    comment.sceneDiceRoll
    || comment.sceneTimeEvent
    || comment.skillChallenge
    || segmentsOf(comment).some(segment => segment?.skillResolution || segment?.skillChallenge)
  );
}

export function hasMechanicalCommentPayload(comment = {}) {
  return comment.mechanicalAudit === true
    || containsPersistentMechanics(comment)
    || containsImmutableAuditMechanics(comment);
}
