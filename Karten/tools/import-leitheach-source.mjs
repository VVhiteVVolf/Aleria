import fs from 'node:fs/promises';
import vm from 'node:vm';
import { getRegisteredFamily } from '../../Stammbäume/assets/js/data/families.registry.js';
import { importLeitheachRegions, territoryAtPoint, connectedTerritory, folded } from '../Leitheach/region-import.mjs';
import { worldAnvilDescription, worldAnvilPlaceTitle } from '../modules/territory-places/world-anvil-description.mjs';
import { worldAnvilMarkerId } from '../modules/regions/world-anvil-geometry.mjs';

const root = new URL('../', import.meta.url), check = process.argv.includes('--check');
const read = async path => JSON.parse(await fs.readFile(new URL('Leitheach/' + path, root), 'utf8'));
const definitions = (await read('map-definitions.json')).maps;
const captures = (await read('sources/maps-20261024.capture.json')).maps;
const markerCapture = await read('sources/markers-20261024.capture.json');
const territories = (await read('territories.import.json')).territories;
const iconTypes = await read('icon-types.source.json');
const review = await read('place-review.source.json');
const family = id => getRegisteredFamily(id)?.family;
const context = vm.createContext({});
for (const file of ['category-catalog.js', 'pin-template-catalog.js', 'pin-table-presets.js']) {
  vm.runInContext(await fs.readFile(new URL('assets/js/pins/' + file, root), 'utf8'), context);
}
const catalog = context.KartoCategoryCatalog, presets = context.KartoPinTablePresets;
const compact = value => folded(value).replace(/[^a-z0-9]/g, '');
const sourceById = new Map(markerCapture.markers.map(marker => [marker.id, marker]));
if (sourceById.size !== markerCapture.markers.length) throw new Error('Doppelte World-Anvil-Quellenkennung');
for (const id of Object.keys(review.markers)) if (!sourceById.has(id)) throw new Error('Prüfeintrag ohne Quellenmarker: ' + id);
const descriptions = [], maps = [], coverage = [], prepared = [];
const seatMatches = title => territories.filter(t => t.id !== 'fuerstentum-leitheach' && t.seat && compact(t.seat) === compact(title));

for (const capture of captures) {
  const definition = definitions.find(d => d.sourceId === capture.mapId);
  if (!definition) throw new Error('Nicht registrierte Quellenkarte');
  const main = definition.slug === 'leitheach';
  const mapId = main ? 'leitheach' : 'leitheach-' + definition.slug;
  const folder = main ? 'Leitheach' : 'Leitheach/' + definition.slug;
  const regions = importLeitheachRegions(capture, definition, definitions, territories, family);
  const shapeIds = new Set(capture.polygons.map(worldAnvilMarkerId));
  const rows = capture.rows.filter(row => row.coordinate && !shapeIds.has(row.edit.split('/').at(-2)));
  const markers = [];
  for (const row of rows) {
    const id = row.edit.split('/').at(-2), raw = sourceById.get(id);
    if (!raw || raw.mapId !== capture.mapId) throw new Error('Fehlender Markerbeleg: ' + id);
    const sourcePin = capture.pins.find(pin => pin.class.includes('marker-' + id));
    if (!sourcePin) throw new Error('Marker ohne sichtbares Quellenzeichen: ' + id);
    const file = sourcePin.src.split('/').at(-1).split('?')[0];
    const navigation = main && /^(grey_city|violet_city|black_city|red_castle|green_city|blue_city)\.png$/.test(file);
    if (navigation) {
      coverage.push({ id, mapId, role: 'submap-link', title: raw.title || raw.listTitle, sourceUrl: raw.url, targets: raw.targets });
      continue;
    }
    const decision = review.markers[id];
    let category = decision?.category || iconTypes[file];
    const sourceTitle = worldAnvilPlaceTitle(raw);
    if (compact(sourceTitle) === 'dunathar') category = 'Hauptstadt';
    if (!category) throw new Error('Ungeprüftes Quellensymbol: ' + file + ' / ' + id);
    const type = catalog.definition({ label: category });
    if (!type) throw new Error('Unbekannte Kategorie: ' + category);
    const x = Number(raw.x), y = Number(raw.y);
    const [width, height] = [capture.image.width, capture.image.height];
    if (![x,y].every(Number.isFinite) || x < 0 || y < 0 || x > width || y > height) throw new Error('Unvollständige oder ungültige Quellenkoordinate: ' + id);
    const point = [x / width, 1 - y / height];
    const title = sourceTitle || `Unbenannte ${category} (${id.slice(0, 8)})`;
    const geoTerritoryId = territoryAtPoint(point, regions, definition.territoryId);
    const connection = connectedTerritory(point, regions, [width,height], review.connectionTolerancePixels);
    const seats = seatMatches(sourceTitle).filter(t => main || t.mapId === mapId);
    // Repeated old seat values are not a unique proof of a family's location.
    const territoryId = decision?.territoryId || connection?.dominionId || (seats.length === 1 ? seats[0].id : geoTerritoryId);
    const templateId = presets.forCategory(category)?.templateId || (/siedlung|Stadt|Dorf|Hauptstadt/.test(category) ? 'siedlung' : /Burg|Turm|Festung/.test(category) ? 'militaer' : category === 'Taverne' ? 'gastbetrieb' : category === 'Ruine' ? 'ruine' : 'natur');
    const missing = [...!sourceTitle ? ['Name fehlt'] : [], ...!raw.description.trim() ? ['Beschreibung fehlt'] : []];
    const sourceRef = { type: 'world-anvil', mapId: capture.mapId, markerId: id, url: raw.url,
      coordinate: { x, y, origin: 'bottom-left', imageSize: [width, height] },
      assignment: decision?.territoryId ? 'reviewed-description' : connection ? 'source-clan-connection' : seats.length === 1 ? 'documented-seat' : 'region-outline', sourceIcon: file,
      ...(connection ? { connectionMarkerId: connection.source.markerId } : {}),
      ...(decision ? { reviewReason: decision.reason } : {}),
      ...(missing.length ? { missing } : {}), ...(raw.targets.length ? { targets: raw.targets } : {}),
      ...(raw.links.length ? { links: raw.links } : {}) };
    const icon = type.marker || (review.categoryIcons[category] ? '/Karten/assets/icons/welt/' + review.categoryIcons[category] : '');
    if (!icon) throw new Error('Fehlendes sichtbares Aleria-Symbol: ' + category);
    const marker = { id, title, category, templateId, icon, x, y, territoryId, sourceRef,
      ...(decision?.residentFamilyIds ? { residentFamilyIds: decision.residentFamilyIds } : {}) };
    markers.push(marker);
    descriptions.push({ id, mapId, text: worldAnvilDescription(raw.description), fields: {
      ...missing.length ? { Quellenstand: missing.join(' · ') } : {}, Quelle: raw.url,
    } });
    coverage.push({ id, mapId, role: 'place', title, territoryId });
  }
  maps.push({ id: mapId, regions });
  prepared.push([folder.replace(/^Leitheach\/?/, '') + (main ? '' : '/') + 'markers.source.json', {
    schemaVersion: 1, imageSize: [capture.image.width, capture.image.height], coordinateOrigin: 'bottom-left',
    sourceMapId: capture.mapId, mapId, markers,
  }]);
}
if (coverage.length !== markerCapture.expected || coverage.length !== sourceById.size) throw new Error('Unvollständiger Kartenabgleich: ' + coverage.length);
prepared.push(['places.source.json', { schemaVersion: 1, descriptions }]);
prepared.push(['regions.source.json', { schemaVersion: 1, maps }]);
prepared.push(['sources/import-coverage.json', { schemaVersion: 1, expected: markerCapture.expected, markers: coverage }]);
for (const [path, data] of prepared) {
  const url = new URL('Leitheach/' + path, root), text = JSON.stringify(data, null, 2) + '\n';
  if (check) {
    if (await fs.readFile(url, 'utf8') !== text) throw new Error('Quellenabgleich veraltet: ' + path);
  } else await fs.writeFile(url, text, 'utf8');
}
console.log(`Leitheach: ${descriptions.length} Orte und ${maps.reduce((n,m) => n + m.regions.length, 0)} Grenzen ${check ? 'geprüft' : 'übernommen'}.`);
