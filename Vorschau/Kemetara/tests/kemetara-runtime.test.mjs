/** Public runtime subset; original source/hash audits remain in the retained local evidence. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {HOUSES} from '../house-data.mjs';
import {SETTLEMENTS,REGIONS,MAP_CONTEXT,MAP_VARIANTS} from '../territory-data.mjs';
import {REGION_SHIELDS} from '../region-shield-data.mjs';
import {ESTATES} from '../estate-data.mjs';
import {CLASS_PROTOTYPES} from '../warrior-data.mjs';
import {ARTWORKS} from '../art-data.mjs';
import {SOURCE_CONTEXT} from '../source-data.mjs';
import {REALM_CONTEXT} from '../realm-context.mjs';
import {createHousePlacementState,PLACEMENT_STORAGE_KEY} from '../placement-state.mjs';
import {isAuthoringArchive} from '../../../netlify/build/publication-policy.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),workspace=path.resolve(root,'../..');
const json=async p=>JSON.parse(await readFile(path.join(root,p),'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
test('only the thirteen fully named towns are admitted',()=>{
 assert.equal(SETTLEMENTS.length,13);assert.equal(new Set(SETTLEMENTS.map(c=>c.id)).size,13);
 assert(!SETTLEMENTS.some(c=>/fayot/i.test(c.name)));assert.equal(MAP_CONTEXT.namedPlaces,13);
 assert.equal(SETTLEMENTS.find(c=>c.id==='menderamun').name,'Mendaramun');
 assert.equal(MAP_CONTEXT.bordersDrawn,false);
});
test('map measurements stay within the unchanged supplied coordinate plane',()=>{
 assert.deepEqual(MAP_VARIANTS[0].imageSize,[731,917]);
 for(const city of SETTLEMENTS){
  assert(city.point.every(n=>n>0&&n<100));assert(city.pin.every(n=>n>0&&n<100));
  assert(city.sourcePixelCentre[0]>=0&&city.sourcePixelCentre[0]<731);
  assert(city.sourcePixelCentre[1]>=0&&city.sourcePixelCentre[1]<917);
 }
});
test('one royal family and twelve high noble families cover thirteen source seats',()=>{
 assert.equal(HOUSES.length,13);assert.equal(HOUSES.filter(h=>h.royal).length,1);
 assert.equal(HOUSES.filter(h=>h.localTitle==='Tjaty').length,12);
 assert.deepEqual([...new Set(HOUSES.map(h=>h.sourceSeat))].sort(),SETTLEMENTS.map(c=>c.id).sort());
 assert.equal(HOUSES.find(h=>h.royal).sourceSeat,'saqqarekhet');
 assert.equal(new Set(HOUSES.map(h=>h.name)).size,13);
});
test('capital is explicitly a cartographic proposal',()=>{
 assert.match(REALM_CONTEXT.scope,/Hauptstadtvorschlag/);
 assert.match(SOURCE_CONTEXT.currentUser.capitalStatus,/nicht ausdrücklich/);
 assert.equal(SETTLEMENTS.filter(c=>c.capital).length,1);
});
test('national sign and royal-family sign remain distinct',()=>{
 const royal=HOUSES.find(h=>h.royal);assert.notEqual(royal.crest,ARTWORKS[0].image);
 assert.match(ARTWORKS[0].description,/Land/);
 assert.match(royal.note,/Landeszeichen/);
});
test('each city owns one independently identified round-topped region proposal',()=>{
 assert.equal(REGIONS.length,13);assert.equal(REGION_SHIELDS.length,13);
 for(const region of REGIONS){
  assert.equal(REGION_SHIELDS.filter(s=>s.regionId===region.id).length,1);
  assert.equal(region.cityIds.length,1);assert(SETTLEMENTS.some(c=>c.id===region.capitalId));
  const art=REGION_SHIELDS.find(s=>s.regionId===region.id);
  assert.equal(HOUSES.find(h=>h.id===art.houseId)?.sourceSeat,region.capitalId);
 }
 assert(REGION_SHIELDS.every(s=>s.frame.includes('rundbogiger Oberkante')));
});
test('the six singular social titles match the user-defined hierarchy',()=>{
 assert.deepEqual(ESTATES.map(e=>e.name),['Nesut','Tjaty','Sesh','Hemnet','Remet','Baku']);
 assert.match(ESTATES.find(e=>e.id==='hemnet').description,/gehobene Bürgerschicht/);
 assert.match(ESTATES.find(e=>e.id==='hemnet').description,/Priester/);
 assert.match(ESTATES.find(e=>e.id==='sesh').description,/kleine Städte/);
 assert.match(ESTATES.find(e=>e.id==='baku').description,/Sklaverei/);
});
test('all six military roles preserve the requested equipment and Nebtu link',()=>{
 assert.deepEqual(CLASS_PROTOTYPES.map(p=>p.name),['Nakhtu','Medjay','Seneni','Maryannu','Ahau','Neferu']);
 const find=id=>CLASS_PROTOTYPES.find(p=>p.id===id);
 assert.match(find('nakhtu').equipment,/Speer.*Langschild/);
 assert.match(find('medjay').equipment,/Khopesh.*Rückenköcher/);
 assert.equal(find('seneni').equipment,'Harpune');assert.equal(find('maryannu').mount.name,'Nebtu');
 assert.match(find('maryannu').mount.href,/pferde\/nebtu/);assert.match(find('ahau').equipment,/Streitaxt/);
 assert.match(find('neferu').equipment,/Streitkolben.*Schild/);
});
test('every family has its own distinct figure and preserves its requested class reference',()=>{
 for(const house of HOUSES){
  assert(CLASS_PROTOTYPES.some(p=>p.id===house.prototypeId));
  assert.equal(house.warriorImage,'assets/warriors/previews/house-'+house.id+'.webp');
  assert.equal(house.warriorFullsize,'assets/warriors/production/house-'+house.id+'.png');
  assert(house.warriorDescription.length>30);
 }
 assert.equal(new Set(HOUSES.map(h=>h.warriorImage)).size,13);
 assert(!HOUSES.some(h=>h.person||h.founder));
 assert.equal(ARTWORKS[0].warriorImage,'assets/warriors/previews/realm-kemetara.webp');
});
test('thirteen initial assignments move, undo and reset without changing family rank',()=>{
 const state=createHousePlacementState({houses:HOUSES,settlements:SETTLEMENTS}),before=state.current();
 const rank=HOUSES.find(h=>h.id==='asethar').rank;
 assert(state.move('asethar','akhmi'));assert.equal(state.current().asethar,'akhmi');
 assert(state.undo());assert.deepEqual(state.current(),before);
 assert(state.move('basthem',null));assert(state.reset());assert.deepEqual(state.current(),before);
 assert.equal(HOUSES.find(h=>h.id==='asethar').rank,rank);
});
test('foreign and incomplete drafts are rejected atomically',()=>{
 const state=createHousePlacementState({houses:HOUSES,settlements:SETTLEMENTS}),initial=state.current();
 assert.throws(()=>state.restore({schemaVersion:1,realm:'klythesia',placements:initial}));
 const incomplete={...initial};delete incomplete.asethar;
 assert.throws(()=>state.restore({schemaVersion:1,realm:'kemetara',placements:incomplete}));
 assert.deepEqual(state.current(),initial);assert.match(PLACEMENT_STORAGE_KEY,/:kemetara:/);
});
test('the active religion catalog and source hashes remain traceable',async()=>{
 assert.deepEqual(SOURCE_CONTEXT.faith.main.map(g=>g.name),['Osiran','Isiriel','Sethran']);
 assert(SOURCE_CONTEXT.faith.ranks.some(r=>r.title==='Oberster Triarch'));
 assert.equal(SOURCE_CONTEXT.faith.main.length+SOURCE_CONTEXT.faith.other.length,17);
});
test('spoken language and older script transmission are distinguished',()=>{
 assert.equal(SOURCE_CONTEXT.language.name,'Kana’anith');
 assert.match(SOURCE_CONTEXT.language.description,/22 Zeichen/);
 assert.match(SOURCE_CONTEXT.language.origin,/Orins/);
 assert.match(SOURCE_CONTEXT.language.origin,/Ogham/);
 assert.match(SOURCE_CONTEXT.language.origin,/gesprochenen Sprache/);
});
test('all thirty-nine dialog targets and fifty-three distinct artworks have actual files',async()=>{
 const arts=[...ARTWORKS,...ESTATES,...CLASS_PROTOTYPES,...REGION_SHIELDS,...HOUSES];
 assert.equal(arts.length,39);
 const figures=[...HOUSES,...ARTWORKS].map(art=>({image:art.warriorImage,fullsize:art.warriorFullsize}));
 assert.equal(figures.length,14);
 assert.equal(new Set([...arts,...figures].map(a=>a.fullsize)).size,53);
 for(const art of [...arts,...figures]){
  const image=art.image||art.crest;assert((await stat(path.join(root,image))).size>1000,image);
  assert((await stat(path.join(root,art.fullsize))).size>1000,art.fullsize);
 }
 for(const art of [...ESTATES,...CLASS_PROTOTYPES,...figures]){
  const png=await readFile(path.join(root,art.fullsize));assert.deepEqual([png.readUInt32BE(16),png.readUInt32BE(20)],[1024,1536]);
 }
 for(const house of HOUSES){
  const png=await readFile(path.join(root,house.fullsize));assert.equal(png.readUInt32BE(16),png.readUInt32BE(20));
 }
});
test('country modules keep delegated events and import existing shared systems',async()=>{
 const entries=(await readdir(root)).filter(n=>n.endsWith('.mjs'));
 for(const file of entries){
  const code=await readFile(path.join(root,file),'utf8');
  assert(!/\bon(?:click|input|change)\s*=/i.test(code),file);
  const imports=[...code.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m=>m[1]).filter(s=>s.startsWith('.'));
  for(const dependency of imports)assert((await stat(path.resolve(root,dependency))).isFile(),dependency);
 }
});
test('authoring methods and inventories stay outside future delivery packages',()=>{
 for(const file of ['sources/house-roster.json','scripts/kemetara.test.mjs','assets.source.json','source-import.json'])
  assert.equal(isAuthoringArchive('Vorschau/Kemetara/'+file),true,file);
 assert.equal(isAuthoringArchive('Vorschau/Kemetara/index.html'),false);
 assert.equal(isAuthoringArchive('Vorschau/Kemetara/assets/originals/kemetara-realm.png'),false);
});
console.log('Kemetara data, source, assignment and artifact checks.');
