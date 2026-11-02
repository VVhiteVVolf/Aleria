import { readFile, writeFile, mkdir } from 'node:fs/promises';
import vm from 'node:vm';
import { realms } from '../catalog.mjs';
import dimensions from '../data/map-dimensions.source.json' with { type: 'json' };
import { realmPlaces } from '../map-places.mjs';
import { renderLabelledMap } from '../map-lettering.mjs';
import { createReviewedPins } from '../../../Karten/modules/territory-places/reviewed-pin-import.mjs';
import { stateHash, writeGeneratedMap, updateGeneratedMapRegistry } from '../../../Karten/tools/generated-map-output.mjs';

const root = new URL('../../../Karten/', import.meta.url), check = process.argv.includes('--check');
const context = vm.createContext({});
for (const file of ['category-catalog.js', 'pin-template-catalog.js', 'pin-table-presets.js']) vm.runInContext(await readFile(new URL(`assets/js/pins/${file}`, root), 'utf8'), context);
async function output(file, value) {
  const text = JSON.stringify(value, null, 2) + '\n', target = new URL(file, root);
  if (check) { if (await readFile(target, 'utf8') !== text) throw Error(`Karte veraltet: ${file}`); }
  else { await mkdir(new URL('./', target), { recursive: true }); await writeFile(target, text); }
}
for (const realm of realms) {
  const places = realmPlaces(realm), [width, height] = dimensions[realm.id];
  if (realm.mapSource) {
    const svg = renderLabelledMap(realm, dimensions[realm.id], await readFile(new URL('..' + realm.mapSource, root)));
    const target = new URL('..' + realm.map, root);
    if (check) { if (await readFile(target, 'utf8') !== svg) throw Error(`Kartenbeschriftung veraltet: ${realm.id}`); }
    else await writeFile(target, svg);
    if (realm.id === 'aeldrunmar') {
      const previewTarget = new URL('../../../Vorschau/Aeldrunmar/assets/map.svg', import.meta.url);
      if (check) { if (await readFile(previewTarget, 'utf8') !== svg) throw Error('Vorbereitungskarte Aeldrunmar veraltet.'); }
      else await writeFile(previewTarget, svg);
    }
  }
  const markers = places.markers.filter(m => Number.isFinite(m.x) && Number.isFinite(m.y)).map(m => ({ ...m, x: m.x / 100 * width, y: m.y / 100 * height }));
  const source = { imageSize: [width, height], coordinateOrigin: 'bottom-left', markers };
  const pins = structuredClone(createReviewedPins(source, { catalog: places.catalog, presets: context.KartoPinTablePresets, describePlace: places.describePlace, region: realm.name }));
  for (const pin of pins) for (const asset of [pin.pinMarker, pin.crest, pin.banner].filter(Boolean)) await readFile(new URL('..' + asset, root));
  await output(`${realm.name}/markers.source.json`, source);
  await output(`${realm.name}/territories.import.json`, { territories: realm.territories });
  const layerNames = { normal: 'Vorhandene Übersichtskarte', pins: 'Orte und Hauszuordnungen', regions: 'Regionen' };
  const state = { pins, cats: places.categories, categoryCatalogVersion: context.KartoCategoryCatalog.version, regions: [],
    dominions: realm.territories.map(t => ({ id: t.id, name: t.name, type: t.type, ruler: t.house, seat: t.seat, parentId: t.parentId })),
    regionTitle: realm.title, regionIcon: realm.crest, mapImages: { normal: realm.map, regions: '', pins: '' }, layerNames,
    dotSize: 65, lblSize: 40, displaySettingsVersion: 1, markerPresentation: 'symbols', pinVisibilityVersion: 1,
    // Supplied overview rasters already contain their town names.
    showMarkers: true, showPinLabels: false, alwaysShowLettering: false, extraLayers: [], dm: { sessions: [], notes: '', groupStatus: {} } };
  await writeGeneratedMap(root, `${realm.name}/data.json`, { schemaVersion: 1, dataPath: `${realm.name}/data.json`, revision: 1,
    updatedAt: realm.admissionVersion ? `${realm.acceptedOn}T00:00:00.000Z` : '2026-10-29T00:00:00.000Z', generatedStateHash: stateHash(state), state }, { check });
  await updateGeneratedMapRegistry(root, `ACCEPTED_${realm.id.toUpperCase()}`, [{ id: realm.id, title: realm.title, status: 'active', type: 'region',
    markerPresentation: 'symbols', layerNames, hierarchy: [{ level: 'kingdom', slug: realm.id, title: realm.name }], folder: realm.name,
    images: { normal: `${realm.name}/Kartenbilder/${realm.map.split('/').at(-1)}` }, dataPath: `${realm.name}/data.json`, territoryHref: realm.territories[0].href,
    link: `karte.html?map=${realm.id}` }], { check });
  console.log(`${realm.name}: ${pins.length} Kartenorte ${check ? 'geprüft' : 'erzeugt'}.`);
}
