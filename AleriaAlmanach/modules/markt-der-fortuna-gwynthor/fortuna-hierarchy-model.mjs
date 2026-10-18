import { buildTradingPostHierarchy } from '../guild-trading-post/trading-post-hierarchy.mjs';
import { FORTUNA_ART, FORTUNA_SYMBOLS } from './fortuna-section.mjs';
export { level, office } from '../guild-trading-post/trading-post-hierarchy.mjs';
export function fortunaHierarchy(guild, title, subtitle, description, trees, details, footerNote = '') {
  const art = { market: 'ratssaal', bank: 'bankhalle', company: 'kommandantur', mariel: 'tafel-der-mutter' }[guild];
  return buildTradingPostHierarchy({ title, subtitle, description, trees, details, footerNote,
    emblem: FORTUNA_SYMBOLS[guild], sideImage: `${FORTUNA_ART}/${art}.png`, motto: guild === 'mariel' ? 'Tafel der Mutter' : 'Handel · Handwerk · Seefahrt' });
}
