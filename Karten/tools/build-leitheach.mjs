import fs from 'node:fs/promises';
import vm from 'node:vm';
import { createReviewedPins } from '../modules/territory-places/reviewed-pin-import.mjs';
import { validateRegions } from '../modules/regions/region-model.mjs';
import { territoriesById, describePlace } from '../Leitheach/places.mjs';
import { stateHash, writeGeneratedMap, updateGeneratedMapRegistry } from './generated-map-output.mjs';

const base = new URL('../', import.meta.url), check = process.argv.includes('--check');
const read = async path => JSON.parse(await fs.readFile(new URL(path, base), 'utf8'));
const definitions = (await read('Leitheach/map-definitions.json')).maps;
const images = await read('Leitheach/sources/images.manifest.json');
const regionMaps = (await read('Leitheach/regions.source.json')).maps;
const context = vm.createContext({});
for (const file of ['category-catalog.js', 'pin-template-catalog.js', 'pin-table-presets.js']) {
  vm.runInContext(await fs.readFile(new URL('assets/js/pins/' + file, base), 'utf8'), context);
}
const registryEntries = [], prepared = [];
for (const definition of definitions) {
  const { slug, title, territoryId } = definition, main = slug === 'leitheach';
  const mapId = main ? 'leitheach' : 'leitheach-' + slug;
  const folder = main ? 'Leitheach' : 'Leitheach/' + slug;
  const source = await read(folder + '/markers.source.json');
  const image = images.find(image => image.id === slug);
  if (!image || image.width !== source.imageSize[0] || image.height !== source.imageSize[1]) throw new Error('Kartenbildgröße passt nicht zur Quelle: ' + title);
  const regions = regionMaps.find(map => map.id === mapId)?.regions;
  validateRegions(regions);
  const pins = structuredClone(createReviewedPins(source, { catalog: context.KartoCategoryCatalog, presets: context.KartoPinTablePresets, describePlace, region: title }));
  for (const pin of pins) for (const asset of [pin.pinMarker, pin.crest, pin.banner].filter(Boolean)) {
    await fs.access(new URL('../' + asset.replace(/^\//, ''), base));
  }
  const localTerritories = [...territoriesById.values()].filter(t => main || t.mapId === mapId);
  const dominions = localTerritories.map(t => ({ id: t.id, name: t.name, type: t.type, ruler: t.house, seat: t.seat,
    parentId: localTerritories.some(parent => parent.id === t.parentId) ? t.parentId : '', note: '' }));
  const state = { pins, ...context.KartoCategoryCatalog.upgrade({}), regions, dominions, regionTitle: title,
    regionIcon: `/Stammbäume/assets/images/regions/Leitheach/${slug}.png`,
    mapImages: { normal: '/' + image.output, regions: '', pins: '' },
    layerNames: { normal: 'Karte', regions: 'Regionen', pins: 'Markierungen' }, dotSize: 80, lblSize: 50,
    displaySettingsVersion: 1, markerPresentation: 'symbols', pinVisibilityVersion: 1, showMarkers: true,
    showPinLabels: false, alwaysShowLettering: false, extraLayers: [], dm: { sessions: [], notes: '', groupStatus: {} } };
  prepared.push([folder + '/data.json', { schemaVersion: 1, dataPath: folder + '/data.json', revision: 3,
    updatedAt: '2026-10-24T18:20:00.000Z', generatedStateHash: stateHash(state), state }]);
  const territory = territoriesById.get(territoryId);
  registryEntries.push({ id: mapId, title, status: 'active', type: 'region', markerPresentation: 'symbols',
    hierarchy: [{ level: 'region', slug: 'leitheach', title: 'Fürstentum Leitheach' }, ...main ? [] : [{ level: 'region', slug, title }]],
    folder, images: { normal: image.output.replace(/^Karten\//, '') }, dataPath: folder + '/data.json',
    link: 'karte.html?map=' + mapId, territoryHref: territory.href, ...main ? {} : { parentMapId: 'leitheach' } });
}
for (const [path, data] of prepared) await writeGeneratedMap(base, path, data, { check });
await updateGeneratedMapRegistry(base, 'LEITHEACH', registryEntries, { check });
console.log(`${prepared.length} Leitheach-Karten mit ${prepared.reduce((sum,[,data]) => sum + data.state.pins.length, 0)} Ortsmarkern und 36 Grenzobjekten ${check ? 'geprüft' : 'vorbereitet'}.`);
