import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {AISLEARNEACH_HOUSE_DEFINITIONS} from '../../Stammbäume/assets/js/data/aislearneach-territorial-catalog.js';
import {BLAITHNEACH_HOUSE_DEFINITIONS} from '../../Stammbäume/assets/js/data/blaithneach-territorial-catalog.js';

const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const folders={aislearneach:'Aislearneach',blaithneach:'Blaithneach',ceitheach:'Ceitheach',dunkelhain:'Dunkelhain'};
const bundles=Object.entries(folders).map(([key,folder])=>({key,folder,...read('../modules/'+key+'/pages.source.json'),territories:read('../../Karten/'+folder+'/territories.import.json').territories,markers:read('../../Karten/'+folder+'/markers.source.json').markers}));
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../assets/js/herrschaft-data.js',import.meta.url),'utf8'),context);
const data=context.window.ALERIA_HERRSCHAFT_DATA;

test('45 modular pages retain local heraldry, council portraits and immediate subordinate links',async()=>{
 assert.equal(bundles.reduce((n,b)=>n+b.pages.length,0),45);
 for(const bundle of bundles){
  const {createTerritory}=await import('../modules/'+bundle.key+'/territory-page.mjs');
  for(const source of bundle.pages){
   const page=createTerritory(source.id,data);
   assert.equal(page.meta.id,source.id);
   for(const src of [source.crestSrc,source.map.imageSrc,...source.families.flatMap(s=>s.houses.map(h=>h.imageSrc)),...source.councilGroups.flatMap(g=>g.members.map(m=>m.imageSrc))].filter(Boolean))assert.ok(fs.existsSync(new URL('../..'+src,import.meta.url)),src);
   for(const id of source.territoryLinks)assert.equal(bundle.territories.find(t=>t.id===id).parentId,source.id);
   for(const link of page.view.geography.links||[]){assert.ok(link.bannerSrc);assert.ok(fs.existsSync(new URL('../..'+link.bannerSrc,import.meta.url)));}
  }
 }
});

test('main pages list every documented clan and sept once, including expelled and historical families',()=>{
 for(const [key,definitions,count] of [['aislearneach',AISLEARNEACH_HOUSE_DEFINITIONS,19],['blaithneach',BLAITHNEACH_HOUSE_DEFINITIONS,11]]){
  const root=bundles.find(b=>b.key===key).pages[0],houses=root.families.flatMap(g=>g.houses);
  assert.equal(houses.length,count);assert.deepEqual(new Set(houses.map(h=>h.familyId)),new Set(definitions.map(d=>d.familyId)));
 }
 const historical=bundles.find(b=>b.key==='ceitheach');
 assert.equal(historical.pages[0].families.flatMap(g=>g.houses).length,14);
 assert.ok(historical.pages.every(p=>p.councilNote.includes('keine gegenwärtige Herrschaft')));
 const ais=bundles.find(b=>b.key==='aislearneach').pages[0];
 assert.ok(ais.families.find(s=>s.title==='Ausgestoßene Clans').houses.some(h=>h.familyId==='haus-ui-faill-duibhne'));
 const clerical=bundles.find(b=>b.key==='aislearneach').pages.find(p=>p.id.endsWith('tir-na-adharcach'));
 assert.ok(clerical.families.every(s=>s.title!=='Regierender Clan'));
 assert.equal(clerical.councilGroups[0].members[0].name,'Derbforgaill');
 const wild=bundles.find(b=>b.key==='dunkelhain').pages[0];
 assert.equal(wild.families.length,0);assert.match(JSON.stringify(wild.cultureSections),/Erben der Morgenröte.*Blutmond Gefährten/);
});

test('all 344 detailed places are reachable without duplicating overview representations or making up ownership',()=>{
 let total=0;
 for(const bundle of bundles){
  const expected=bundle.markers.filter(m=>!m.overviewOf&&!m.sourceRef.navigationOnly).map(m=>m.id);
  const actual=bundle.pages.flatMap(p=>p.domains.flatMap(d=>d.sections.flatMap(s=>s.placeIds)));
  assert.deepEqual(new Set(actual),new Set(expected));assert.equal(actual.length,expected.length);total+=actual.length;
  for(const source of bundle.pages)for(const domain of source.domains){
   const territory=bundle.territories.find(t=>t.id===domain.territoryId);
   if(territory.pending){assert.equal(territory.parentId,source.id);assert.equal(territory.familyId,'');}
   else assert.equal(territory.id,source.id);
  }
 }
 assert.equal(total,344);
 const ais=bundles.find(b=>b.key==='aislearneach');
 assert.equal(ais.markers.filter(m=>m.overviewOf).length,11);
 for(const page of ais.pages.filter(p=>p.id!=='fuerstentum-aislearneach'))assert.match(page.map.href,/map=aislearneach-tir-na-/);
});

test('all 187 original council slots remain represented and all three principalities connect to the Alben hub',()=>{
 const articles=read('../../Karten/Aislearneach/sources/articles.data.json');
 const originals=articles.filter(a=>a.councilGroups?.length);
 assert.equal(originals.reduce((n,a)=>n+a.councilGroups.reduce((sum,g)=>sum+g.members.length,0),0),187);
 const sourceNames=originals.flatMap(a=>a.councilGroups.flatMap(g=>g.members.map(m=>m.name))).filter(n=>n.replace(/[\s.\-?…–—]/g,'')&&!/^vakant$/i.test(n));
 const actual=bundles.flatMap(b=>b.pages.flatMap(p=>p.councilGroups.flatMap(g=>g.members.map(m=>m.name))));
 const normalized=s=>s.normalize('NFD').replace(/\p{M}/gu,'').replace(/[^\p{L}\p{N}]/gu,'').toLowerCase();
 for(const name of sourceNames)assert.ok(actual.some(value=>normalized(value)===normalized(name)),name);
 const principalities=read('../modules/alben/principalities.source.json').principalities;
 for(const key of ['aislearneach','blaithneach','ceitheach'])assert.equal(principalities.find(p=>p.id===key).mapId,key);
});
