import { createLoadingGameAudio, noteFrequency } from '../games/loading-game-audio.js?v=20261122-carys-archery-v1';
import { createCombatMusic } from '../games/loading-combat-music.js?v=20261122-carys-archery-v1';

const endingScores = {
  won: { melody: [62, 66, 69, 74, 78, 81, 74], chord: [50, 57, 66], pulse: .17 },
  lost: { melody: [65, 64, 61, 62, 57, 53, 50], chord: [38, 45, 53], pulse: .23 }
};

function endingMusic(tone, phase) {
  const { melody, chord, pulse } = endingScores[phase];
  for (const [index, note] of melody.entries()) {
    const length = index === melody.length - 1 ? .72 : pulse * 1.45;
    const frequency = noteFrequency(note);
    const at = .09 + pulse * index;
    tone(frequency, frequency, length, .15, 'triangle', at);
    tone(frequency * 2, frequency * 2, length / 2, .027, 'sine', at);
  }
  for (const [index, note] of chord.entries()) {
    const frequency = noteFrequency(note);
    tone(frequency, frequency, 1.25, .075, 'sine', .13 + index * pulse);
    tone(frequency, frequency, .76, .083, 'triangle', .09 + (melody.length - 1) * pulse);
  }
}

export function createArcheryAudio(environment, muted) {
  const audio = createLoadingGameAudio(environment, muted);
  const combat = createCombatMusic(audio);
  const { tone } = audio;
  const effects = {
    draw() { tone(213, 304, .19, .075, 'triangle'); },
    release() {
      tone(262, 76, .11, .27, 'triangle');
      tone(1170, 400, .055, .093, 'sine', .012);
    },
    blanket() {
      tone(181, 77, .12, .16, 'sine');
      tone(622, 622, .22, .12, 'triangle', .046);
    },
    ground() {
      tone(351, 170, .08, .15, 'triangle');
      tone(468, 216, .065, .09, 'triangle', .08);
    },
    wall() {
      tone(420, 126, .13, .20, 'triangle');
      tone(1873, 581, .08, .074, 'sine');
    },
    einion() { tone(456, 113, .22, .16, 'triangle'); }
  };
  return {
    ...audio,
    startRound() { audio.clearNotes(); combat.reset(); audio.wake(); },
    music: combat.tick,
    feedback(name) { if (audio.isPlaying()) effects[name]?.(); },
    finish(phase) {
      if (audio.isPlaying()) endingMusic(tone, phase);
    }
  };
}
