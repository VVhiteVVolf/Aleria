import { readFileSync, readdirSync } from 'node:fs';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';
import { resolveCanonicalFamilyId } from '../../../Stammbäume/assets/js/modules/family-registry/family-id-aliases.js';
import { getHouseRank } from '../../../Stammbäume/assets/js/domain/house-profile.js';

const normalizeName = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('de').replace(/^(haus|clan|familie)\s+/, '').replace(/[^a-z0-9]/g, '');

/** Keep register identities and separately document named houses found inside trees. */
export function collectHouses(root) {
  const records = FAMILY_REGISTRY;
  const houses = records.map(record => ({
    id: record.id,
    name: record.title,
    kind: 'registered',
    region: record.houseProfile?.kingdom || record.folderPath[0] || 'Ohne Regionsangabe',
    location: record.folderPath.join(' · '),
    rank: getHouseRank(record.houseProfile?.rankId).label,
    tree: `Stammbäume/${record.link}`,
    sources: [record.id],
  }));
  const byId = new Map(houses.map(house => [house.id, house]));
  const byName = new Map(houses.map(house => [normalizeName(house.name), house]));
  const aliases = new Map();
  for (const record of records) {
    aliases.set(record.id, record.id);
    for (const house of record.family.houses || []) {
      if (normalizeName(house.name) === normalizeName(record.title)) aliases.set(house.id, record.id);
    }
  }
  function resolveHouse(id, name = '') {
    const candidate = resolveCanonicalFamilyId(id.replace(/^house-/, 'haus-'));
    return aliases.get(id) || (byId.has(candidate) ? candidate : '') || (byId.has(id.replace(/^house-/, '')) ? id.replace(/^house-/, '') : '') || byName.get(normalizeName(name))?.id || '';
  }
  const graphs = records.map(record => ({ id: record.id, family: record.family }));
  const published = new URL('Stammbäume/assets/data/published-families/', root);
  for (const file of readdirSync(published).filter(name => name.endsWith('.json') && name !== 'registry.json')) {
    const source = JSON.parse(readFileSync(new URL(file, published), 'utf8'));
    const family = source.family || source;
    if (family.document?.id && family.houses) graphs.push({ id: family.document.id, family });
  }
  for (const { id: sourceId, family } of graphs) {
    for (const house of family.houses || []) {
      if (!house.name || /unbekannt|unknown/i.test(house.name) || /^house-(unbekannt|unknown)/.test(house.id)) continue;
      let id = resolveHouse(house.id, house.name);
      if (!id) {
        id = house.id;
        const entry = {
          id, name: house.name, kind: 'mentioned', region: 'Nur im Stammbaum erwähnt',
          location: 'Keine eigenständige Registerzuordnung', rank: 'Benanntes Haus / benannte Linie',
          tree: `Stammbäume/Stammbaum.html?family=${encodeURIComponent(sourceId)}&mode=view`, sources: [],
        };
        houses.push(entry);
        byId.set(id, entry);
        byName.set(normalizeName(house.name), entry);
      }
      aliases.set(house.id, id);
      const target = byId.get(id);
      if (!target.sources.includes(sourceId)) target.sources.push(sourceId);
    }
  }
  houses.sort((a, b) => a.name.localeCompare(b.name, 'de') || a.id.localeCompare(b.id));
  return { houses, records, resolveHouse };
}
