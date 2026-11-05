/** Phalantia owns class facts; shared authoring IO owns runtime file handling. */
import { createCountryArtCatalogSource } from '../../shared/art-catalog-source.mjs';

const { readJson, exists, artwork, emit } = createCountryArtCatalogSource(new URL('../', import.meta.url));
const source = await readJson('sources/warrior-art-direction.json');
if (source.schema !== 'aleria.phalantia.warrior-art-direction' || source.entries.length !== 8) {
  throw new Error('Expected eight Phalantia class prototypes.');
}
const expected = new Set(Array.from({ length: 8 }, (_, index) => `prototype-${String(index + 1).padStart(2, '0')}`));
if (new Set(source.entries.map(row => row.id)).size !== 8 || source.entries.some(row => !expected.has(row.id))) {
  throw new Error('Phalantia class prototype IDs differ from their source contract.');
}
const prototypes = [];
const revisions = await exists('sources/warrior-art-revisions.json')
  ? await readJson('sources/warrior-art-revisions.json') : {};
for (const row of source.entries.toSorted((a, b) => a.id.localeCompare(b.id))) {
  const art = await artwork('warriors', revisions[row.id]?.assetStem || row.id);
  if (!art.ready) throw new Error(`Missing prepared Phalantia class artwork: ${row.id}`);
  prototypes.push({
    id: row.id, name: row.name, role: row.role, description: row.description,
    equipment: row.equipment, palette: row.palette,
    mount: row.mount ? { id: 'sarkal', name: row.mount.name, href: row.mount.profile } : null,
    ...art, status: 'proposal',
  });
}
const houses = (await readJson('sources/house-plan.json')).houses;
const houseIds = new Set(houses.map(house => house.id));
const warriors = [];
for (const file of ['house-warriors-a-jobs.json','house-warriors-b-jobs.json']) {
  if (!await exists(`sources/${file}`)) continue;
  for (const row of (await readJson(`sources/${file}`)).jobs) {
    if (!houseIds.has(row.houseId) || !expected.has(row.prototypeId)
        || warriors.some(warrior => warrior.houseId === row.houseId)) {
      throw new Error(`Invalid or repeated Phalantia house warrior: ${row.houseId}`);
    }
    const art = await artwork('warriors', row.assetStem);
    warriors.push({id:row.houseId,houseId:row.houseId,prototypeId:row.prototypeId,
      name:houses.find(house => house.id === row.houseId).name,
      role:row.role,description:row.description,equipment:row.equipment,palette:row.palette,
      mount:row.mount ? {id:row.mount.id || 'sarkal',name:row.mount.name,href:row.mount.href || row.mount.profile} : null,
      ...art,status:'proposal'});
  }
}
await emit('warrior-data.mjs', [['CLASS_PROTOTYPES', prototypes], ['HOUSE_WARRIORS', warriors]]);
console.log(JSON.stringify({ prototypes: prototypes.length, readyPrototypes: prototypes.filter(row => row.ready).length,
  houseWarriors:warriors.length,readyHouseWarriors:warriors.filter(row => row.ready).length }));
