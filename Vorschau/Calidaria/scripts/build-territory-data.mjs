/** Source markers are measured; region membership is visually reviewed. */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const realm = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = JSON.parse(await readFile(path.join(realm, 'sources/map-sources.json'), 'utf8'));
const shapeAssignments = [
  ['archonat-02','circle'], ['archonat-03','square'], ['archonat-03','circle'],
  ['imperial-domain','circle'], ['archonat-02','square'], ['imperial-domain','diamond'],
  ['archonat-04','circle'], ['archonat-01','circle'], ['archonat-01','circle'],
  ['imperial-domain','circle'], ['archonat-05','circle'], ['archonat-04','square'],
  ['archonat-05','square'], ['archonat-01','square'], ['archonat-04','circle'],
  ['archonat-05','circle'], ['archonat-07','square'], ['archonat-06','square'],
  ['archonat-06','circle'], ['archonat-07','circle'], ['archonat-06','circle'],
  ['archonat-07','circle'],
];
const regionRows = [
  ['archonat-01', 'Archonat 01', '#df927c', 'Westliche Insel mit dichtem Wald, einem langen Gebirgszug und Flussarmen.'],
  ['archonat-02', 'Archonat 02', '#e3cd52', 'Nördliche Insel mit westlichem Gebirge, dichter Vegetation und einer schmalen südlichen Landzunge.'],
  ['archonat-03', 'Archonat 03', '#63d5c7', 'Nordöstliche Insel mit Wäldern, Flusslauf und einem Gebirgszug im Norden.'],
  ['archonat-04', 'Archonat 04', '#cf83d4', 'Westlicher Teil der großen mittleren Insel mit Flussarmen, dichtem Wald und östlichem Gebirgssaum.'],
  ['archonat-05', 'Archonat 05', '#97d65a', 'Östliche Inselgruppe mit bewaldeten Küsten und mehreren getrennten Landteilen.'],
  ['archonat-06', 'Archonat 06', '#6ebcdb', 'Südwestliche Insel mit Gebirgen im Norden, einem verzweigten Fluss und dichter Vegetation.'],
  ['archonat-07', 'Archonat 07', '#b37ed3', 'Südöstliche Inselgruppe mit bewaldeten Inseln und einem Gebirge auf der nördlichen Hauptinsel.'],
  ['imperial-domain', 'Kaiserliche Domäne', '#6178d3', 'Blau markierter östlicher Teil der großen mittleren Insel; die Karte weist ihn ausdrücklich als kaiserliche Domäne aus.'],
];

const markers = source.maps.find(map => map.id === 'regions').sourceMarkers;
if (markers.length !== shapeAssignments.length) throw new Error('Marker assignments are incomplete.');
const normal = source.maps.find(map => map.id === 'normal');
for (const [index, marker] of markers.entries()) {
  if (marker.centre.some((value, axis) => Math.abs(value - normal.sourceMarkers[index].centre[axis]) > 1)) {
    throw new Error('Map variants do not share source marker centres.');
  }
}
const [width, height] = normal.sourceImageSize;
const rounded = value => Number(value.toFixed(4));
const settlements = markers.map((marker, index) => {
  const [regionId, shape] = shapeAssignments[index];
  const region = regionRows.find(row => row[0] === regionId);
  const point = marker.centre.map((coordinate, axis) => rounded(coordinate / [width, height][axis] * 100));
  return {
    id: `ort-${String(index + 1).padStart(2, '0')}`, name: `Ort ${String(index + 1).padStart(2, '0')}`,
    nameStatus: 'open', regionId, archonateId: regionId === 'imperial-domain' ? null : regionId,
    point, pin: [point[0], rounded(point[1] - (shape === 'diamond' ? 6 : 3.8))],
    label: [point[0], rounded(point[1] + (shape === 'diamond' ? 5.6 : 2.8))],
    overlayLabel: true, description: region[3], kind: shape, sourceMarkerShape: shape,
    sourcePixelCentre: marker.centre, imperialDomain: regionId === 'imperial-domain',
    kindLabel: regionId === 'imperial-domain' ? 'Ort der kaiserlichen Domäne' : 'Ort',
  };
});
const regions = regionRows.map(([id, name, colour, description]) => ({
  id, name, colour, description, nameStatus: id === 'imperial-domain' ? 'source' : 'working-number',
  kindLabel: id === 'imperial-domain' ? 'Kaiserliche Domäne' : 'Archonat',
  imperialDomain: id === 'imperial-domain', houseId: id === 'imperial-domain' ? 'house-mede' : null,
  capitalId: id === 'imperial-domain' ? settlements.find(city => city.sourceMarkerShape === 'diamond').id : null,
  cityIds: settlements.filter(city => city.regionId === id).map(city => city.id),
}));
const capital = settlements.find(city => city.sourceMarkerShape === 'diamond');
capital.name = 'Hauptstadt (Name offen)';
capital.kindLabel = 'Hauptstadt · Kaiserliche Domäne';
capital.houseId = 'house-mede';
const sourceHouseSeats = [{ houseId: 'house-mede', settlementId: capital.id, regionId: 'imperial-domain', status: 'user-confirmed-imperial-domain' }];
const variants = source.maps.map((map, index) => ({ id: map.id, number: index + 1, short: map.short,
  file: map.file, map: map.map, imageSize: map.imageSize, bakedNames: false, regionLabelsBaked: true }));
const freezeExport = (name, value) => `export const ${name} = Object.freeze(${JSON.stringify(value, null, 2)}.map(entry => Object.freeze(entry)));`;
await writeFile(path.join(realm, 'territory-data.mjs'),
  '/** Measured source markers; neutral working labels. No names or house seats are invented. */\n' +
  freezeExport('MAP_VARIANTS', variants) + '\n\n' + freezeExport('REGIONS', regions) + '\n\n' +
  'export const ARCHONATES = Object.freeze(REGIONS.filter(region => !region.imperialDomain));\n' +
  'export const IMPERIAL_DOMAIN = REGIONS.find(region => region.imperialDomain);\n\n' +
  freezeExport('SETTLEMENTS', settlements) + '\n\n' + freezeExport('SOURCE_HOUSE_SEATS', sourceHouseSeats) + '\n', 'utf8');
console.log(JSON.stringify({ archonates: regions.filter(region => !region.imperialDomain).length,
  imperialDomains: regions.filter(region => region.imperialDomain).length, settlements: settlements.length }));
