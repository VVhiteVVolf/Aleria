/** Revised Venalys geography; older IDs and names remain independently stable. */
import { readFile,writeFile } from 'node:fs/promises';
import { districts as previousDistricts,pointsOfInterest as previousPoints } from '../sources/map-revision-20261104/previous-territory-data.mjs';

const realm = new URL('../',import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path,realm),'utf8'));
const maps = await json('sources/active-map-sources.json');
const measured = await json('sources/map-revision-20261104/district-geometry.json');
const observations = await json('sources/map-revision-20261104/poi-observations.json');
const coordinates = pixel => pixel.map((value,axis) => +(value/observations.measurementSize[axis]*100).toFixed(5));
const districts = previousDistricts.map(district => {
  const geometry = measured.districts.find(item => item.id === district.id);
  if (!geometry) throw new Error(`Missing retained Venalys district: ${district.id}`);
  return { ...district,point:geometry.point,polygon:geometry.polygon };
});
const unmapped = new Set(observations.unmappedIds);
const previousIds = new Set(previousPoints.map(point => point.id));
if (observations.newPoints.some(point => previousIds.has(point.id)) || observations.unmappedIds.some(id => !previousIds.has(id))) {
  throw new Error('The revised Venalys point IDs would overwrite an existing identity.');
}
const description = kind => kind === 'Dorf' ? 'Dorf im Flussland vor Venalys. Der genaue Siedlungsuntertyp bleibt offen.'
  : kind === 'Küstensiedlung' ? 'Ein größeres Gebäudeensemble am Ufer. Seine genaue Rechtsstellung und Nutzung bleiben offen.'
  : kind === 'Anwesen' ? 'Anwesen im Umland von Venalys; ein zusammengehöriges Gebäudeensemble wird als ein Ort geführt.'
  : 'Taverne, Herberge oder Bordell im Umland von Venalys; die genaue Nutzung bleibt offen.';
const pointsOfInterest = previousPoints.map(point => {
  if (unmapped.has(point.id)) return { ...point,point:null,status:'unmapped',description:'Der Standort ist auf der aktuellen Karte nicht verortet. Vorhandene Hauszuordnungen bleiben erhalten.' };
  const relocated = observations.nameRelocations[point.id];
  return relocated ? { ...point,point:coordinates(relocated),description:description(point.kind) } : { ...point };
});
for (const point of observations.newPoints) {
  pointsOfInterest.push({ id:point.id,name:point.name,kind:point.kind,point:coordinates(point.pixel),
    description:description(point.kind),sourceKind:point.sourceKind });
}
if (districts.length !== 13 || new Set(pointsOfInterest.map(point => point.id)).size !== pointsOfInterest.length) throw new Error('Incomplete revised Venalys geography.');
const emit = (name,value) => `export const ${name} = Object.freeze(${JSON.stringify(value,null,2)});`;
await writeFile(new URL('territory-data.mjs',realm),
  '// Revised supplied Venalys maps, 4 November 2026. Stable identities retain earlier draft links.\n'
  + [emit('mapGeometry',maps.geometry),emit('districts',districts),emit('pointsOfInterest',pointsOfInterest),
    emit('legacyPointIds',previousPoints.map(point => point.id))].join('\n\n')+'\n','utf8');
console.log(JSON.stringify({ districts:districts.length,previousPoints:previousPoints.length,
  mappedPoints:pointsOfInterest.filter(point => point.point).length,unmappedPoints:unmapped.size,newPoints:observations.newPoints.length }));
