import { escapeCombatHtml as escape, combatTooltipAttributes } from './combat-presentation-markup.js';

const crestFiles = new Set(['bow', 'one-handed', 'spear', 'universal', 'two-handed', 'unarmed', 'shield', 'magic', 'axe', 'dagger', 'mace', 'paired']);
const statFiles = Object.freeze({ attack: ['roll-d20.png', 'W20'], damage: ['attack-melee.png', 'Schaden'], defense: ['shield.png', 'RK'], hp: ['hit-points.png', 'TP'], save: ['roll-d20.png', 'SG'] });

export function renderWeaponCrest(weapon = {}, { withLabel = false } = {}) {
  const id = crestFiles.has(weapon.icon) ? weapon.icon : 'universal';
  const url = new URL(`../../../public/assets/combat-arsenal-icons/${id}.webp`, import.meta.url).href;
  return `<span class="combat-weapon-badge" ${combatTooltipAttributes(weapon.title || weapon.label || 'Waffenbereich')} aria-label="${escape(weapon.title || weapon.label || 'Waffenbereich')}"><img src="${escape(url)}" width="40" height="40" alt="" loading="lazy" decoding="async">${withLabel ? `<span>${escape(weapon.label)}</span>` : ''}</span>`;
}

export function renderCombatStatIcon(kind) {
  const [file] = statFiles[kind] || statFiles.attack;
  const url = new URL(`../../../public/assets/combat-arsenal-icons/${file}`, import.meta.url).href;
  return `<img class="combat-stat-icon" src="${escape(url)}" width="24" height="24" alt="" aria-hidden="true" loading="lazy" decoding="async">`;
}
