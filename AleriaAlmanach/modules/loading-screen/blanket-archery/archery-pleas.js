export const EINION_PLEAS = Object.freeze([
  'Carys, bitte! Verschon ihn!',
  'Töte Lord Schmusedecke nicht!',
  'Ich flehe dich an!',
  'Er ist doch mein bester Freund!'
]);

export function einionPleaFor(state) {
  if (state.phase !== 'playing') return '';
  if (state.lastImpact?.place === 'blanket' && state.time - state.lastImpact.at < 2.1) {
    return 'Bitte! Keinen Pfeil mehr!';
  }
  const interval = 4.2;
  if (state.time % interval > 3.35) return '';
  return EINION_PLEAS[Math.floor(state.time / interval) % EINION_PLEAS.length];
}
