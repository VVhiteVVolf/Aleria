// Shared defaults also apply to new registry entries without a preset.
export const DEFAULT_BOARD_BACKGROUND = 'assets/images/boards/town-square-v1.png';
export const DEFAULT_BOARD_SIZE = Object.freeze({ w: 1254, h: 1254 });

export function compositionConfig(config = {}) {
  const source = config.boardComposition || {};
  return {
    enabled: source.enabled !== false,
    background: source.background || DEFAULT_BOARD_BACKGROUND,
    presetPath: source.presetPath || '',
  };
}
