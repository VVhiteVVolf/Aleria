import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { getHouseRank } from '../../Stammbäume/assets/js/domain/house-profile.js';
import { HOUSE_RANKS } from '../../Familien Häuser und Clans/modules/house-content/house-ranks.generated.mjs';

const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const profileRank = profile => {
  const rank = getHouseRank(profile?.rankId);
  return rank.id === 'unknown' ? '' : rank.label;
};
export async function readWorldDirectorySources() {
  const shared = { window: {}, URLSearchParams };
  vm.runInNewContext(read('js/world-content/celtigerns-wacht-places.js'), shared);
  vm.runInNewContext(read('Kontinente/assets/js/herrschaft-data.js'), shared);
  for (const file of ['Kontinente/kontinente.registry.js', 'Orte/orte.registry.js', 'Familien Häuser und Clans/haeuser.registry.js']) vm.runInNewContext(read(file), shared);
  const { KONTINENTE_REGISTRY: territoryEntries, ORTE_REGISTRY: placeEntries, HaeuserRegistry } = shared.window;
  const previous = globalThis.ALERIA_HERRSCHAFT_DATA;
  const hadPrevious = Object.hasOwn(globalThis, 'ALERIA_HERRSCHAFT_DATA');
  globalThis.ALERIA_HERRSCHAFT_DATA = shared.window.ALERIA_HERRSCHAFT_DATA;
  async function load(entry, base, variable) {
    if (!entry.data) return null;
    const url = new URL(entry.data, new URL(base + '/', root));
    if (entry.dataType === 'module') return (await import(url.href)).default;
    url.search = '';
    const context = { window: { ...shared.window, ORTE_CONFIG: { registryEntry: entry } }, URLSearchParams };
    vm.runInNewContext(fs.readFileSync(url, 'utf8'), context, { filename: fileURLToPath(url) });
    return context.window[variable];
  }
  try {
    const territories = [], places = [];
    for (const entry of territoryEntries) territories.push({ ...entry, content: await load(entry, 'Kontinente', 'KONTINENTE_DATA') });
    for (const entry of placeEntries) places.push({ ...entry, content: await load(entry, 'Orte', 'ORT_DATA') });
    const referenced = new Set([...territories, ...places].flatMap(page => (page.content?.view?.familySections || page.content?.houses || [])
      .flatMap(group => group.cards || group.items || []).map(card => card.id || card.familyId).filter(Boolean)));
    // Visibility is inherited from existing public house pages/directories. A mixed
    // local family register alone never authorizes a new public listing.
    const families = FAMILY_REGISTRY.filter(record => record.listing !== 'linked-only'
      && (HaeuserRegistry.byId(record.id)?.status === 'active' || referenced.has(record.id))).map(record => {
      const house = HaeuserRegistry.byId(record.id);
      return { id: record.id, name: record.title, profile: record.houseProfile,
        aliases: house ? [house.id, ...(house.aliases || [])] : [],
        placements: [{ profile: record.houseProfile, folderPath: record.folderPath }, ...(record.additionalPlacements || []).map(p => ({ profile: p.houseProfile, folderPath: p.folderPath, rank: profileRank(p.houseProfile) }))],
        rank: HOUSE_RANKS[record.id] || profileRank(record.houseProfile),
        emblem: record.family.document.emblem ? (/^(?:https?:)?\//.test(record.family.document.emblem) ? record.family.document.emblem : '/Stammbäume/' + record.family.document.emblem) : '',
        href: house?.status === 'active' ? encodeURI('/Familien Häuser und Clans/') + HaeuserRegistry.linkFor(house.id) : `/Stammbäume/Stammbaum.html?family=${encodeURIComponent(record.id)}&mode=view` };
    });
    return { families, territories, places, houses: shared.window.HAEUSER_REGISTRY };
  } finally {
    if (hadPrevious) globalThis.ALERIA_HERRSCHAFT_DATA = previous;
    else delete globalThis.ALERIA_HERRSCHAFT_DATA;
  }
}
