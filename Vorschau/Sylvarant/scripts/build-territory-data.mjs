/** Turn measured marker centres and reviewed regions into neutral runtime data. */
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = JSON.parse(await readFile(path.join(root, 'sources/map-sources.json'), 'utf8'));
const map = sources.maps[0];
const regions = [
  ['archonat-01','Archonat 01','#d67c8a','Nördliches Archonat mit langem Gebirgszug und einem nach Süden führenden Fluss.'],
  ['archonat-02','Archonat 02','#6dbfce','Nordwestliche Küstenregion mit Waldflächen und offenen Ebenen.'],
  ['archonat-03','Archonat 03','#a768bb','Zentrales Archonat mit einem Bergmassiv und bewaldeten Ebenen.'],
  ['archonat-04','Archonat 04','#d6d8ab','Östliche Küstenregion mit offenen Ebenen und einem nördlichen Gebirgssaum.'],
  ['archonat-05','Archonat 05','#9acc5a','Südwestliche Landzunge mit Wäldern und einem Gebirge im Norden.'],
  ['archonat-06','Archonat 06','#dfbf65','Südliche Landzunge mit Waldflächen und offenem Hügelland.'],
  ['archonat-07','Archonat 07','#8298c7','Zusammenhängendes blaues Südostgebiet mit langem Flusslauf. Zwei Archonat-Beschriftungen liegen innerhalb derselben ungeteilten Fläche.'],
  ['imperial-domain','Kaiserliche Domäne','#65cbac','Die auf der Karte ausdrücklich bezeichnete zentrale Domäne am verzweigten Fluss.'],
];
const assigned = [
  ['archonat-01','circle'],['archonat-01','square'],['archonat-01','circle'],
  ['archonat-02','square'],['archonat-03','square'],['archonat-04','square'],
  ['archonat-02','circle'],['archonat-04','circle'],['imperial-domain','circle'],
  ['archonat-03','circle'],['archonat-03','circle'],['archonat-02','circle'],
  ['archonat-02','circle'],['archonat-04','circle'],['imperial-domain','diamond'],
  ['archonat-07','circle'],['archonat-05','circle'],['archonat-06','circle'],
  ['archonat-06','circle'],['archonat-07','circle'],['archonat-05','circle'],
  ['archonat-07','circle'],['archonat-05','square'],['archonat-06','square'],
  ['archonat-07','circle'],['archonat-07','square'],
];
if (map.sourceMarkers.length !== 26 || assigned.length !== 26) throw new Error('Incomplete Sylvarant source markers.');
const round = value => Number(value.toFixed(4));
const settlements = map.sourceMarkers.map((marker, index) => {
  const [regionId, shape] = assigned[index], region = regions.find(row => row[0] === regionId);
  const point = marker.centre.map((value, axis) => round(value/map.sourceImageSize[axis]*100));
  const capital = shape === 'diamond';
  return { id:`ort-${String(index+1).padStart(2,'0')}`, name:capital ? 'Hauptstadt (Name offen)' : `Ort ${String(index+1).padStart(2,'0')}`,
    nameStatus:'open', regionId, archonateId:regionId === 'imperial-domain' ? null : regionId,
    point, pin:[point[0],round(Math.max(4,point[1]-(capital ? 4.8 : 3.8)))],
    label:[point[0],round(point[1]+(capital ? 3.2 : 2.8))], overlayLabel:!capital,
    description:region[3], kind:shape, sourceMarkerShape:shape, sourcePixelCentre:marker.centre,
    imperialDomain:regionId === 'imperial-domain',
    kindLabel:capital ? 'Hauptstadt · Kaiserliche Domäne' : regionId === 'imperial-domain' ? 'Ort der kaiserlichen Domäne' : 'Ort',
    ...(capital ? {houseId:'house-mede'} : {}) };
});
const capital = settlements.find(city => city.sourceMarkerShape === 'diamond');
const regionData = regions.map(([id,name,colour,description]) => ({id,name,colour,description,
  nameStatus:id === 'imperial-domain' ? 'source' : 'working-number',
  kindLabel:id === 'imperial-domain' ? 'Kaiserliche Domäne' : 'Archonat',
  imperialDomain:id === 'imperial-domain', houseId:id === 'imperial-domain' ? 'house-mede' : null,
  capitalId:id === 'imperial-domain' ? capital.id : null,
  cityIds:settlements.filter(city => city.regionId === id).map(city => city.id)}));
const variants = [{id:map.id,number:map.number,short:map.short,file:map.file,map:map.map,imageSize:map.imageSize,bakedNames:true}];
const seats = [{houseId:'house-mede',settlementId:capital.id,regionId:'imperial-domain',status:'user-confirmed-imperial-domain'}];
const emit = (name, value) => `export const ${name} = Object.freeze(${JSON.stringify(value,null,2)}.map(entry => Object.freeze(entry)));`;
await writeFile(path.join(root,'territory-data.mjs'),
  '/** Measured source markers; working numbers are not new geographical names. */\n' +
  emit('MAP_VARIANTS',variants)+'\n\n'+emit('REGIONS',regionData)+'\n\n'+
  'export const ARCHONATES = Object.freeze(REGIONS.filter(region => !region.imperialDomain));\n'+
  'export const IMPERIAL_DOMAIN = REGIONS.find(region => region.imperialDomain);\n\n'+
  emit('SETTLEMENTS',settlements)+'\n\n'+emit('SOURCE_HOUSE_SEATS',seats)+'\n','utf8');
console.log(JSON.stringify({archonates:7,imperialDomains:1,settlements:26,capital:capital.id}));
