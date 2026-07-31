import { DiceFallbackEngine } from './dice-fallback-engine.js';
import { DiceHistoryRepository } from './dice-history.js';
import { DiceParserAdapter } from './dice-parser-adapter.js';
import { validateDiceNotation } from './dice-validation.js';

class SceneDiceService {
  constructor() {
    this.history = new DiceHistoryRepository();
    this.parser = new DiceParserAdapter();
    this.fallbackEngine = new DiceFallbackEngine();
    this.engine = null;
    this.enginePromise = null;
    this.engineError = null;
    this.busy = false;
    this.container = null;
    const storedSettings = this.history.getSettings();
    this.settings = {
      ...storedSettings,
      reducedMotion: storedSettings.reducedMotion || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    };
  }

  validate(notation) {
    return validateDiceNotation(notation);
  }

  async prepare(container) {
    if (container) this.container = container;
    if (!this.settings.animationEnabled || this.engineError) return this.fallbackEngine;
    if (this.engine) return this.engine;
    if (!this.container) throw new Error('Der 3D-Würfelbereich wurde nicht gefunden.');
    if (!this.enginePromise) {
      this.enginePromise = import('./dice-engine.js')
        .then(module => module.createDiceBoxEngine(this.container, this.settings))
        .then(engine => {
          this.engine = engine;
          return engine;
        })
        .catch(error => {
          this.engineError = error;
          console.warn('3D-Würfel konnten nicht initialisiert werden. Textmodus wird verwendet.', error);
          return this.fallbackEngine;
        });
    }
    return this.enginePromise;
  }

  async roll(notation, container = this.container) {
    if (this.busy) throw new Error('Ein Wurf läuft bereits.');
    this.busy = true;
    try {
      this.validate(notation);
      const engine = this.settings.animationEnabled
        ? await this.prepare(container)
        : this.fallbackEngine;
      const result = await this.parser.execute(notation, engine);
      result.visualMode = engine.isFallback ? 'text' : '3d';
      if (engine.isFallback) result.animationWarning = this.engineError
        ? 'Die 3D-Animation ist ausgefallen; der Wurf wurde sicher im Textmodus ausgeführt.'
        : 'Die Animation ist deaktiviert; der Wurf wurde im Textmodus ausgeführt.';
      const historyEntry = this.history.add(result);
      result.id = historyEntry.id;
      if (this.settings.soundEnabled) this.#playResultSound(result);
      return result;
    } finally {
      this.busy = false;
    }
  }

  clear() {
    this.engine?.clear();
    this.fallbackEngine.clear();
  }

  getHistory() {
    return this.history.list();
  }

  removeHistoryEntry(id) {
    return this.history.remove(id);
  }

  clearHistory() {
    return this.history.clear();
  }

  getSettings() {
    return { ...this.settings };
  }

  async updateSettings(patch = {}) {
    this.settings = this.history.setSettings(patch);
    if (this.engine) await this.engine.updateSettings(this.settings);
    return this.getSettings();
  }

  getEngineState() {
    return {
      busy: this.busy,
      mode: this.engine && !this.engine.isFallback ? '3d' : 'text',
      failed: !!this.engineError,
      message: this.engineError ? '3D-Animation nicht verfügbar; sicherer Textmodus aktiv.' : ''
    };
  }

  #playResultSound(result) {
    try {
      const AudioContextClass = globalThis.AudioContext || globalThis.webkitAudioContext;
      if (!AudioContextClass) return;
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'triangle';
      oscillator.frequency.value = result.critical === 'success' ? 660 : result.critical === 'failure' ? 150 : 260;
      gain.gain.setValueAtTime(0.0001, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.08, context.currentTime + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.18);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.2);
      oscillator.addEventListener('ended', () => context.close(), { once: true });
    } catch (error) {
      console.warn('Würfelton konnte nicht abgespielt werden.', error);
    }
  }
}

export const sceneDiceService = new SceneDiceService();
