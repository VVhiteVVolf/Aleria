import { getCombatEntryIconPresentation, getRollIconSource, getActivationIconSource } from '../../AleriaAlmanach/modules/combat/combat-entry-icons.js';

const repository = new URL('../../', import.meta.url).href;
export function publicAsset(source = '') {
  if (source.startsWith(repository)) return '/' + source.slice(repository.length);
  if (/^(?:\.\.?\/|public\/|assets\/)/.test(source)) return new URL(source, 'https://aleria.invalid/AleriaAlmanach/').pathname;
  return source;
}
const cardIcon = path => `/IconOrdner/Zauberkarten%20Icons/${path}`;
const weaponIcons = { spear: 'Speer', sword: 'Schwert', bow: 'Bogen', crossbow: 'Armbrust', axe: 'Axt', dagger: 'Dolch', unarmed: 'Nahkampf%20Waffenlos' };
const originalIcon = name => `/Gameplay%20Guide/assets/icons/${name}-ui.png`;

export function isCrusaderKingsIcon(source = '') {
  let decoded = String(source);
  try { decoded = decodeURIComponent(decoded); } catch { /* Inspect malformed imported paths literally. */ }
  return /(?:^|\/)(?:traits icon|cktraits|ck[23]?(?:[ /_-]|$)|crusader[ -]?kings)/i.test(decoded.replace(/\\/g, '/'));
}

function originalAbilityIcon(entry) {
  if (/tier|begleiter|gefährte|wolf|fang|biss|jagd/.test(String(entry.name).toLocaleLowerCase('de'))) return originalIcon('companion-bond');
  if (/auge|wahrnehmung|wachsam|veteran/.test(String(entry.name).toLocaleLowerCase('de'))) return originalIcon('watchful-eye');
  return originalIcon('training-and-heritage');
}

export function entryIcon(kind, entry = {}) {
  const configured = publicAsset(entry.icon || entry.image || '');
  if (configured && !isCrusaderKingsIcon(configured)) return configured;
  const effects = entry.effects || [];
  if (effects.some(e => e.type === 'healing')) return cardIcon('Sonstiges/Heilung.svg');
  if (entry.counterAttack?.enabled || effects.some(e => e.condition?.counterAttack?.enabled)) return cardIcon('Sonstiges/Vorbereitet.svg');
  if (entry.disarm || entry.secondarySave?.failureCondition?.disarm) return '/IconOrdner/Zauber%20Icons/Baldurs%20Gate/Condition%20Icons/Disarmed_Condition_Icon.webp';
  if (effects.length && !effects.some(e => e.type === 'damage')) return cardIcon(`Sonstiges/${effects.some(e => e.type === 'debuff') ? 'Debuff' : 'Buff'}.svg`);
  const weapon = entry.weaponType || entry.weaponTypes?.[0];
  if (weaponIcons[weapon]) return cardIcon(`Waffentypen/${weaponIcons[weapon]}.svg`);
  if (kind === 'technique') return cardIcon('Waffentypen/Schwert.svg');
  if (kind === 'spell' || kind === 'condition' && /liegend|benommen|betäubt|blind|vergift|blut|brenn|gelähmt|gefesselt|schlaf|bewusstlos/.test(String(entry.name).toLocaleLowerCase('de'))) {
    const source = publicAsset(getCombatEntryIconPresentation(kind, entry).source);
    if (!isCrusaderKingsIcon(source)) return source;
  }
  if (kind === 'condition') return cardIcon('Sonstiges/Vorbereitet.svg');
  return originalAbilityIcon(entry);
}
export function dieIcon(formula = '1W20', type = '') {
  const source = publicAsset(getRollIconSource(formula, type));
  return type === 'healing' ? source.replace('_Physical.', '_Healing.') : source;
}
export const passiveIcon = publicAsset(getActivationIconSource('passive'));
