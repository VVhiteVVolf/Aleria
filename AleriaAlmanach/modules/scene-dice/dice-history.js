import { clampDiceSoundVolume, DEFAULT_DICE_SOUND_VOLUME } from './dice-audio.js';

export const DICE_HISTORY_KEY = 'aleria.dice.history.v1';
export const DICE_SETTINGS_KEY = 'aleria.dice.settings.v1';
export const DICE_HISTORY_LIMIT = 30;

const DEFAULT_SETTINGS = Object.freeze({
  animationEnabled: true,
  soundEnabled: true,
  soundVolume: DEFAULT_DICE_SOUND_VOLUME,
  reducedMotion: false,
  throwStyle: 'balanced',
  keepPool: true
});

function safeParse(value, fallback) {
  try {
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function createId() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return `dice-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function sanitizeDiceList(value) {
  return Array.isArray(value)
    ? value.map(Number).filter(Number.isFinite).slice(0, 200)
    : [];
}

function sanitizeHistoryEntry(entry = {}) {
  const notation = String(entry.notation || '').slice(0, 100);
  if (!notation) return null;
  return {
    id: String(entry.id || createId()),
    timestamp: String(entry.timestamp || new Date().toISOString()),
    notation,
    dice: sanitizeDiceList(entry.dice),
    keptDice: sanitizeDiceList(entry.keptDice),
    droppedDice: sanitizeDiceList(entry.droppedDice),
    modifier: Number(entry.modifier) || 0,
    total: Number(entry.total) || 0,
    critical: ['success', 'failure'].includes(entry.critical) ? entry.critical : '',
    roller: String(entry.roller || '').trim().slice(0, 80),
    purpose: String(entry.purpose || '').trim().slice(0, 140),
    rollType: ['general', 'attack', 'death-save'].includes(entry.rollType) ? entry.rollType : 'general'
  };
}

export class DiceHistoryRepository {
  constructor(storage = globalThis.localStorage) {
    this.storage = storage;
  }

  list() {
    const stored = safeParse(this.storage?.getItem(DICE_HISTORY_KEY), null);
    const entries = Array.isArray(stored?.entries) ? stored.entries : [];
    return entries.map(sanitizeHistoryEntry).filter(Boolean).slice(0, DICE_HISTORY_LIMIT);
  }

  add(result) {
    const entry = sanitizeHistoryEntry({ ...result, id: createId() });
    const entries = [entry, ...this.list()].filter(Boolean).slice(0, DICE_HISTORY_LIMIT);
    this.#write(entries);
    return entry;
  }

  remove(id) {
    const entries = this.list().filter(entry => entry.id !== String(id));
    this.#write(entries);
    return entries;
  }

  clear() {
    this.#write([]);
    return [];
  }

  getSettings() {
    const stored = safeParse(this.storage?.getItem(DICE_SETTINGS_KEY), {});
    const usesCurrentAudioSettings = Number(stored.schemaVersion) >= 3;
    return {
      animationEnabled: stored.animationEnabled !== false,
      soundEnabled: usesCurrentAudioSettings ? stored.soundEnabled !== false : true,
      soundVolume: clampDiceSoundVolume(stored.soundVolume),
      reducedMotion: stored.reducedMotion === true,
      throwStyle: ['gentle', 'balanced', 'dramatic'].includes(stored.throwStyle) ? stored.throwStyle : 'balanced',
      keepPool: stored.keepPool !== false
    };
  }

  setSettings(patch = {}) {
    const candidate = { ...DEFAULT_SETTINGS, ...this.getSettings(), ...patch };
    const settings = {
      animationEnabled: candidate.animationEnabled !== false,
      soundEnabled: candidate.soundEnabled !== false,
      soundVolume: clampDiceSoundVolume(candidate.soundVolume),
      reducedMotion: candidate.reducedMotion === true,
      throwStyle: ['gentle', 'balanced', 'dramatic'].includes(candidate.throwStyle) ? candidate.throwStyle : 'balanced',
      keepPool: candidate.keepPool !== false
    };
    try {
      this.storage?.setItem(DICE_SETTINGS_KEY, JSON.stringify({ schemaVersion: 3, ...settings }));
    } catch (error) {
      console.warn('Würfeleinstellungen konnten nicht gespeichert werden.', error);
    }
    return settings;
  }

  #write(entries) {
    try {
      this.storage?.setItem(DICE_HISTORY_KEY, JSON.stringify({ schemaVersion: 1, entries }));
    } catch (error) {
      console.warn('Würfelverlauf konnte nicht gespeichert werden.', error);
    }
  }
}
