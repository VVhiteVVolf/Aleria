import { createLoadingGameAudio, noteFrequency } from '../games/loading-game-audio.js?v=20261122-carys-archery-v1';
import { createCombatMusic } from '../games/loading-combat-music.js?v=20261122-carys-archery-v1';

export function createChaseAudio(environment, initiallyMuted) {
  const audio = createLoadingGameAudio(environment, initiallyMuted);
  const combat = createCombatMusic(audio);
  const { tone } = audio;
  let openingBeat = true;

  function feedback(event) {
    if (!audio.isPlaying()) return;
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
        const frequency = noteFrequency(note);
        tone(frequency, frequency, .46, .15, 'triangle', index * .092);
      }
    }
  }

  return {
    ...audio,
    feedback,
    startRound() {
      openingBeat = true;
      combat.reset();
      audio.wake();
    },
    opening() {
      if (!openingBeat || !audio.isPlaying()) return;
      openingBeat = false;
      tone(108, 39, .26, .29, 'triangle');
      tone(192, 68, .1, .16, 'triangle', .018);
    },
    music: combat.tick
  };
}
