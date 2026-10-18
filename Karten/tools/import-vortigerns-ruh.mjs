import fs from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const folder = new URL('Cenyr/vortigerns-ruh/', root);
const read = url => JSON.parse(fs.readFileSync(url, 'utf8'));
const source = read(new URL('markers.source.json', folder));
const document = read(new URL('data.json', folder));
const context = vm.createContext({});
for (const file of ['category-catalog.js', 'pin-template-catalog.js', 'pin-table-presets.js']) {
  vm.runInContext(fs.readFileSync(new URL(`assets/js/pins/${file}`, root), 'utf8'), context);
}
const { KartoCategoryCatalog: catalog, KartoPinTablePresets: presets } = context;
const [width, height] = source.imageSize;
const pins = source.markers.map(marker => {
  const category = catalog.definition({ label: marker.category });
  if (!category) throw new Error(`Unbekannte Ortsart: ${marker.category}`);
  if (marker.x < 0 || marker.x > width || marker.y < 0 || marker.y > height) throw new Error(`Koordinate außerhalb der Karte: ${marker.id}`);
  if (!fs.existsSync(new URL('..' + marker.icon, root))) throw new Error(`Fehlendes Ortssymbol: ${marker.icon}`);
  const table = presets.createTable(marker.templateId, category);
  table.find(row => row.k === 'Name').v = marker.title;
  table.find(row => row.k === 'Typ').v = marker.category;
  return {
    id: marker.id, title: marker.title,
    x: marker.x / width, y: 1 - marker.y / height,
    cat: category.id, templateId: marker.templateId, kind: 'place',
    pinMarker: marker.icon, img: '', imgLink: '', crest: '', crestLink: '',
    banner: '', bannerLink: '', region: 'Vortigerns Ruh', house: marker.house,
    faction: '', table, text: '', secret: false, dominionId: '',
  };
});
if (new Set(pins.map(pin => pin.id)).size !== pins.length) throw new Error('Doppelte Marker-ID');

// This initializer never replaces an edited map, locally or online.
if (process.argv.includes('--write')) {
  if (document.state.pins.length || document.revision !== 0) throw new Error('Karte bereits initialisiert; vorhandene Bearbeitungen bleiben erhalten.');
  document.state = { ...document.state, ...catalog.upgrade(document.state), pins };
  document.revision = 1;
  document.updatedAt = '2026-10-18T20:00:00.000Z';
  fs.writeFileSync(new URL('data.json', folder), JSON.stringify(document, null, 2) + '\n');
} else {
  for (const expected of pins) {
    const actual = document.state.pins.find(pin => pin.id === expected.id);
    if (JSON.stringify(actual) !== JSON.stringify(expected)) throw new Error(`Importabweichung: ${expected.id}`);
  }
  if (document.state.pins.length !== pins.length) throw new Error('Unerwartete zusätzliche Marker');
}
console.log(`${pins.length} Marker geprüft: ${fileURLToPath(folder)}`);
