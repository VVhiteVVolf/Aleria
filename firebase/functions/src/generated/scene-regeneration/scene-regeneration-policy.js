// Shared presentation policy for classic scripts and generated server modules.
(function initSceneRegenerationPolicy(global) {
  function isComment(comment = {}) {
    return comment?.serverValidatedMechanics === true
      && comment?.importedHistoricalMechanics !== true
      && comment?.commentKind === 'scene-regeneration-event'
      && Array.isArray(comment?.sceneRegeneration?.participants);
  }

  function filterVisible(comments = []) {
    return (Array.isArray(comments) ? comments : []).filter(comment => !isComment(comment));
  }

  global.AleriaSceneRegenerationPolicy = Object.freeze({ isComment, filterVisible });
}(globalThis));
