export const noteFrequency = note => 440 * 2 ** ((note - 69) / 12);

export function createLoadingGameAudio(environment, initiallyMuted) {
  const AudioContext = environment.AudioContext ?? environment.webkitAudioContext;
  let context;
  try { if (AudioContext) context = new AudioContext(); } catch { /* Silent play is still available. */ }
  const master = context?.createGain();
  if (master) master.connect(context.destination);
  let muted = !!initiallyMuted;
  let active = false;
  let destroyed = false;
  const notes = new Set();

  function applyVolume() {
    master?.gain.setTargetAtTime(muted ? 0 : .72, context.currentTime, .017);
  }

  function wake() {
    if (active && !muted && !destroyed && context?.state === 'suspended') {
      void context.resume().catch(() => {});
    }
  }

  function tone(frequency, endFrequency, duration, loudness, type, delay = 0) {
    const at = context.currentTime + Math.max(0, delay);
    const oscillation = context.createOscillator();
    const envelope = context.createGain();
    oscillation.type = type;
    oscillation.frequency.setValueAtTime(frequency, at);
    oscillation.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
    envelope.gain.setValueAtTime(.0001, at);
    envelope.gain.exponentialRampToValueAtTime(loudness, at + Math.min(.012, duration / 3));
    envelope.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillation.connect(envelope).connect(master);
    oscillation.start(at);
    oscillation.stop(at + duration + .004);
    notes.add(oscillation);
    oscillation.addEventListener('ended', () => notes.delete(oscillation), { once: true });
  }

  applyVolume();
  return Object.freeze({
    tone,
    wake,
    time: () => context?.currentTime ?? 0,
    clearNotes() {
      for (const note of notes) note.stop();
      notes.clear();
    },
    isPlaying: () => active && !muted && context?.state === 'running',
    isMuted: () => muted,
    toggleMuted() {
      muted = !muted;
      applyVolume();
      wake();
    },
    setActive(enabled) {
      active = enabled;
      if (active) wake();
      else if (context?.state === 'running') void context.suspend().catch(() => {});
    },
    destroy() {
      destroyed = true;
      active = false;
      notes.clear();
      if (context && context.state !== 'closed') void context.close().catch(() => {});
    }
  });
}
