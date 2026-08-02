import DiceBox from '../../vendor/scene-dice/dice-box.esm.js';
import { applyDiceAppearance } from './dice-appearance.js';
import { getDiceMotionConfig } from './dice-motion.js';

function getAssetLocation() {
  const url = new URL('./public/assets/dice-box/', document.baseURI);
  return { assetPath: url.pathname, origin: url.origin };
}

export class DiceBoxEngine {
  constructor(container, settings = {}, callbacks = {}) {
    if (!container?.id) throw new Error('Der 3D-Würfelbereich wurde nicht gefunden.');
    const assetLocation = getAssetLocation();
    const reducedMotion = settings.reducedMotion === true;
    const motion = getDiceMotionConfig(settings);
    this.box = new DiceBox({
      container: `#${container.id}`,
      ...assetLocation,
      theme: 'default',
      themeColor: '#8b6914',
      scale: reducedMotion ? 4.5 : 5.2,
      delay: reducedMotion ? 0 : 90,
      ...motion,
      enableShadows: !reducedMotion,
      boundarySegments: 32,
      boundaryInsetX: 0.77,
      boundaryInsetY: 0.79,
      boundaryThickness: 0.68,
      offscreen: typeof OffscreenCanvas !== 'undefined',
      onDieComplete: die => callbacks.onDieComplete?.(die)
    });
    this.isFallback = false;
  }

  async init() {
    await this.box.init();
    return this;
  }

  async roll(notations) {
    await this.box.roll(applyDiceAppearance(notations));
    return this.getRollResults();
  }

  async add(notations) {
    await this.box.add(applyDiceAppearance(notations));
    return this.getRollResults();
  }

  getRollResults() {
    return this.box.getRollResults();
  }

  clear() {
    this.box.clear();
  }

  async updateSettings(settings = {}) {
    const reducedMotion = settings.reducedMotion === true;
    await this.box.updateConfig({
      delay: reducedMotion ? 0 : 90,
      ...getDiceMotionConfig(settings),
      enableShadows: !reducedMotion
    });
  }
}

export async function createDiceBoxEngine(container, settings, callbacks = {}) {
  const engine = new DiceBoxEngine(container, settings, callbacks);
  return engine.init();
}
