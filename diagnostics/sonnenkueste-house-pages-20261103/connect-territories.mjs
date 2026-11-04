// Einmaliger örtlicher Linkabgleich; gemeinsame Laufzeitdarstellung unverändert.
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const version = '20261103-sonnenkueste-v1';
const walk = dir => readdirSync(dir, { withFileTypes: true }).flatMap(entry => entry.isDirectory() ? walk(path.join(dir,entry.name)) : [path.join(dir,entry.name)]);
const pages = new Map();
for (const file of walk('Familien Häuser und Clans/Estryll/Cenyr/Sonnenkueste').filter(file=>path.basename(file)==='haus.content.mjs')) {
 const {HOUSE_CONTENT:content}=await import(pathToFileURL(path.resolve(file)));
 pages.set(content.id,content.page||'haus.html');
}
if(pages.size!==28)throw new Error(`Erwartet:28 Hausseiten, vorhanden:${pages.size}`);
const directory='Kontinente/Estryll/Königreich Cenyr/Grafschaft Sonnenküste';
let links=0;
for(const file of walk(directory).filter(file=>file.endsWith('.data.mjs'))){
 const source=readFileSync(file,'utf8'), marker='export default createTerritory(',start=source.indexOf(marker)+marker.length;
 if(start<marker.length)throw new Error(`Unbekanntes Format:${file}`);
 const data=JSON.parse(source.slice(start,source.lastIndexOf(');')));
 if(data.id==='baronie-jungferntal'){
  const knights=data.families.find(section=>section.houses.some(house=>house.familyId==='haus-rhelian'));
  if(!knights)throw new Error('Jungferntal-Rittersektion fehlt');
  for(const slug of ['caerwen','nerwynn'])if(!knights.houses.some(house=>house.familyId===`haus-${slug}`))knights.houses.push({
   name:slug[0].toUpperCase()+slug.slice(1),familyId:`haus-${slug}`,imageSrc:`/Stammbäume/assets/images/houses/Sonnenküste/Jungferntal/haus-${slug}.png`,seat:'Carngol',liege:"Haus Morforwyn O'Carngol",rank:'Ritterherrenhaus',featured:false
  });
  for(const house of knights.houses){house.liege="Haus Morforwyn O'Carngol";delete house.featuredLabel;}
 }
 for(const section of data.families)for(const house of section.houses){
  if(!pages.has(house.familyId))continue;
  house.href=`/Familien%20H%C3%A4user%20und%20Clans/${pages.get(house.familyId)}?haus=${house.familyId}`;links++;
 }
 const updated=source.slice(0,start).replaceAll('sonnenkueste-20261019',version)+JSON.stringify(data,null,2)+');\n';
 writeFileSync(file,updated.replace(/\r+\n/g,'\n').replaceAll('\n',source.includes('\r\n')?'\r\n':'\n'));
}
const registry='Kontinente/kontinente.registry.js';
writeFileSync(registry,readFileSync(registry,'utf8').replace(/(Grafschaft Sonnenküste\/[^"\n]+\.data\.mjs\?v=)sonnenkueste-20261019/g,`$1${version}`));
for(const file of walk(directory).filter(file=>file.endsWith('.html')))writeFileSync(file,readFileSync(file,'utf8').replace(/kontinente\.registry\.js\?v=[^"']+/g,`kontinente.registry.js?v=${version}`));
for(const file of ['Familien Häuser und Clans/haus.html','Familien Häuser und Clans/kleinehaeuser.html','Stammbäume/assets/js/data/families.registry.js','Gallerien/krieger/warrior-gallery.mjs'])writeFileSync(file,readFileSync(file,'utf8').replaceAll('20261103-silberinsel-v1',version));
console.log(`${links} direkte Links für ${pages.size} Hausseiten; vier Jungferntal-Ritter unter Morforwyn.`);
