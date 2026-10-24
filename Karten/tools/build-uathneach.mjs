import fs from 'node:fs/promises';
import vm from 'node:vm';
import { structure, territories } from '../../Stammbäume/assets/js/data/uathneach-territorial-catalog.js';
import { markers, describePlace } from '../Uathneach/places.mjs';
import { cityCategoryCatalog, cityCategories } from '../Uathneach/city-classification.mjs';
import { createReviewedPins } from '../modules/territory-places/reviewed-pin-import.mjs';
import { stateHash, writeGeneratedMap, updateGeneratedMapRegistry } from './generated-map-output.mjs';

const root = new URL('../', import.meta.url), check = process.argv.includes('--check');
const output = async (file, data) => {
  const content = JSON.stringify(data, null, 2) + '\n', url = new URL(file, root);
  if (check) { if (await fs.readFile(url, 'utf8') !== content) throw new Error(`${file} ist veraltet.`); }
  else await fs.writeFile(url, content);
};
await output('Uathneach/territories.import.json', { territories });
const source = { imageSize: [4096, 3365], coordinateOrigin: 'bottom-left', markers };
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
const state = { pins, cats: cityCategories(markers), categoryCatalogVersion: context.KartoCategoryCatalog.version, regions: [], dominions,
  regionTitle: 'Fürstentum Uathneach', regionIcon: structure.realm.banner,
  mapImages: { normal: '/Karten/Uathneach/Kartenbilder/regionen.webp', regions: '', pins: '' },
  layerNames: { normal: 'Karte', regions: 'Regionen', pins: 'Markierungen' },
  dotSize: 80, lblSize: 50, displaySettingsVersion: 1,
  // This supplied map already depicts settlements; click targets and the crest
  // overlay remain available without stamping a second icon over each drawing.
  showMarkers: false, showPinLabels: false, alwaysShowLettering: false,
  extraLayers: [], dm: { sessions: [], notes: '', groupStatus: {} } };
await writeGeneratedMap(root, 'Uathneach/data.json', { schemaVersion: 1, dataPath: 'Uathneach/data.json',
  revision: 3, updatedAt: '2026-10-24T16:43:00.000Z', generatedStateHash: stateHash(state), state }, { check });
await updateGeneratedMapRegistry(root, 'UATHNEACH', [{ id: 'uathneach', title: 'Fürstentum Uathneach', status: 'active', type: 'region',
  hierarchy: [{ level: 'kingdom', slug: 'uathneach', title: 'Uathneach' }], folder: 'Uathneach',
  images: { normal: 'Uathneach/Kartenbilder/regionen.webp' }, dataPath: 'Uathneach/data.json',
  territoryHref: territories[0].href, link: 'karte.html?map=uathneach' }], { check });
console.log(`Uathneach: ${pins.length} Siedlungen und ${dominions.length} Herrschaften ${check ? 'geprüft' : 'erzeugt'}.`);
