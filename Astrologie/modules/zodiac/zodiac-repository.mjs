import { readReligionCatalog, entryPagePath } from '../../../Religionen/modules/content/content-repository.mjs';
import { ALL_SIGNS } from './zodiac-data.mjs';

export function readAstrologyDeities() {
  const catalog = readReligionCatalog();
  const entries = new Map(catalog.entries.map(entry => [entry.id, entry]));
  const shadows = ALL_SIGNS.map(sign => sign.shadowId).filter(Boolean);
  if (new Set(shadows).size !== shadows.length) throw new Error('Ein infernaler Widersacher darf nur einem Sternzeichen zugeordnet sein.');
  const ids = new Set(ALL_SIGNS.flatMap(sign => [sign.id, sign.shadowId]).filter(Boolean));
  return Object.fromEntries([...ids].map(id => {
    const deity = entries.get(id);
    if (!deity?.page) throw new Error(`Gottheit ohne Codexseite: ${id}`);
    const portrait = deity.portrait ? { ...deity.portrait, src: `../Religionen/${deity.portrait.src}` } : undefined;
    return [id, { id, title: deity.title, epithet: deity.epithet, summary: deity.summary, href: `../${entryPagePath(deity)}`, ...(portrait ? { portrait } : {}) }];
  }));
}
