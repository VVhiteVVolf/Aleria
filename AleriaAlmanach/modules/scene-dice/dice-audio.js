export const DEFAULT_DICE_SOUND_VOLUME = 0.65;

export function getDiceAudioSources() {
  return Object.freeze({
    rollLight: new URL('../../assets/audio/dice/dice-roll-light.mp3', import.meta.url).href,
    rollMedium: new URL('../../assets/audio/dice/dice-roll-medium.mp3', import.meta.url).href,
    rollHeavy: new URL('../../assets/audio/dice/dice-roll-heavy.mp3', import.meta.url).href,
    rollDramatic: new URL('../../assets/audio/dice/dice-roll-dramatic.mp3', import.meta.url).href,
    impactLight: new URL('../../assets/audio/dice/dice-impact-light.mp3', import.meta.url).href,
    impactHeavy: new URL('../../assets/audio/dice/dice-impact-heavy.mp3', import.meta.url).href
  });
}

const ROLL_ASSET_KEYS = ['rollLight', 'rollMedium', 'rollHeavy', 'rollDramatic'];
const IMPACT_RATES = [0.94, 1.04, 0.99, 1.09, 0.96, 1.02];

export function clampDiceSoundVolume(value, fallback = DEFAULT_DICE_SOUND_VOLUME) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(1, Math.max(0, number));
}

export function countDiceInNotation(notation = '') {
  const normalized = String(notation || '').toLowerCase().replace(/w/g, 'd');
  const groups = normalized.matchAll(/(\d+)d(?:100|20|12|10|8|6|4)/g);
  let count = 0;
  for (const match of groups) count += Math.max(0, Number(match[1]) || 0);
  return Math.min(100, count);
}

export function getDiceAudioProfile(notation = '', settings = {}) {
  const diceCount = Math.max(1, countDiceInNotation(notation));
  const throwStyle = ['gentle', 'balanced', 'dramatic'].includes(settings.throwStyle)
    ? settings.throwStyle
    : 'balanced';
  let intensity = diceCount <= 1 ? 0 : diceCount <= 3 ? 1 : diceCount <= 7 ? 2 : 3;
  if (throwStyle === 'gentle') intensity -= 1;
  if (throwStyle === 'dramatic') intensity += 1;
  intensity = Math.min(ROLL_ASSET_KEYS.length - 1, Math.max(0, intensity));
  return {
    diceCount,
    assetKey: ROLL_ASSET_KEYS[intensity],
    playbackRate: throwStyle === 'gentle' ? 0.94 : throwStyle === 'dramatic' ? 1.04 : 1,
    rollGain: throwStyle === 'gentle' ? 0.62 : throwStyle === 'dramatic' ? 0.82 : 0.72,
    maxImpacts: Math.min(6, diceCount)
  };
}

export function getDiceResultCue(result = {}) {
  if (result.critical === 'success') return { startFrequency: 520, endFrequency: 780, duration: 0.24, type: 'triangle' };
  if (result.critical === 'failure') return { startFrequency: 190, endFrequency: 120, duration: 0.28, type: 'sawtooth' };
  return { startFrequency: 310, endFrequency: 390, duration: 0.16, type: 'triangle' };
}

function getDieSides(die = {}) {
  const sides = Number(die.sides || die.dieType || die.type);
  return Number.isFinite(sides) ? sides : 0;
}

export class DiceAudioFeedback {
  constructor(options = {}) {
    this.AudioClass = options.AudioClass || globalThis.Audio || null;
    this.AudioContextClass = options.AudioContextClass || globalThis.AudioContext || globalThis.webkitAudioContext || null;
    this.sources = options.sources || getDiceAudioSources();
    this.enabled = false;
    this.volume = DEFAULT_DICE_SOUND_VOLUME;
    this.profile = null;
    this.rollAudio = null;
    this.context = null;
    this.token = 0;
    this.impactCount = 0;
    this.lastImpactAt = 0;
    this.resultTimers = new Set();
    this.impactAudio = new Set();
    this.preloaded = new Map();
    this.warned = false;
  }

  configure(settings = {}) {
    const wasEnabled = this.enabled;
    this.enabled = settings.soundEnabled === true;
    this.volume = clampDiceSoundVolume(settings.soundVolume);
    if (wasEnabled && !this.enabled) this.cancelRoll();
    if (this.rollAudio && this.profile) {
      this.rollAudio.volume = clampDiceSoundVolume(this.volume * this.profile.rollGain, 0);
    }
    if (this.enabled) this.preload();
    return this.getState();
  }

  preload() {
    if (!this.AudioClass || this.preloaded.size) return;
    Object.values(this.sources).forEach(source => {
      try {
        const audio = new this.AudioClass(source);
        audio.preload = 'auto';
        audio.load?.();
        this.preloaded.set(source, audio);
      } catch {
        // Preloading is optional. Playback still gets a direct attempt on demand.
      }
    });
  }

  startRoll(notation, settings = {}) {
    this.configure(settings);
    this.cancelRoll();
    this.profile = getDiceAudioProfile(notation, settings);
    this.impactCount = 0;
    this.lastImpactAt = 0;
    const token = this.token;
    if (!this.enabled) return token;
    const audio = this.#createAudio(this.sources[this.profile.assetKey]);
    if (!audio) return token;
    audio.volume = clampDiceSoundVolume(this.volume * this.profile.rollGain, 0);
    audio.playbackRate = this.profile.playbackRate;
    this.rollAudio = audio;
    this.#play(audio);
    return token;
  }

  playLanding(die = {}) {
    if (!this.enabled || !this.profile || this.impactCount >= this.profile.maxImpacts) return;
    const token = this.token;
    const impactIndex = this.impactCount;
    this.impactCount += 1;
    const now = globalThis.performance?.now?.() || Date.now();
    const playAt = Math.max(now, this.lastImpactAt + 52);
    this.lastImpactAt = playAt;
    const delay = Math.max(0, playAt - now);
    this.#schedule(() => {
      if (token !== this.token || !this.enabled) return;
      const heavy = getDieSides(die) >= 10 || (this.profile.diceCount >= 5 && impactIndex % 3 === 0);
      const audio = this.#createAudio(this.sources[heavy ? 'impactHeavy' : 'impactLight']);
      if (!audio) return;
      audio.volume = clampDiceSoundVolume(this.volume * (heavy ? 0.58 : 0.46), 0);
      audio.playbackRate = IMPACT_RATES[impactIndex % IMPACT_RATES.length];
      this.impactAudio.add(audio);
      audio.addEventListener?.('ended', () => this.impactAudio.delete(audio), { once: true });
      this.#play(audio);
    }, delay);
  }

  finishRoll(result = {}, options = {}) {
    if (!this.enabled) return;
    const token = this.token;
    const needsLanding = this.impactCount === 0;
    const landingDelay = options.textMode ? 500 : 0;
    if (needsLanding) this.#schedule(() => {
      if (token === this.token) this.playLanding({ sides: result.terms?.[0]?.sides || 0 });
    }, landingDelay);
    const cueDelay = landingDelay + (needsLanding ? 170 : 80);
    this.#schedule(() => {
      if (token === this.token) this.#playResultCue(result);
    }, cueDelay);
  }

  cancelRoll() {
    this.token += 1;
    this.resultTimers.forEach(timer => clearTimeout(timer));
    this.resultTimers.clear();
    if (this.rollAudio) {
      this.#stopAudio(this.rollAudio, true);
      this.rollAudio = null;
    }
    this.impactAudio.forEach(audio => this.#stopAudio(audio));
    this.impactAudio.clear();
  }

  getState() {
    return {
      enabled: this.enabled,
      volume: this.volume,
      rolling: !!this.rollAudio && this.rollAudio.ended !== true,
      scheduledImpacts: this.impactCount
    };
  }

  #createAudio(source) {
    if (!this.AudioClass) return null;
    try {
      return new this.AudioClass(source);
    } catch (error) {
      this.#warn(error);
      return null;
    }
  }

  #play(audio) {
    try {
      const playback = audio.play?.();
      playback?.catch?.(error => this.#warn(error));
    } catch (error) {
      this.#warn(error);
    }
  }

  #stopAudio(audio, rewind = false) {
    try {
      audio.pause?.();
      if (rewind) audio.currentTime = 0;
    } catch (error) {
      this.#warn(error);
    }
  }

  #schedule(callback, delay) {
    const timer = setTimeout(() => {
      this.resultTimers.delete(timer);
      callback();
    }, Math.max(0, delay));
    this.resultTimers.add(timer);
  }

  #playResultCue(result) {
    if (!this.AudioContextClass) return;
    try {
      if (!this.context || this.context.state === 'closed') this.context = new this.AudioContextClass();
      const playCue = () => {
        const cue = getDiceResultCue(result);
        const oscillator = this.context.createOscillator();
        const gain = this.context.createGain();
        const now = this.context.currentTime;
        oscillator.type = cue.type;
        oscillator.frequency.setValueAtTime(cue.startFrequency, now);
        oscillator.frequency.exponentialRampToValueAtTime(cue.endFrequency, now + cue.duration);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.001, this.volume * 0.1), now + 0.012);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + cue.duration);
        oscillator.connect(gain).connect(this.context.destination);
        oscillator.start(now);
        oscillator.stop(now + cue.duration + 0.01);
      };
      const resume = this.context.state === 'suspended' ? this.context.resume() : null;
      if (resume?.then) resume.then(playCue).catch(error => this.#warn(error));
      else playCue();
    } catch (error) {
      this.#warn(error);
    }
  }

  #warn(error) {
    if (this.warned || error?.name === 'NotAllowedError') return;
    this.warned = true;
    console.warn('Würfelgeräusche konnten nicht abgespielt werden.', error);
  }
}
