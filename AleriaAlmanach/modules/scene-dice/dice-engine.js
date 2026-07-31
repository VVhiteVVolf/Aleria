import DiceBox from '../../vendor/scene-dice/dice-box.esm.js';
import { applyDiceAppearance } from './dice-appearance.js';

function getAssetLocation() {
  const url = new URL('./public/assets/dice-box/', document.baseURI);
  return { assetPath: url.pathname, origin: url.origin };
}

export class DiceBoxEngine {
  constructor(container, settings = {}) {
    if (!container?.id) throw new Error('Der 3D-Würfelbereich wurde nicht gefunden.');
    const assetLocation = getAssetLocation();
    const reducedMotion = settings.reducedMotion === true;
    const motion = this.#getMotionConfig(settings);
    this.box = new DiceBox({
      container: `#${container.id}`,
      ...assetLocation,
      theme: 'default',
      themeColor: '#8b6914',
      scale: reducedMotion ? 4.5 : 5.2,
      delay: reducedMotion ? 0 : 90,
      ...motion,
      settleTimeout: reducedMotion ? 2200 : 5000,
      enableShadows: !reducedMotion,
      boundarySegments: 32,
      boundaryInsetX: 0.77,
      boundaryInsetY: 0.79,
      boundaryThickness: 0.68,
      offscreen: typeof OffscreenCanvas !== 'undefined'
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
      ...this.#getMotionConfig(settings),
      settleTimeout: reducedMotion ? 2200 : 5000,
      enableShadows: !reducedMotion
    });
  }

  #getMotionConfig(settings = {}) {
    if (settings.reducedMotion === true) return { spinForce: 1.8, throwForce: 2.8, startingHeight: 5 };
    if (settings.throwStyle === 'gentle') return { spinForce: 3.5, throwForce: 4.2, startingHeight: 6 };
    if (settings.throwStyle === 'dramatic') return { spinForce: 7.5, throwForce: 8.5, startingHeight: 11 };
    return { spinForce: 5, throwForce: 6, startingHeight: 8 };
  }
}

export async function createDiceBoxEngine(container, settings) {
  const engine = new DiceBoxEngine(container, settings);
  return engine.init();
}
