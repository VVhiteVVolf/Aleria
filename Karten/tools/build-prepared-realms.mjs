import fs from 'node:fs/promises';
import vm from 'node:vm';
import { stateHash, writeGeneratedMap, updateGeneratedMapRegistry } from './generated-map-output.mjs';

// Bildkarten ohne belegte Markerkoordinaten. Keine Schätzung von Grenzen/Pins.
// Die Schutzprüfung verhindert das Überschreiben späterer Editoränderungen.
const root = new URL('../', import.meta.url);
const check = process.argv.includes('--check');
const context = vm.createContext({});
vm.runInContext(await fs.readFile(new URL('assets/js/pins/category-catalog.js', root), 'utf8'), context);

for (const [folder, title] of [['Vennyr', 'Königreich Vennyr'], ['Fjordheim', 'Reiktum Fjordheim']]) {
  const slug = folder.toLowerCase();
  const {territories} = JSON.parse(await fs.readFile(new URL(`${folder}/territories.import.json`, root), 'utf8'));
  const image = `${folder}/Kartenbilder/normal.webp`;
  await fs.access(new URL(image, root));
  const state = {
    pins: [], ...context.KartoCategoryCatalog.upgrade({}), regions: [],
    dominions: territories.map(t => ({id:t.id, name:t.name, type:t.type, ruler:t.house, seat:t.seat, parentId:t.parentId, note:''})),
    regionTitle: title, regionIcon: territories[0].banner,
    mapImages: {normal:`/Karten/${image}`, regions:'', pins:''},
    layerNames: {normal:'Karte', regions:'Regionen', pins:'Markierungen'},
    dotSize:80, lblSize:50, displaySettingsVersion:1,
    showMarkers:false, showPinLabels:false, alwaysShowLettering:false,
    extraLayers:[], dm:{sessions:[], notes:'', groupStatus:{}}
  };
  await writeGeneratedMap(root, `${folder}/data.json`, {
    schemaVersion:1, dataPath:`${folder}/data.json`, revision:1,
    updatedAt:'2026-10-22T21:00:00.000Z', generatedStateHash:stateHash(state), state
  }, {check});
  await updateGeneratedMapRegistry(root, folder.toUpperCase(), [{
    id:slug, title, status:'active', type:'kingdom',
    hierarchy:[{level:'kingdom',slug,title}], folder,
    images:{normal:image}, dataPath:`${folder}/data.json`, link:`karte.html?map=${slug}`
  }], {check});
  console.log(`${title}: Bildkarte und ${territories.length} verschachtelte Herrschaften ${check?'geprüft':'vorbereitet'}; keine unbelegten Pins oder Grenzen.`);
}
