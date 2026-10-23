import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateRegions} from '../modules/regions/region-model.mjs';
import {convertRenderedRegion,worldAnvilMarkerId} from '../modules/regions/world-anvil-geometry.mjs';

const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const capture=read('../Aislearneach/sources/world-anvil.capture.json');
const names=read('../Aislearneach/sources/names.decisions.json');
const bundles=['Aislearneach','Blaithneach','Ceitheach','Dunkelhain'].map(folder=>({
 folder,...read('../'+folder+'/maps.source.json'),
 markers:read('../'+folder+'/markers.source.json').markers,
 territories:read('../'+folder+'/territories.import.json').territories,
}));
const maps=bundles.flatMap(b=>b.maps.map(m=>({...m,bundle:b,state:read('../'+m.folder+'/data.json').state})));
const pins=maps.flatMap(m=>m.state.pins);
const plain=s=>s.replace(/\[\/?(?:h1|quote|b|i)\]/gi,'').replace(/\*/g,'').replace(/\s+/g,' ').trim();

test('nine maps preserve all 434 source IDs exactly once: 360 points and 74 geometry objects',()=>{
 assert.equal(maps.length,9);assert.equal(capture.maps.length,9);
 const ids=[];
 for(const map of maps){
  const source=capture.maps.find(s=>s.mapId===map.sourceMapId);
  assert.equal(source.markers.length,source.rows.length);
  assert.ok(source.markers.every(m=>typeof m.formTitle==='string'));
  const actual=map.state.pins.map(p=>p.sourceRef.markerId).concat(map.state.regions.map(r=>r.source.markerId));
  assert.deepEqual(new Set(actual),new Set(source.markers.map(m=>m.id)));
  assert.equal(actual.length,source.markers.length);ids.push(...actual);
  assert.doesNotThrow(()=>validateRegions(map.state.regions));
 }
 assert.equal(ids.length,434);assert.equal(new Set(ids).size,434);
 assert.equal(pins.length,360);assert.equal(maps.reduce((n,m)=>n+m.state.regions.length,0),74);
 assert.equal(maps.find(m=>m.id==='ceitheach').state.pins.length,0);
});

test('native image coordinates, all six descriptions and existing marker templates survive the import',()=>{
 const c=vm.createContext({});
 for(const file of ['category-catalog.js','pin-template-catalog.js'])vm.runInContext(fs.readFileSync(new URL('../assets/js/pins/'+file,import.meta.url),'utf8'),c);
 for(const map of maps){
  const source=capture.maps.find(s=>s.mapId===map.sourceMapId);
  assert.deepEqual(map.imageSize,[source.image.width,source.image.height]);
  assert.ok(fs.existsSync(new URL('../..'+map.imageSrc,import.meta.url)));
  assert.equal(map.state.dotSize,80);assert.equal(map.state.lblSize,50);
  for(const pin of map.state.pins){
   const raw=source.markers.find(m=>m.id===pin.sourceRef.markerId);
   assert.equal(pin.x,Number(raw.x)/map.imageSize[0]);assert.equal(pin.y,1-Number(raw.y)/map.imageSize[1]);
   assert.equal(plain(pin.text),plain(raw.description));
   assert.ok(c.KartoCategoryCatalog.definition({id:pin.cat}));assert.ok(c.KartoPinTemplateCatalog.get(pin.templateId));
   assert.ok(map.bundle.territories.some(t=>t.id===pin.dominionId));
   for(const src of [pin.pinMarker,pin.crest,pin.banner].filter(Boolean))assert.ok(fs.existsSync(new URL('../..'+src,import.meta.url)),src);
  }
 }
 assert.equal(pins.filter(p=>p.text).length,6);
});

test('232 unique new names apply only to settlements; missing other names and potential lordships stay explicit',()=>{
 assert.equal(names.length,232);assert.equal(new Set(names.map(n=>n.name.toLocaleLowerCase('de'))).size,232);
 const markers=bundles.flatMap(b=>b.markers);
 for(const name of names){
  const pin=markers.find(p=>p.sourceRef.markerId===name.markerId);
  assert.equal(pin.title,name.name);assert.equal(pin.sourceRef.nameStatus,'generated');
  assert.ok(['Dorf','Bauernsiedlung','Waldsiedlung','Flusssiedlung','Hafensiedlung','Kirchensiedlung','Klostersiedlung','Handelssiedlung','Rosszuchtsiedlung','Brauersiedlung'].includes(pin.category),pin.category);
 }
 assert.equal(markers.filter(m=>m.sourceRef.nameStatus==='missing').length,70);
 for(const b of bundles)for(const t of b.territories.filter(t=>t.pending)){
  assert.equal(t.familyId,'');assert.equal(t.house,'');assert.equal(t.href,'');
  for(const pin of pins.filter(p=>p.dominionId===t.id))assert.equal(pin.table.find(r=>r.k==='Lehensherr').v,'Offen');
 }
});

test('five map links navigate to detailed maps; forest and mine glyphs use their reviewed categories',()=>{
 const markers=bundles.flatMap(b=>b.markers),links=markers.filter(m=>m.sourceRef.navigationOnly);
 assert.equal(links.length,5);
 for(const marker of links){
  const target=maps.find(m=>m.id===marker.sourceRef.localTargetMapId);
  assert.ok(target);assert.equal(target.parentMapId,'aislearneach');
  assert.equal(pins.find(p=>p.id===marker.id).bannerLink,'/Karten/karte.html?map='+target.id);
 }
 for(const marker of markers.filter(m=>m.sourceRef.title==='Forest'))assert.equal(marker.category,'Waldsiedlung');
 for(const marker of markers.filter(m=>m.sourceRef.title==='Mine')){assert.equal(marker.category,'Mine');assert.equal(marker.sourceRef.nameStatus,'missing');}
 const clerical=pins.find(p=>p.title==='Foraoise');
 assert.equal(clerical.table.find(r=>r.k==='Lehensherr').v,'Sagarth von Tir na Adharcach');
});

test('independent rendered axes account for image-height rounding without changing legacy conversion',()=>{
 const image={width:1000,height:500,rect:{left:10,top:20,width:500,height:249}};
 const shape={class:'marker-polygon marker-00000000-0000-0000-0000-000000000001',d:'M10 20L510 20L510 269z',svg:{viewBox:'0 0 600 300',rect:{left:0,top:0,width:600,height:300}}};
 assert.deepEqual(convertRenderedRegion(shape,image,{independentAxes:true}).paths[0],[[0,0],[1,0],[1,1]]);
 assert.deepEqual(convertRenderedRegion(shape,image).paths[0],[[0,0],[1,0],[1,0.996]]);
 assert.equal(worldAnvilMarkerId(shape),'00000000-0000-0000-0000-000000000001');
 for(const map of maps){
  const raw=capture.maps.find(m=>m.mapId===map.sourceMapId);
  for(const region of map.state.regions){
   const shape=raw.polygons.find(s=>worldAnvilMarkerId(s)===region.source.markerId);
   const converted=convertRenderedRegion(shape,raw.image,{independentAxes:true});
   assert.deepEqual(region.paths,converted.paths);
  }
 }
});
