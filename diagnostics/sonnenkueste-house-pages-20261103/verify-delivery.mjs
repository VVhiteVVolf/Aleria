import { readFileSync,writeFileSync,readdirSync } from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import assert from 'node:assert/strict';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
const root=new URL('../../',import.meta.url),feature=new URL('Familien Häuser und Clans/',root);
const read=file=>JSON.parse(readFileSync(new URL(file,root),'utf8'));
const baseline=read('diagnostics/sonnenkueste-house-pages-20261103/before.json');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const url=new URL(`${entry.name}${entry.isDirectory()?'/':''}`,dir);return entry.isDirectory()?walk(url):[url];});
const contents=await Promise.all(walk(new URL('Estryll/Cenyr/Sonnenkueste/',feature)).filter(url=>url.pathname.endsWith('/haus.content.mjs')).map(async url=>({url,content:(await import(url)).HOUSE_CONTENT})));
const ids=new Set(contents.map(({content})=>content.id));
for(const before of baseline){
 const family=FAMILY_REGISTRY.find(record=>record.id===before.id).family;
 const graph=Object.fromEntries(['persons','partnerships','parentages','houses','timeJumps','cadetBranches'].map(key=>[key,family[key]]));
 assert.equal(createHash('sha256').update(JSON.stringify(graph)).digest('hex'),before.graphFingerprint,before.id);
}
const delivery=contents.map(({url,content})=>({id:content.id,name:content.name,page:content.page,content:decodeURIComponent(url.pathname).split('/Aleria/')[1],image:`Familien Häuser und Clans/${content.images.scene}`,prepared:Boolean(content.prepared),original:content.images.scene.includes('original'),biographyWords:Object.values(content.biographySummary).flat().join(' ').split(/\s+/).length}));
assert.equal(delivery.length,28);
const previous=read('diagnostics/sonnenkueste-house-pages-20261103/gallery-before.json'),current=read('Gallerien/krieger/data/catalog.json');
const changedForeign=previous.houses.filter(house=>!ids.has(house.id)&&!isDeepStrictEqual(current.houses.find(entry=>entry.id===house.id),house));
const summary={houses:28,providedHouseSources:8,preparedLowerHouses:16,jungferntalKnights:4,newHouses:['haus-caerwen','haus-nerwynn'],originalIllustrations:delivery.filter(item=>item.original).length,newIllustrations:delivery.filter(item=>!item.original).length,preservedGraphs:baseline.length,scopeGalleryIllustrations:current.illustrations.filter(image=>image.houseIds.some(id=>ids.has(id))).length,foreignGalleryChangesSinceStart:changedForeign.map(house=>house.id),galleryNote:'Parallele regionale Arbeiten erhalten. Der reale begrenzte Merge ist separat auf unveränderte fremde Einträge geprüft.',houseIds:[...ids].sort()};
writeFileSync(new URL('delivery.json',import.meta.url),JSON.stringify(delivery,null,2)+'\n');
writeFileSync(new URL('verification.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
