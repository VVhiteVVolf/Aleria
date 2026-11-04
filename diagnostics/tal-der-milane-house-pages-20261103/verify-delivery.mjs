import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const read = file => JSON.parse(readFileSync(new URL(file, root), 'utf8'));
const baseline = read('diagnostics/tal-der-milane-house-pages-20261103/before.json');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, dir);
  return entry.isDirectory() ? walk(url) : [url];
});
const modules = walk(new URL('Estryll/Cenyr/Tal_der_Milane/', feature)).filter(url => url.pathname.endsWith('/haus.content.mjs'));
const contents = await Promise.all(modules.map(async url => (await import(url)).HOUSE_CONTENT));
const scopedIds = new Set(contents.map(content => content.id));
const previous = read('diagnostics/tal-der-milane-house-pages-20261103/gallery-before.json');
const current = read('Gallerien/krieger/data/catalog.json');
const foreignHouses = previous.houses.filter(house => !scopedIds.has(house.id));
for (const house of foreignHouses) assert.deepEqual(current.houses.find(item => item.id === house.id), house, house.id);
for (const image of previous.illustrations) assert.deepEqual(current.illustrations.find(item => item.id === image.id), image, image.id);
for (const before of baseline) {
  const family = FAMILY_REGISTRY.find(record => record.id === before.id).family;
  const graph = Object.fromEntries(['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'].map(key => [key, family[key]]));
  assert.equal(createHash('sha256').update(JSON.stringify(graph)).digest('hex'), before.graphFingerprint, before.id);
}
const delivery = contents.map(content => ({ id: content.id, name: content.name, page: content.page,
  content: `Familien Häuser und Clans/Estryll/Cenyr/Tal_der_Milane/${content.images.scene.split('/Tal_der_Milane/')[1].split('/assets/')[0]}/haus.content.mjs`,
  image: `Familien Häuser und Clans/${content.images.scene}`, prepared: content.prepared,
  original: content.images.scene.includes('original'), biographyWords: Object.values(content.biographySummary).flat().join(' ').split(/\s+/).length }));
assert.equal(delivery.length, 19);
const summary = { houses: delivery.length, originalIllustrations: delivery.filter(item => item.original).length,
  newIllustrations: delivery.filter(item => !item.original).length, preservedGraphs: baseline.length,
  preservedForeignGalleryHouses: foreignHouses.length, preservedGalleryIllustrations: previous.illustrations.length,
  addedGalleryIllustrations: current.illustrations.length - previous.illustrations.length,
  houseIds: [...scopedIds].sort() };
writeFileSync(new URL('delivery.json', import.meta.url), JSON.stringify(delivery, null, 2) + '\n');
writeFileSync(new URL('verification.json', import.meta.url), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
