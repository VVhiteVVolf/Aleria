import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { structure, territories } from '../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import { markers, describePlace } from '../Uathneach/places.mjs';
import { cityCategoryCatalog, cityCategories } from '../Uathneach/city-classification.mjs';
import mapImageSources from '../Uathneach/map-images.source.json' with { type: 'json' };
import { createReviewedPins } from '../modules/territory-places/reviewed-pin-import.mjs';
import { stateHash, writeGeneratedMap, updateGeneratedMapRegistry } from './generated-map-output.mjs';

const root = new URL('../', import.meta.url), check = process.argv.includes('--check');
const output = async (file, data) => {
  const content = JSON.stringify(data, null, 2) + '\n', url = new URL(file, root);
  if (check) { if (await fs.readFile(url, 'utf8') !== content) throw new Error(`${file} ist veraltet.`); }
  else await fs.writeFile(url, content);
};
await output('Uathneach/territories.import.json', { territories });
const source = { imageSize: mapImageSources.imageSize, coordinateOrigin: 'bottom-left', markers };
await output('Uathneach/markers.source.json', source);
const context = vm.createContext({});
for (const file of ['category-catalog.js', 'pin-template-catalog.js', 'pin-table-presets.js']) {
  vm.runInContext(await fs.readFile(new URL('assets/js/pins/' + file, root), 'utf8'), context);
}
const pins = structuredClone(createReviewedPins(source, { catalog: cityCategoryCatalog(),
  presets: context.KartoPinTablePresets, describePlace, region: 'Uathneach' }));
for (const pin of pins) for (const asset of [pin.pinMarker, pin.crest, pin.banner].filter(Boolean)) {
  await fs.access(new URL('../' + asset.replace(/^\//, ''), root));
}
const dominions = territories.map(t => ({ id: t.id, name: t.name, type: t.type, ruler: t.house, seat: t.seat, parentId: t.parentId }));
const images = {};
for (const image of mapImageSources.sources) {
  const relative = 'Uathneach/' + image.asset;
  const hash = createHash('sha256').update(await fs.readFile(new URL(relative, root))).digest('hex');
  if (hash !== image.sha256) throw new Error(`Uathneach: Kartenbild ${image.layer} entspricht nicht der geprüften Quelle.`);
  images[image.layer] = relative;
}
const layerNames = { normal: 'Normal', pins: 'Mit Markierungen', regions: 'Regionen' };
const state = { pins, cats: cityCategories(markers), categoryCatalogVersion: context.KartoCategoryCatalog.version, regions: [], dominions,
  regionTitle: 'Fürstentum Uathneach', regionIcon: structure.realm.banner,
  mapImages: { normal: '/Karten/' + images.normal, regions: '/Karten/' + images.regions, pins: '' },
  layerNames,
  dotSize: 80, lblSize: 50, displaySettingsVersion: 1,
  // The supplied city drawings have no pins or names on the normal map.
  // The standard symbol overlay supplies both without a duplicate raster map.
  markerPresentation: 'symbols', pinVisibilityVersion: 1,
  showMarkers: true, showPinLabels: true, alwaysShowLettering: false,
  extraLayers: [], dm: { sessions: [], notes: '', groupStatus: {} } };
await writeGeneratedMap(root, 'Uathneach/data.json', { schemaVersion: 1, dataPath: 'Uathneach/data.json',
  revision: 4, updatedAt: '2026-10-24T17:30:00.000Z', generatedStateHash: stateHash(state), state }, { check });
await updateGeneratedMapRegistry(root, 'UATHNEACH', [{ id: 'uathneach', title: 'Fürstentum Uathneach', status: 'active', type: 'region',
  markerPresentation: 'symbols', layerNames,
  hierarchy: [{ level: 'kingdom', slug: 'uathneach', title: 'Uathneach' }], folder: 'Uathneach',
  images, dataPath: 'Uathneach/data.json',
  territoryHref: territories[0].href, link: 'karte.html?map=uathneach' }], { check });
console.log(`Uathneach: ${pins.length} Siedlungen und ${dominions.length} Herrschaften ${check ? 'geprüft' : 'erzeugt'}.`);
