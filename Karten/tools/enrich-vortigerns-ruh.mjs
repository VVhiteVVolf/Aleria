import fs from 'node:fs';
import assert from 'node:assert/strict';
import { describePlace, territoriesById } from '../Cenyr/vortigerns-ruh/places.mjs';
const folder = new URL('../Cenyr/vortigerns-ruh/', import.meta.url);
const read = file => JSON.parse(fs.readFileSync(new URL(file, folder), 'utf8'));
const source = read('markers.source.json');
const document = read('data.json');

function enrich(pin, marker) {
  const details = describePlace(marker);
  const fields = { ...details.fields, Lehensherr: details.house };
  if (details.trade) fields.Gewerbe = details.trade;
  const table = pin.table.map(row => ({ ...row, ...(fields[row.k] ? {v:fields[row.k]} : {}) }));
  for (const [k,v] of Object.entries(fields)) if (!table.some(row => row.k === k)) table.push({k,v});
  return { ...pin, table, text:details.text, house:details.house, faction:details.faction,
    crest:details.crest, crestLink:details.houseHref, banner:details.banner, bannerLink:details.territory.href,
    dominionId:details.territory.id };
}
const pins = source.markers.map(marker => {
  const pin = document.state.pins.find(pin => pin.id === marker.id);
  if (!pin) throw new Error(`Fehlender Marker: ${marker.id}`);
  return enrich(pin, marker);
});
const dominions = [...territoriesById.values()].map(territory => ({
  id:territory.id, name:territory.name, type:territory.type, ruler:territory.house,
  seat:territory.seat, parentId:territory.parentId, note:'',
}));
if (process.argv.includes('--write')) {
  // Explicit, one-time migration of the previously empty imported snapshot.
  // Never run this against an edited or already enriched map.
  if (document.revision !== 1 || document.state.pins.length !== source.markers.length || document.state.pins.some(pin => pin.text || pin.crest || pin.banner)) throw new Error('Karte bereits bearbeitet; automatische Übernahme abgebrochen.');
  Object.assign(document.state, {pins, dominions, regionIcon:territoriesById.get('grafschaft-vortigerns-ruh').banner});
  document.revision = 2;
  document.updatedAt = new Date().toISOString();
  fs.writeFileSync(new URL('data.json', folder), JSON.stringify(document, null, 2)+'\n');
} else {
  assert.deepEqual(document.state.pins, pins, 'Ortsbeschreibungen und Heraldik stimmen mit den Quellen überein');
  assert.deepEqual(document.state.dominions, dominions);
}
console.log(`${pins.length} Orte, ${pins.filter(pin => pin.text).length} Beschreibungen, ${dominions.length} Verwaltungsebenen geprüft.`);
