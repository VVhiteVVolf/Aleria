import { mergeRollModes, getRollModeLabel } from '../combat-roll-mode.js?v=20260906-effect-rolls-v1';

export function renderAutomaticRollMode(modes = [], { resolutionMode = '' } = {}) {
  const all = modes.flat(Infinity);
  const mode = mergeRollModes(all);
  const noAttack = ['saving-throw', 'automatic'].includes(resolutionMode);
  const label = resolutionMode === 'saving-throw' ? 'Rettungswurf des Ziels'
    : resolutionMode === 'automatic' ? 'Ohne Angriffswurf' : getRollModeLabel(mode);
  const cancelled = all.includes('advantage') && all.includes('disadvantage');
  return `<div class="combat-roll-mode" data-roll-mode="${noAttack ? 'normal' : mode}" role="status">
    <span>Wurf · automatisch</span><strong>${label}</strong>
    <small>${noAttack ? 'Die Handlung bestimmt die Auswertung.' : cancelled ? 'Vorteil und Nachteil heben sich auf.' : 'Aus aktiven Effekten und Fähigkeiten.'}</small>
    <small>Ziel- und Situationsregeln werden beim Wurf berücksichtigt.</small></div>`;
}
