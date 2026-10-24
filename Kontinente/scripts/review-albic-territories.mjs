import fs from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { territories as uathneachTerritories } from '../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import { reviewedFiefs, applyFiefReview } from '../../Stammbäume/assets/js/modules/albic-territories/fief-catalog.js';
import { buildAlbicPlacements } from '../../Stammbäume/scripts/albic-territories/build-placements.mjs';
import { reviewFiefPages } from '../modules/albic-territories/fief-page-review.mjs';

const root = new URL('../../', import.meta.url), check = process.argv.includes('--check');
const realms = ['Leitheach', 'Aislearneach', 'Dunfal', 'Blaithneach', 'Uathneach', 'Faelaorn', 'Ceitheach'];
const read = async path => JSON.parse(await fs.readFile(new URL(path, root), 'utf8'));
const output = async (path, value) => {
  const contents = JSON.stringify(value, null, 2) + '\n', target = new URL(path, root);
  if (check) {
    if (await fs.readFile(target, 'utf8') !== contents) throw new Error(`Albische Gliederung veraltet: ${path}`);
  } else await fs.writeFile(target, contents);
};
const aliases = reviewedFiefs.flatMap(fief => [...new Set([fief.previousName, ...(fief.previousNames || [])])]
  .filter(name => name && name !== fief.name)
  .map(name => ({ realm: fief.realm, from: name, to: fief.name })));
const catalogs = [];
for (const realm of realms) {
  const path = `Karten/${realm}/territories.import.json`;
  const source = await read(path);
  const originals = realm === 'Uathneach' ? uathneachTerritories : source.territories;
  const territories = originals.map(applyFiefReview);
  if (realm === 'Leitheach' && !territories.some(t => t.id === 'leitheach-herrschaft-dal-t-saor')) {
    const family = FAMILY_REGISTRY.find(f => f.id === 'haus-dal-t-saor');
    const name = 'Herrschaft der Dál T’Saor';
    territories.push(applyFiefReview({ id: 'leitheach-herrschaft-dal-t-saor', name, type: 'Herrschaft',
      familyId: family.id, house: family.title, crest: '/Stammbäume/' + family.family.document.emblem,
      banner: '', seat: 'Sruthlann', parentId: 'leitheach-tir-na-comhchuibhis', mapId: 'leitheach-tir-na-comhchuibhis',
      href: `/Kontinente/Estryll/Fürstentum Leitheach/Tir an Comhchuibhis/${name}/${name}.html` }));
  }
  // This region was explicitly assigned by the user; the existing banner was simply unlinked.
  if (realm === 'Leitheach') {
    const fancha = territories.find(t => t.id === 'leitheach-tir-na-fancha');
    fancha.banner = '/Stammbäume/assets/images/regions/Leitheach/tir-na-fancha.png';
    fancha.bannerAlt = 'Banner Tir na Fancha';
  }
  await output(path, { ...source, territories });
  catalogs.push({ realm, territories });
  // Uathneach owns a live generator; its pages are generated after the map build.
  if (realm !== 'Uathneach') {
    const pagesPath = `Kontinente/modules/${realm.toLowerCase()}/pages.source.json`;
    await output(pagesPath, reviewFiefPages(await read(pagesPath), territories, FAMILY_REGISTRY,
      aliases.filter(alias => alias.realm === realm)));
  }
}
await output('Stammbäume/assets/js/modules/albic-territories/placements.source.json',
  buildAlbicPlacements(catalogs, FAMILY_REGISTRY, aliases));
console.log(`${realms.length} albische Fürstentümer: ${reviewedFiefs.length} Lehen, Hierarchien und Stammbaum-Zuordnungen ${check ? 'geprüft' : 'abgeglichen'}. Moinneach bleibt unentschieden.`);
