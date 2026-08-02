import { DiceFallbackEngine } from './dice-fallback-engine.js';
import { DiceHistoryRepository } from './dice-history.js?v=20260802-dice-audio-v2';
import { DiceParserAdapter } from './dice-parser-adapter.js';
import { DiceAudioFeedback } from './dice-audio.js';
import { getDiceAppearances } from './dice-appearance.js';
import { SceneDicePool } from './dice-pool.js';
import { validateDiceNotation } from './dice-validation.js';

function normalizeRollContext(context = {}) {
  return {
    roller: String(context.roller || '').trim().slice(0, 80),
    purpose: String(context.purpose || '').trim().slice(0, 140),
    rollType: ['general', 'attack', 'death-save'].includes(context.rollType) ? context.rollType : 'general'
  };
}

function applyRollContext(result, context) {
  const normalized = normalizeRollContext(context);
  Object.assign(result, normalized);
  if (normalized.rollType === 'attack' && result.natural === 20) result.special = 'Natürliche 20 · Kritischer Treffer';
  if (normalized.rollType === 'attack' && result.natural === 1) result.special = 'Natürliche 1 · Angriff verfehlt automatisch';
  if (normalized.rollType === 'death-save' && result.natural === 20) result.special = 'Natürliche 20 · 1 Trefferpunkt zurückerlangt';
  if (normalized.rollType === 'death-save' && result.natural === 1) result.special = 'Natürliche 1 · Zwei Fehlschläge';
  return result;
}

class SceneDiceService {
  constructor() {
    this.history = new DiceHistoryRepository();
    this.parser = new DiceParserAdapter();
    this.pool = new SceneDicePool();
    this.audio = new DiceAudioFeedback();
    this.fallbackEngine = new DiceFallbackEngine();
    this.engine = null;
    this.enginePromise = null;
    this.engineError = null;
    this.busy = false;
    this.container = null;
    this.engineContainer = null;
    const storedSettings = this.history.getSettings();
    this.settings = {
      ...storedSettings,
      reducedMotion: storedSettings.reducedMotion || globalThis.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
    };
    this.audio.configure(this.settings);
  }

  validate(notation) {
    return validateDiceNotation(notation);
  }

  async prepare(container) {
    if (container && this.engine && this.engineContainer && container !== this.engineContainer) {
      this.engine.clear();
      this.engine = null;
      this.enginePromise = null;
      container.replaceChildren();
    }
    if (container) this.container = container;
    if (!this.settings.animationEnabled || this.engineError) return this.fallbackEngine;
    if (this.engine) return this.engine;
    if (!this.container) throw new Error('Der 3D-Würfelbereich wurde nicht gefunden.');
    if (!this.enginePromise) {
      this.enginePromise = import('./dice-engine.js?v=20260802-dice-audio-v1')
        .then(module => module.createDiceBoxEngine(this.container, this.settings, {
          onDieComplete: die => this.audio.playLanding(die)
        }))
        .then(engine => {
          this.engine = engine;
          this.engineContainer = this.container;
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

  async roll(notation, container = this.container, context = {}) {
    if (this.busy) throw new Error('Ein Wurf läuft bereits.');
    this.busy = true;
    try {
      this.validate(notation);
      this.audio.startRoll(notation, this.settings);
      const engine = this.settings.animationEnabled
        ? await this.prepare(container)
        : this.fallbackEngine;
      const result = applyRollContext(await this.parser.execute(notation, engine), context);
      result.visualMode = engine.isFallback ? 'text' : '3d';
      if (engine.isFallback) result.animationWarning = this.engineError
        ? 'Die 3D-Animation ist ausgefallen; der Wurf wurde sicher im Textmodus ausgeführt.'
        : 'Die Animation ist deaktiviert; der Wurf wurde im Textmodus ausgeführt.';
      const historyEntry = this.history.add(result);
      result.id = historyEntry.id;
      this.audio.finishRoll(result, { textMode: engine.isFallback });
      return result;
    } catch (error) {
      this.audio.cancelRoll();
      throw error;
    } finally {
      this.busy = false;
    }
  }

  clear() {
    this.audio.cancelRoll();
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

  getDiceTypes() {
    return getDiceAppearances();
  }

  getPool() {
    return this.pool.list();
  }

  addPoolDie(sides) {
    return this.pool.add(sides);
  }

  removePoolDie(sides) {
    return this.pool.remove(sides);
  }

  resetPool() {
    return this.pool.reset();
  }

  clearPool() {
    return this.pool.clear();
  }

  buildPoolNotation(options = {}) {
    return this.pool.toNotation(options);
  }

  async updateSettings(patch = {}) {
    this.settings = this.history.setSettings(patch);
    this.audio.configure(this.settings);
    if (this.engine) await this.engine.updateSettings(this.settings);
    return this.getSettings();
  }

  getEngineState() {
    return {
      busy: this.busy,
      mode: this.engine && !this.engine.isFallback ? '3d' : 'text',
      failed: !!this.engineError,
      audio: this.audio.getState(),
      message: this.engineError ? '3D-Animation nicht verfügbar; sicherer Textmodus aktiv.' : ''
    };
  }
}

export const sceneDiceService = new SceneDiceService();
