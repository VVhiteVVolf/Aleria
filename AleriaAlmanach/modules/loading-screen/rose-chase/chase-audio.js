const melody = [
  67, 0, 70, 74, 72, 0, 70, 67, 65, 0, 67, 70, 64, 0, 65, 66,
  67, 0, 74, 77, 75, 0, 74, 70, 72, 69, 67, 65, 62, 65, 67, 0
];
const bass = [43, 43, 46, 43, 41, 41, 38, 42, 43, 43, 46, 46, 48, 45, 38, 43];
const hertz = note => 440 * 2 ** ((note - 69) / 12);

export function createChaseAudio(environment, initiallyMuted) {
  const AudioContext = environment.AudioContext ?? environment.webkitAudioContext;
  let context;
  try { if (AudioContext) context = new AudioContext(); } catch { /* The chase is playable in silent mode. */ }
  const master = context?.createGain();
  if (master) master.connect(context.destination);
  let muted = !!initiallyMuted;
  let active = false;
  let openingBeat = true;
  let destroyed = false;
  let beat = 0;
  let nextBeat = 0;

  function applyVolume() {
    if (master) master.gain.setTargetAtTime(muted ? 0 : .73, context.currentTime, .017);
  }

  function wake() {
    if (!active || muted || destroyed) return;
    if (context?.state === 'suspended') void context.resume().catch(() => {});
  }

  function tone(frequency, endFrequency, duration, loudness, type, delay = 0) {
    const at = context.currentTime + delay;
    const oscillation = context.createOscillator();
    const envelope = context.createGain();
    oscillation.type = type;
    oscillation.frequency.setValueAtTime(frequency, at);
    oscillation.frequency.exponentialRampToValueAtTime(endFrequency, at + duration);
    envelope.gain.setValueAtTime(.0001, at);
    envelope.gain.exponentialRampToValueAtTime(loudness, at + .011);
    envelope.gain.exponentialRampToValueAtTime(.0001, at + duration);
    oscillation.connect(envelope).connect(master);
    oscillation.start(at);
    oscillation.stop(at + duration + .004);
  }

  function feedback(event) {
    if (!active || muted || context?.state !== 'running') return;
    if (event === 'jump') tone(238, 535, .15, .15, 'triangle');
    if (event === 'break') {
      tone(134, 45, .19, .21, 'triangle');
      for (const [index, frequency] of [2876, 3760, 2128, 4670, 2394, 3124].entries()) {
        tone(frequency, frequency * .63, .23 - index * .021, .078 - index * .006, 'sine', index * .018);
      }
    }
    if (event === 'peck') {
      for (const delay of [.2, .7, 1.2]) {
        tone(624, 286, .12, .22, 'triangle', delay);
        tone(176, 88, .08, .17, 'square', delay + .04);
      }
    }
    if (event === 'escape') {
      for (const [index, note] of [67, 71, 74, 79].entries()) {
        tone(hertz(note), hertz(note), .46, .15, 'triangle', index * .092);
      }
    }
  }

  applyVolume();
  return {
    isMuted: () => muted,
    wake,
    feedback,
    startRound() {
      openingBeat = true;
      beat = 0;
      nextBeat = context?.currentTime ?? 0;
      wake();
    },
    opening() {
      if (!openingBeat || !active || muted || context?.state !== 'running') return;
      openingBeat = false;
      tone(108, 39, .26, .29, 'triangle');
      tone(192, 68, .1, .16, 'triangle', .018);
    },
    music() {
      if (!active || muted || context?.state !== 'running' || context.currentTime < nextBeat) return;
      const lead = melody[beat % melody.length];
      if (lead) tone(hertz(lead), hertz(lead) * .992, .18, .084, 'triangle');
      if (beat % 2 === 0) {
        const low = hertz(bass[Math.floor(beat / 2) % bass.length]);
        tone(low, low, .21, .135, 'triangle');
        tone(low * 2, low * 2, .11, .03, 'sine');
      }
      nextBeat = context.currentTime + (beat % 2 ? .17 : .22);
      beat += 1;
    },
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
      if (context && context.state !== 'closed') void context.close().catch(() => {});
    }
  };
}
