// Immutable comment transaction policy.
// Mechanical scene records are an append-only ledger: UI and persistence
// adapters must use this single classifier before updating or deleting them.
(function initCommentTransactionPolicy(global) {
  const TRANSACTION_LABELS = Object.freeze({
    combat: 'Kampfauswertung',
    inventory: 'Inventarvorgang',
    rest: 'Rast',
    skill: 'Fertigkeitsauswertung',
    dice: 'Szenenwurf',
    time: 'Szenenzeit'
  });

  function isObject(value) {
    return !!value && typeof value === 'object';
  }

  function hasResolutionId(value, key) {
    return isObject(value) && !!String(value[key] || '').trim();
  }

  function getSegments(comment = {}) {
    return Array.isArray(comment?.commentSegments) ? comment.commentSegments : [];
  }

  function getCommentTransactionKinds(comment = {}) {
    const kinds = new Set();
    const segments = getSegments(comment);
    if (
      isObject(comment.combatTransaction)
      || hasResolutionId(comment.combatResolution, 'resolutionId')
      || segments.some(segment => hasResolutionId(segment?.combatResolution, 'resolutionId'))
      || segments.some(segment => (Array.isArray(segment?.combatResolutions) ? segment.combatResolutions : [])
        .some(resolution => hasResolutionId(resolution, 'resolutionId')))
    ) kinds.add('combat');
    if (
      isObject(comment.inventoryTransaction)
      || isObject(comment.sceneInventoryTransfer)
      || String(comment.commentMode || '') === 'scene-inventory-transfer'
      || segments.some(segment => hasResolutionId(segment?.inventoryUse, 'usageId'))
    ) kinds.add('inventory');
    if (
      isObject(comment.restTransaction)
      || isObject(comment.sceneRest)
      || String(comment.commentMode || '') === 'scene-rest'
      || String(comment.commentKind || '') === 'scene-rest-event'
    ) kinds.add('rest');
    if (segments.some(segment => (
      hasResolutionId(segment?.skillResolution, 'resolutionId')
      || hasResolutionId(segment?.skillChallenge, 'id')
    ))) kinds.add('skill');
    if (isObject(comment.sceneDiceRoll)) kinds.add('dice');
    if (
      isObject(comment.sceneTimeEvent)
      || String(comment.commentMode || '') === 'scene-time'
      || String(comment.commentKind || '') === 'scene-time-event'
    ) kinds.add('time');
    return [...kinds];
  }

  function isImmutableMechanicalComment(comment = {}) {
    return getCommentTransactionKinds(comment).length > 0;
  }

  function getMechanicalCommentLabel(comment = {}) {
    const labels = getCommentTransactionKinds(comment)
      .map(kind => TRANSACTION_LABELS[kind])
      .filter(Boolean);
    return labels.join(', ') || 'Mechanischer Beitrag';
  }

  function getMechanicalCommentLockMessage(comment = {}, operation = 'geändert') {
    const label = getMechanicalCommentLabel(comment);
    return `${label} hat den Szenenzustand festgeschrieben und kann deshalb nicht direkt ${operation} werden. Verwende künftig eine nachvollziehbare Gegenbuchung.`;
  }

  function assertMechanicalCommentMutable(comment = {}, operation = 'geändert') {
    if (!isImmutableMechanicalComment(comment)) return comment;
    const error = new Error(getMechanicalCommentLockMessage(comment, operation));
    error.code = 'immutable-mechanical-comment';
    error.transactionKinds = getCommentTransactionKinds(comment);
    throw error;
  }

  global.AleriaCommentTransactions = Object.freeze({
    getKinds: getCommentTransactionKinds,
    isImmutable: isImmutableMechanicalComment,
    getLabel: getMechanicalCommentLabel,
    getLockMessage: getMechanicalCommentLockMessage,
    assertMutable: assertMechanicalCommentMutable
  });
}(typeof window !== 'undefined' ? window : globalThis));
