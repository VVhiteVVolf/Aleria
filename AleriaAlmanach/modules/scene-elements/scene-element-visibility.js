// Keep activity previews independent of character/combat catalogues.
export function isSceneElementSignal(comment = {}) { return !!comment.sceneElementSignal; }
export function isPublicSceneElementComment(comment = {}) {
  const signal = comment.sceneElementSignal;
  return !signal || (comment.serverValidatedMechanics === true && signal.visible === true && signal.state === 'armed' && signal.elementType === 'item');
}
