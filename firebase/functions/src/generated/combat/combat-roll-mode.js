// Keep all sources until the final decision: multiple advantages never outweigh a disadvantage.
export function mergeRollModes(...sources) {
  const modes = sources.flat(Infinity);
  const advantage = modes.includes('advantage');
  const disadvantage = modes.includes('disadvantage');
  return advantage === disadvantage ? 'normal' : advantage ? 'advantage' : 'disadvantage';
}

export function mergeRestrictedRollModes(sources, effects = {}) {
  const modes = sources.flat(Infinity);
  return mergeRollModes(effects.preventAdvantage ? modes.filter(mode => mode !== 'advantage') : modes);
}

export function getRollModeLabel(mode) {
  return mode === 'advantage' ? 'Vorteil' : mode === 'disadvantage' ? 'Nachteil' : 'Normal';
}
