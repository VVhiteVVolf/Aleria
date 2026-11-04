import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import assert from 'node:assert/strict';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url);
const feature = new URL('Familien Häuser und Clans/', root);
const read = file => JSON.parse(readFileSync(new URL(file, root), 'utf8'));
const baseline = read('diagnostics/silberinsel-house-pages-20261103/before.json');
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, dir);
  return entry.isDirectory() ? walk(url) : [url];
});
const urls = walk(new URL('Estryll/Cenyr/Silberinsel/', feature)).filter(url => url.pathname.endsWith('/haus.content.mjs'));
const contents = await Promise.all(urls.map(async url => ({ url, content: (await import(url)).HOUSE_CONTENT })));
const ids = new Set(contents.map(({ content }) => content.id));
const previous = read('diagnostics/silberinsel-house-pages-20261103/gallery-before.json');
const current = read('Gallerien/krieger/data/catalog.json');
for (const before of baseline) {
  const family = FAMILY_REGISTRY.find(record => record.id === before.id).family;
  const graph = Object.fromEntries(['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'].map(key => [key, family[key]]));
  assert.equal(createHash('sha256').update(JSON.stringify(graph)).digest('hex'), before.graphFingerprint, before.id);
}
const delivery = contents.map(({ content, url }) => ({ id: content.id, name: content.name, page: content.page,
  content: decodeURIComponent(url.pathname).split('/Aleria/')[1],
  image: `Familien Häuser und Clans/${content.images.scene}`, prepared: content.prepared,
  original: content.images.scene.includes('original'), biographyWords: Object.values(content.biographySummary).flat().join(' ').split(/\s+/).length }));
assert.equal(delivery.length, 18);
const scopePictures = current.illustrations.filter(image => image.houseIds.some(id => ids.has(id)));
const foreignHouses = previous.houses.filter(house => !ids.has(house.id));
const changedForeignHouses = foreignHouses.filter(house => !isDeepStrictEqual(current.houses.find(item => item.id === house.id), house));
const preservedPictures = previous.illustrations.filter(image => isDeepStrictEqual(current.illustrations.find(item => item.id === image.id), image));
const summary = { houses: delivery.length, originalIllustrations: delivery.filter(item => item.original).length,
  newIllustrations: delivery.filter(item => !item.original).length, preservedGraphs: baseline.length,
  scopeGalleryIllustrations: scopePictures.length, preservedGalleryIllustrationsSinceStart: preservedPictures.length,
  previousGalleryIllustrations: previous.illustrations.length, foreignGalleryChangesSinceStart: changedForeignHouses.length,
  galleryNote: 'Der begrenzte Build aktualisiert ausschließlich die 18 Zielhäuser. Parallele Arbeitsstände werden nicht zurückgesetzt.',
  houseIds: [...ids].sort() };
writeFileSync(new URL('delivery.json', import.meta.url), JSON.stringify(delivery, null, 2) + '\n');
writeFileSync(new URL('verification.json', import.meta.url), JSON.stringify(summary, null, 2) + '\n');
console.log(JSON.stringify(summary, null, 2));
