// Comment transaction policy.
// State-changing mechanical scene records are an append-only ledger. Pure
// timeline markers remain classified, but may be removed without undoing a
// character, inventory or combat state.
(function initCommentTransactionPolicy(global) {
  const TRANSACTION_LABELS = Object.freeze({
    combat: 'Kampfauswertung',
    inventory: 'Inventarvorgang',
    rest: 'Rast',
    skill: 'Fertigkeitsauswertung',
    dice: 'Szenenwurf',
    time: 'Szenenzeit'
  });
  const MUTABLE_TRANSACTION_KINDS = new Set(['time']);

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
    return getCommentTransactionKinds(comment).some(kind => !MUTABLE_TRANSACTION_KINDS.has(kind));
  }

  function getMechanicalCommentLabel(comment = {}, options = {}) {
    const exclude = new Set(options.exclude || []);
    const kinds = getCommentTransactionKinds(comment);
    const labels = kinds
      .filter(kind => !exclude.has(kind))
      .map(kind => TRANSACTION_LABELS[kind])
      .filter(Boolean);
    if (labels.length) return labels.join(', ');
    return kinds.length ? '' : 'Mechanischer Beitrag';
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
