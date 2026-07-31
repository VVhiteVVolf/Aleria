// Compatibility-facing constants for scene comments and the classic-script UI.
const SCENE_DICE_EVENT_KIND = 'scene-dice-event';
const SCENE_DICE_ALLOWED_SIDES = new Set([4, 6, 8, 10, 12, 20, 100]);
const SCENE_DICE_ICONS = {
  4: '../IconOrdner/Würfel/D4_Physical.png',
  6: '../IconOrdner/Würfel/+1d6_Physical.png',
  8: '../IconOrdner/Würfel/+1d8_Physical.png',
  10: '../IconOrdner/Würfel/D10_Physical.png',
  12: '../IconOrdner/Würfel/D12_Physical.png',
  20: '../IconOrdner/Würfel/D20.png',
  100: '../IconOrdner/Würfel/D10_Physical.png'
};

function getSceneDiceIcon(sides) {
  return SCENE_DICE_ICONS[Number(sides)] || SCENE_DICE_ICONS[20];
}

function isSceneDiceEventComment(comment = {}) {
  return !!(comment.sceneDiceRoll || comment.commentKind === SCENE_DICE_EVENT_KIND || comment.commentMode === 'scene-dice');
}
