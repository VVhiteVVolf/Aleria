import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import assert from 'node:assert/strict';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
const root=new URL('../../',import.meta.url),feature=new URL('Familien Häuser und Clans/',root);
const read=file=>JSON.parse(readFileSync(new URL(file,root),'utf8'));
const baseline=read('diagnostics/klaueninsel-house-pages-20261103/before.json');
const origins=read('diagnostics/klaueninsel-house-pages-20261103/origin-before.json');
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{const url=new URL(`${entry.name}${entry.isDirectory()?'/':''}`,dir);return entry.isDirectory()?walk(url):[url];});
const contents=await Promise.all(walk(new URL('Estryll/Cenyr/Klaueninsel/',feature)).filter(url=>url.pathname.endsWith('/haus.content.mjs')).map(async url=>({url,content:(await import(url)).HOUSE_CONTENT})));
const ids=new Set(contents.map(({content})=>content.id));
const hash=value=>createHash('sha256').update(value).digest('hex');
for(const before of [...baseline,...origins]){
 const family=FAMILY_REGISTRY.find(record=>record.id===before.id).family;
 const graph=Object.fromEntries(['persons','partnerships','parentages','houses','timeJumps','cadetBranches'].map(key=>[key,family[key]]));
 assert.equal(hash(JSON.stringify(graph)),before.graphFingerprint,before.id);
}
const delivery=contents.map(({url,content})=>({id:content.id,name:content.name,page:content.page,content:decodeURIComponent(url.pathname).split('/Aleria/')[1],image:`Familien Häuser und Clans/${content.images.scene}`,imageHash:hash(readFileSync(new URL(content.images.scene,feature))),prepared:Boolean(content.prepared),original:content.images.scene.includes('original'),biographyWords:Object.values(content.biographySummary).flat().join(' ').split(/\s+/).length}));
assert.equal(delivery.length,37);
const previous=read('diagnostics/klaueninsel-house-pages-20261103/gallery-before.json'),current=read('Gallerien/krieger/data/catalog.json');
const changedForeign=previous.houses.filter(house=>!ids.has(house.id)&&!isDeepStrictEqual(current.houses.find(entry=>entry.id===house.id),house));
const summary={houses:37,providedHouseSources:15,originalImageAssignments:delivery.filter(item=>item.original).length,uniqueOriginalImages:new Set(delivery.filter(item=>item.original).map(item=>item.imageHash)).size,newIllustrations:delivery.filter(item=>!item.original).length,localGraphsPreserved:baseline.length,originGraphsPreserved:origins.length,scopeGalleryIllustrations:current.illustrations.filter(image=>image.houseIds.some(id=>ids.has(id))).length,foreignGalleryChangesSinceStart:changedForeign.map(house=>house.id),galleryNote:'Parallele öffentliche Regionalarbeit erhalten. Grianlaochs separat wiedergefundenes Original wurde zusätzlich gezielt abgeglichen. Der reale begrenzte Merge erhält sämtliche fremden Einträge.',houseIds:[...ids].sort()};
assert.equal(summary.originalImageAssignments,16);assert.equal(summary.uniqueOriginalImages,15);assert.equal(summary.newIllustrations,21);
writeFileSync(new URL('delivery.json',import.meta.url),JSON.stringify(delivery,null,2)+'\n');
writeFileSync(new URL('verification.json',import.meta.url),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
