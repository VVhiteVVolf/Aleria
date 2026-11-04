/** Source geometry is stable; display names can be supplied at the end. */
import { readFile, writeFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const sources = JSON.parse(await readFile(new URL('sources/map-sources.json', root), 'utf8'));
const measured = sources.maps.find(map => map.id === 'regions');
let names = { settlements: [] };
try { names = JSON.parse(await readFile(new URL('sources/name-assignments.json', root), 'utf8')); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
const ids = Array.from({ length: 10 }, (_, index) => `ort-${String(index + 1).padStart(2, '0')}`);
const cityNames = new Map((names.settlements || []).map(entry => [entry.settlementId, entry.name]));
if (cityNames.size && (cityNames.size !== 10 || !ids.every(id => typeof cityNames.get(id) === 'string' && cityNames.get(id).trim())
    || new Set([...cityNames.values()].map(name => name.toLocaleLowerCase('de'))).size !== 10)) {
  throw new Error('Expected ten complete unique settlement-name proposals.');
}
const descriptions = [
  'Die herzogliche Hauptstadt liegt im Norden unterhalb des Bergkamms, am oberen Lauf des nach Süden fließenden Flusses.',
  'Die nordöstliche Küstenbaronie grenzt an die herzogliche Domäne und bewaldete Höhenzüge.',
  'Die nördliche Binnenbaronie liegt an einer Flussbiegung zwischen der Domäne und den östlichen Küstenlanden.',
  'Die westliche Baronie reicht bis an die schützenden Gebirgszüge und eine schmale Flussmündung.',
  'Die zentrale Baronie liegt zwischen zwei Buchten, Wäldern und niedrigen Höhenzügen.',
  'Die östliche Küstenbaronie umfasst die breite Landzunge zwischen zwei Mündungsarmen.',
  'Die südliche Mittelbaronie liegt auf einer von Wasserläufen umgebenen Landzunge mit bewaldeten Höhen.',
  'Die südwestliche Binnenbaronie grenzt an die westlichen Berge und den südlichen Wasserlauf.',
  'Die südöstliche Inselbaronie liegt jenseits der schmalen Meeresarme und ist überwiegend bewaldet.',
  'Die südwestliche Küstenbaronie umfasst einen langen bewaldeten Landstreifen zwischen Gebirge und Mündungsarmen.',
];
const round = value => Number(value.toFixed(4));
const settlements = measured.sourceMarkers.map((marker, index) => {
  const capital = index === 0, id = ids[index], regionId = capital ? 'ducal-domain' : `baronie-${String(index).padStart(2, '0')}`;
  const point = marker.centre.map((value, axis) => round(value / measured.sourceImageSize[axis] * 100));
  return { id, name: cityNames.get(id) || (capital ? 'Hauptstadt (Name offen)' : `Ort ${String(index + 1).padStart(2, '0')}`),
    nameStatus: cityNames.has(id) ? 'proposal' : 'open', regionId, point,
    pin: [point[0], round(point[1] - (capital ? 5 : 3.7))], label: [point[0], round(point[1] + 2.4)], overlayLabel: true,
    sourcePixelCentre: marker.centre, sourceMarkerShape: capital ? 'diamond' : 'square',
    kind: capital ? 'diamond' : 'square', kindLabel: capital ? 'Hauptstadt · Herzogliche Domäne' : 'Stadt einer Baronie',
    ducalDomain: capital, description: descriptions[index] };
});
if (settlements.length !== 10) throw new Error('Incomplete source marker coverage.');
const regions = settlements.map((city, index) => ({ id: city.regionId,
  name: index === 0 ? 'Herzogliche Domäne' : city.nameStatus === 'proposal' ? `Baronie ${city.name}` : `Baronie ${String(index).padStart(2, '0')}`,
  kindLabel: index === 0 ? 'Herzogliche Domäne' : 'Baronie', ducalDomain: index === 0,
  colour: index === 0 ? '#9fa83b' : '#71844b', capitalId: city.id, cityIds: [city.id], description: city.description,
  houseId: index === 0 ? 'house-ducal' : `pool-${String(index).padStart(2, '0')}` }));
const seats = [{ houseId: 'house-ducal', settlementId: 'ort-01', regionId: 'ducal-domain' },
  ...Array.from({ length: 9 }, (_, index) => ({ houseId: `pool-${String(index + 1).padStart(2, '0')}`, settlementId: ids[index + 1], regionId: regions[index + 1].id })),
  { houseId: 'pool-10', settlementId: 'ort-01', regionId: 'ducal-domain' },
  { houseId: 'pool-11', settlementId: 'ort-01', regionId: 'ducal-domain' }];
const variants = sources.maps.map(({ id, number, file, short, map, imageSize, bakedNames }) => ({ id, number, file, short, map, imageSize, bakedNames }));
const emit = (name, value) => `export const ${name} = Object.freeze(${JSON.stringify(value, null, 2)}.map(entry => Object.freeze(entry)));`;
await writeFile(new URL('territory-data.mjs', root),
  '/** Measured source geometry with proposal names and editable starting seats. */\n'
  + emit('MAP_VARIANTS', variants) + '\n\n' + emit('REGIONS', regions) + '\n\n'
  + 'export const BARONIES = Object.freeze(REGIONS.filter(region => !region.ducalDomain));\n'
  + 'export const DUCAL_DOMAIN = REGIONS.find(region => region.ducalDomain);\n\n'
  + emit('SETTLEMENTS', settlements) + '\n\n' + emit('SOURCE_HOUSE_SEATS', seats) + '\n', 'utf8');
console.log(JSON.stringify({ maps: variants.length, settlements: settlements.length, baronies: 9, capital: 'ort-01', startingHouses: seats.length, namesAssigned: cityNames.size }));
