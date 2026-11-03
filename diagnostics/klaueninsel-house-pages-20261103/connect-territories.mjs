// Direkte Hausseitenziele; örtliche Auswahl und historische Grenzen bleiben erhalten.
import {readdirSync,readFileSync,writeFileSync} from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
const version='20261103-klaueninsel-v1';
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):[path.join(dir,entry.name)]);
const pages=new Map();
for(const file of walk('Familien Häuser und Clans/Estryll/Cenyr/Klaueninsel').filter(file=>path.basename(file)==='haus.content.mjs')){
 const {HOUSE_CONTENT:content}=await import(pathToFileURL(path.resolve(file)));pages.set(content.id,content.page||'haus.html');
}
if(pages.size!==37)throw new Error(`37 Hausquellen erwartet, ${pages.size} gefunden.`);
const directory='Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel';
let links=0;const placement=new Map();
for(const file of walk(directory).filter(file=>file.endsWith('.data.mjs'))){
 const source=readFileSync(file,'utf8'),marker='export default createTerritory(',start=source.indexOf(marker)+marker.length;
 if(start<marker.length)throw new Error(`Unbekanntes Gebietsformat:${file}`);
 const data=JSON.parse(source.slice(start,source.lastIndexOf(');')));
 if(data.id==='herrschaft-krallenspitze'&&!data.families.some(section=>section.houses.some(house=>house.familyId==='haus-llafnfor'))){
  data.families.push({title:'Ritterhäuser im Gefolge',houses:[{name:'Llafnfor',familyId:'haus-llafnfor',imageSrc:'/Stammbäume/assets/images/houses/Klaueninsel/haus-llafnfor.png',liege:"Haus Dyfrgi O'Caer Cryftlawd",rank:'Ritterherrenhaus'}]});
 }
 for(const section of data.families)for(const house of section.houses){
  if(!pages.has(house.familyId))continue;
  house.href=`/Familien%20H%C3%A4user%20und%20Clans/${pages.get(house.familyId)}?haus=${house.familyId}`;
  placement.set(house.familyId,[...(placement.get(house.familyId)||[]),data.id]);links++;
 }
 const next=source.slice(0,start).replaceAll('klaueninseln-20261019',version)+JSON.stringify(data,null,2)+');\n';
 writeFileSync(file,next.replace(/\r+\n/g,'\n').replaceAll('\n',source.includes('\r\n')?'\r\n':'\n'));
}
const registry='Kontinente/kontinente.registry.js';
writeFileSync(registry,readFileSync(registry,'utf8').replace(/(Grafschaft Klaueninsel\/[^"\n]+\.data\.mjs\?v=)[^"\n]+/g,`$1${version}`));
for(const file of walk(directory).filter(file=>file.endsWith('.html')))writeFileSync(file,readFileSync(file,'utf8').replace(/kontinente\.registry\.js\?v=[^"']+/g,`kontinente.registry.js?v=${version}`));
for(const file of ['Familien Häuser und Clans/haus.html','Familien Häuser und Clans/kleinehaeuser.html','Stammbäume/assets/js/data/families.registry.js','Gallerien/krieger/warrior-gallery.mjs'])writeFileSync(file,readFileSync(file,'utf8').replaceAll('20261103-sonnenkueste-v1',version));
writeFileSync(new URL('territory-placement.json',import.meta.url),JSON.stringify(Object.fromEntries(placement),null,2)+'\n');
console.log(`${links} direkte Links für ${pages.size} Hausseiten, ${placement.size} unterschiedliche Häuser im örtlichen Gebietsregister.`);
