import { GUILD_EMBLEMS, POST_ART } from './post-section.mjs';
import { buildTradingPostHierarchy } from '../guild-trading-post/trading-post-hierarchy.mjs';
export { level, office } from '../guild-trading-post/trading-post-hierarchy.mjs';
export function hierarchy(guild, title, subtitle, description, trees, details, footerNote) {
  const scene = { coin: 'ratssaal', bank: 'bankhalle', company: 'kommandantur' }[guild];
  return buildTradingPostHierarchy({ title, subtitle, emblem: GUILD_EMBLEMS[guild], sideImage: `${POST_ART}/${scene}.png`, motto: 'Handel · Kapital · Geleit',
    description, details, trees, footerNote, chartIntro: 'Familiensitze, Ämter und Arbeitsbereiche des Grafschaftskontors.' });
}
