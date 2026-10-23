import { readFile, access } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';

// House pages own explicit extinction and revised seat information. Family
// registry status "active" only says that an archive record is available.
export async function loadHouseholdSources() {
  const root = new URL('../../Familien Häuser und Clans/', import.meta.url);
  const context = { window: {} };
  runInNewContext(await readFile(new URL('haeuser.registry.js', root), 'utf8'), context);
  const sources = {};
  for (const house of context.window.HaeuserRegistry.all()) {
    const path = house.data.split('?')[0].replace(/haus\.data\.js$/, 'haus.content.mjs');
    if (!path.endsWith('.mjs')) continue;
    const url = new URL(path, root);
    try { await access(url); } catch (error) { if (error.code === 'ENOENT') continue; throw error; }
    const { HOUSE_CONTENT: content } = await import(url.href);
    if (!content) continue;
    const rawSeat = content.profile?.seat || '';
    const former = /\bbis\s+\d{3,4}|verloren|kein anerkannter sitz|ehemals/i.test(rawSeat);
    sources[house.id] = {
      status: content.extinct === true ? 'extinct' : former ? 'dispossessed' : 'active',
      seat: /^(?:folgt|\.{2,}|…)/i.test(rawSeat.trim()) ? '' : rawSeat.split('·')[0].trim(),
      seatRole: /neu zugesprochen/i.test(rawSeat) ? 'Neu zugesprochenes Lehen' : 'Hauptsitz',
    };
  }
  return sources;
}
