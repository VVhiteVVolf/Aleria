import { noteFrequency } from './loading-game-audio.js?v=20261122-carys-archery-v1';

// Eight bars in D minor with a short dominant turn into the loop.
const score = [
  [38, [62, 0, 69, 0, 74, 72, 69, 65]],
  [34, [70, 0, 74, 77, 74, 72, 70, 0]],
  [36, [72, 0, 67, 72, 76, 74, 72, 67]],
  [33, [69, 0, 73, 76, 74, 73, 69, 0]],
  [38, [74, 0, 77, 74, 81, 79, 77, 74]],
  [34, [82, 0, 77, 74, 77, 76, 74, 70]],
  [43, [79, 0, 74, 70, 74, 72, 70, 67]],
  [33, [76, 0, 73, 69, 73, 0, 69, 0]]
];
const stepTime = 60 / 124 / 2;

function playStep(tone, step, delay) {
  const position = step % 8;
  const [root, melody] = score[Math.floor(step / 8)];
  const note = melody[position];
  if (note) {
    const frequency = noteFrequency(note);
    tone(frequency, frequency * .997, .22, position % 2 ? .067 : .098, 'triangle', delay);
    tone(frequency * 2, frequency * 2, .105, .021, 'sine', delay);
  }
  if (position % 2 === 0) {
    const low = noteFrequency(root + (position === 4 ? 7 : 0));
    tone(low, low, .32, .15, 'triangle', delay);
    tone(117, 46, .18, position % 4 === 0 ? .20 : .11, 'sine', delay);
    tone(low * 3, low * 3, .16, .035, 'triangle', delay);
  } else {
    tone(402 + position * 43, 182, .075, .050, 'triangle', delay);
    tone(1512, 590, .045, .018, 'sine', delay);
  }
}

export function createCombatMusic(audio) {
  let step = 0;
  let next = null;
  return Object.freeze({
    reset() { step = 0; next = null; },
    tick() {
      if (!audio.isPlaying()) return;
      const now = audio.time();
      if (next === null || next < now - .13) next = now + .015;
      if (next > now + .07) return;
      playStep(audio.tone, step, next - now);
      next += stepTime;
      step = (step + 1) % (score.length * 8);
    }
  });
}
