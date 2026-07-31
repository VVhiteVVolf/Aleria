import DiceBox from '@3d-dice/dice-box';

function getAssetLocation() {
  const baseUrl = `${import.meta.env.BASE_URL}assets/dice-box/`;
  const url = new URL(baseUrl, window.location.href);
  return { assetPath: url.pathname, origin: url.origin };
}

export class DiceBoxEngine {
  constructor(container, settings = {}) {
    if (!container?.id) throw new Error('Der 3D-Würfelbereich wurde nicht gefunden.');
    const assetLocation = getAssetLocation();
    const reducedMotion = settings.reducedMotion === true;
    this.box = new DiceBox({
      container: `#${container.id}`,
      ...assetLocation,
      theme: 'default',
      themeColor: '#8b6914',
      scale: reducedMotion ? 4.6 : 5.5,
      delay: reducedMotion ? 0 : 90,
      spinForce: reducedMotion ? 2 : 5,
      throwForce: reducedMotion ? 3 : 6,
      settleTimeout: reducedMotion ? 2200 : 5000,
      enableShadows: !reducedMotion,
      offscreen: typeof OffscreenCanvas !== 'undefined'
    });
    this.isFallback = false;
  }

  async init() {
    await this.box.init();
    return this;
  }

  async roll(notations) {
    await this.box.roll(notations);
    return this.getRollResults();
  }

  async add(notations) {
    await this.box.add(notations);
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
      spinForce: reducedMotion ? 2 : 5,
      throwForce: reducedMotion ? 3 : 6,
      settleTimeout: reducedMotion ? 2200 : 5000,
      enableShadows: !reducedMotion
    });
  }
}

export async function createDiceBoxEngine(container, settings) {
  const engine = new DiceBoxEngine(container, settings);
  return engine.init();
}
