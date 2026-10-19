import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import { createReviewedPins } from '../modules/territory-places/reviewed-pin-import.mjs';

// Shared CLI workflow; regional catalogs own reviewed data and assignments.
export function importReviewedTerritory({ folder, region, countyId, describePlace, territoriesById, write = false }) {
  const root = new URL('../', import.meta.url);
  const read = file => JSON.parse(fs.readFileSync(new URL(file, folder), 'utf8'));
  const document = read('data.json');
  const context = vm.createContext({});
  for (const file of ['category-catalog.js', 'pin-template-catalog.js', 'pin-table-presets.js']) {
    vm.runInContext(fs.readFileSync(new URL(`assets/js/pins/${file}`, root), 'utf8'), context);
  }
  const catalog = context.KartoCategoryCatalog;
  const pins = structuredClone(createReviewedPins(read('markers.source.json'), {
    catalog, presets: context.KartoPinTablePresets, describePlace, region,
  }));
  for (const pin of pins) for (const asset of [pin.pinMarker, pin.crest, pin.banner]) {
    assert.ok(fs.existsSync(new URL('..' + asset, root)), `Fehlendes Bild: ${asset}`);
  }
  const dominions = [...territoriesById.values()].map(territory => ({
    id: territory.id, name: territory.name, type: territory.type, ruler: territory.house,
    seat: territory.seat, parentId: territory.parentId, note: '',
  }));
  if (write) {
    if (document.revision !== 0 || document.state.pins.length) throw new Error('Karte bereits bearbeitet; vorhandene Änderungen bleiben erhalten.');
    document.state = { ...document.state, ...catalog.upgrade(document.state), pins, dominions,
      regionTitle: region, regionIcon: territoriesById.get(countyId).banner };
    document.revision = 1;
    document.updatedAt = new Date().toISOString();
    fs.writeFileSync(new URL('data.json', folder), JSON.stringify(document, null, 2) + '\n');
  } else {
    assert.deepEqual(document.state.pins, pins);
    assert.deepEqual(document.state.dominions, dominions);
  }
  console.log(`${pins.length} Marker, ${pins.filter(pin => pin.text).length} Beschreibungen und ${dominions.length} Gebietszuordnungen geprüft.`);
}
