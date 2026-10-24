import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';
import {FAMILY_REGISTRY_FOLDERS} from '../../Stammbäume/assets/js/data/family-registry-folders.js';
import {createRegistryBrowserIndex,searchRegistry} from '../../Stammbäume/assets/js/modules/family-registry/registry-browser-model.js';
import {SKJAERHEIM_LOWER_CLANS} from '../../Stammbäume/assets/js/data/skjaerheim-territorial-plan.js';
import {createTerritory as faelaorn} from '../modules/faelaorn/territory-page.mjs';
import {createTerritory as skjaerheim} from '../modules/skjaerheim/territory-page.mjs';
import {stateHash} from '../../Karten/tools/generated-map-output.mjs';
import {assertFamilyBaseline} from './support/family-baseline.mjs';
import historicalFamilyIds from './support/family-baseline-20261023.json' with {type:'json'};
const root=new URL('../../',import.meta.url),read=p=>JSON.parse(fs.readFileSync(new URL(p,root),'utf8'));
const local=p=>new URL(p.replace(/^\//,''),root);
const realms=['Faelaorn','Skjaerheim'].map(name=>({name,pages:read(`Kontinente/modules/${name.toLowerCase()}/pages.source.json`).pages,territories:read(`Karten/${name}/territories.import.json`).territories,maps:read(`Karten/${name}/maps.source.json`).maps}));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('Kontinente/assets/js/herrschaft-data.js',root),'utf8'),ctx);

test('57 pages have unique identifiers, valid paths, immediate child navigation and consistent return links',()=>{
 assert.deepEqual(realms.map(r=>r.pages.length),[37,20]);
 const all=realms.flatMap(r=>r.pages);assert.equal(new Set(all.map(p=>p.id)).size,57);
 for(const r of realms)for(const p of r.pages){
  const t=r.territories.find(t=>t.id===p.id),parent=r.territories.find(candidate=>candidate.id===t.parentId);
  assert.ok(fs.existsSync(local(t.href)),t.href);
  assert.equal(p.parentHref,parent?.href||'/Kontinente/Estryll/Estryll.html');
  assert.deepEqual(p.territoryLinks,r.territories.filter(c=>c.parentId===p.id).map(c=>c.id));
  assert.equal(new Set(p.hierarchy.map(h=>h.slug)).size,p.hierarchy.length);
 }
});
test('Grannd serves Erskine, Boyd serves Muirgheal; neither is flattened into the county family register',()=>{
 const byId=new Map(realms[0].territories.map(t=>[t.id,t]));
 assert.equal(byId.get('faelaorn-herrschaft-grannd').parentId,'faelaorn-herrschaft-erskine');
 assert.equal(byId.get('faelaorn-herrschaft-boyd').parentId,'faelaorn-herrschaft-muirgheal');
 const braigh=realms[0].pages.find(p=>p.id==='faelaorn-tir-na-braigh');
 assert.ok(!braigh.families.flatMap(g=>g.houses).some(h=>h.familyId==='haus-grannd'));
 const cards=realms[0].pages.flatMap(p=>p.families.flatMap(g=>g.houses));
 assert.equal(new Set(cards.map(h=>h.familyId)).size,40,'All 39 source families plus existing Dubhan');
});
test('asylum preserves the old lieges, the Forsyth exclave is explicit, and Dubhan is displaced rather than declared extinct',()=>{
 const pages=realms[0].pages;
 for(const id of ['faelaorn-tir-na-rann','faelaorn-tir-na-mathgham']){
  const group=pages.find(p=>p.id===id).families.find(g=>g.title.startsWith('Clans im Asyl'));
  assert.equal(group.houses.length,2);assert.ok(group.houses.every(h=>h.liege===''));
 }
 assert.ok(pages.find(p=>p.id==='faelaorn-tir-na-mathgham').domains.some(d=>d.territoryId==='faelaorn-herrschaft-forsyth'));
 const dub=pages.find(p=>p.id==='faelaorn-herrschaft-dubhan');
 assert.ok(dub.copy.overview[0].includes('überleben')||dub.copy.overview[0].includes('leben noch'));
 assert.ok(dub.families.every(g=>g.variant!=='extinct'));
 const rann=pages.find(p=>p.id==='faelaorn-tir-na-rann');assert.equal(rann.families.at(-1).variant,'extinct');
});
test('current occupation and the southern war zone do not transfer albic families to Nordic lieges',()=>{
 for(const id of ['tir-na-faerna','tir-na-brann','tir-na-damh'])assert.equal(realms[0].pages.find(p=>p.id==='faelaorn-'+id).control.occupied,true);
 for(const id of ['tir-na-rann','tir-na-braigh','tir-na-mathgham'])assert.equal(realms[0].pages.find(p=>p.id==='faelaorn-'+id).control.occupied,false);
 const war=realms[1].pages.find(p=>p.id==='skjaerheim-suedliche-kriegszone');assert.equal(war.families.length,0);
 assert.match(war.copy.overview.join(' '),/Forsyth/);
 const unassigned=realms[0].pages.find(p=>p.id==='faelaorn-rann-verwaltung-offen');assert.equal(unassigned.pending,true);assert.equal(unassigned.families.length,0);
 assertFamilyBaseline(FAMILY_REGISTRY,read('Kontinente/modules/faelaorn-skjaerheim/sources/family-baseline.json'),historicalFamilyIds);
});
test('Skjaerheim has four jarls, their own thanentums and the ten clans assigned by map and user clarification',()=>{
 const r=realms[1],byId=new Map(r.territories.map(t=>[t.id,t]));
 const expected={Hjarning:'bjerk',Vargul:'hrothgar',Veknar:'knything',Hjorvik:'bjerk',Iskarn:'hrothgar',Hrodmar:'bjerk',Skath:'knything',Thirsk:'knything',Garnulf:'hrothgar',Draugmar:'stanleagh'};
 for(const c of SKJAERHEIM_LOWER_CLANS){
  assert.equal(c.jarltumSlug,expected[c.name]);
  const hesir=['Thirsk','Hjorvik'].includes(c.name),id='skjaerheim-'+(hesir?'hesirentum':'thanentum')+'-'+c.name.toLowerCase();
  assert.equal(byId.get(id).parentId,'skjaerheim-'+(hesir?'thanentum':'jarltum')+'-'+expected[c.name]);
 }
 assert.equal(r.pages.filter(p=>p.type==='Jarltum').length,4);
 assert.equal(r.pages.filter(p=>p.type==='Thanentum').length,12);
 const cards=r.pages.flatMap(p=>p.families.flatMap(g=>g.houses));
 assert.equal(new Set(cards.map(h=>h.name)).size,14);assert.ok(cards.every(h=>!h.familyId));
 assert.ok(!JSON.stringify(r.pages).includes('Fjordheim'));
});
test('shared components resolve all page data, linked children, local heraldry, portraits and map images',()=>{
 for(const r of realms)for(const p of r.pages){
  const data=(r.name==='Faelaorn'?faelaorn:skjaerheim)(p.id,ctx.window.ALERIA_HERRSCHAFT_DATA);
  assert.equal(data.meta.id,p.id);
  for(const src of [p.crestSrc,p.map?.imageSrc,...p.families.flatMap(g=>g.houses.map(h=>h.imageSrc)),...p.councilGroups.flatMap(g=>g.members.map(m=>m.imageSrc))].filter(Boolean))assert.ok(fs.existsSync(local(src)),src);
  for(const m of p.councilGroups.flatMap(g=>g.members).filter(m=>m.familyId))assert.ok(FAMILY_REGISTRY.find(f=>f.id===m.familyId).family.persons.some(person=>m.href.includes('person='+person.id)));
  assert.ok(data.view.geography.domains.every(d=>d.sections.every(s=>s.places.every(Boolean))));
 }
});
test('nine maps expose only the supplied normal/region layers, preserve edits and contain zero pins and vector borders',()=>{
 assert.deepEqual(realms.map(r=>r.maps.length),[6,3]);
 for(const r of realms)for(const m of r.maps){
  const map=read(`Karten/${m.folder}/data.json`);
  assert.equal(map.generatedStateHash,stateHash(map.state));
  assert.deepEqual(map.state.pins,[]);assert.deepEqual(map.state.regions,[]);
  assert.equal(map.state.mapImages.pins,'');
  for(const field of ['normal','regions'])assert.ok(fs.existsSync(local(map.state.mapImages[field])));
  assert.equal(map.state.dotSize,80);assert.equal(map.state.lblSize,50);
 }
});
test('all archived articles and fifteen lossless map assets retain their reviewed bytes',()=>{
 for(const s of read('Kontinente/modules/faelaorn-skjaerheim/sources/articles.manifest.json'))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('Kontinente/modules/faelaorn-skjaerheim/sources/'+s.file,root))).digest('hex'),s.sha256);
 const images=read('Kontinente/modules/faelaorn-skjaerheim/sources/images.manifest.json');assert.equal(images.length,15);
 for(const i of images){assert.equal(i.lossless,true);assert.equal(createHash('sha256').update(fs.readFileSync(new URL(i.output,root))).digest('hex'),i.sha256);}
 const index=createRegistryBrowserIndex(FAMILY_REGISTRY,FAMILY_REGISTRY_FOLDERS);
 assert.ok(searchRegistry(index,'Faelaorn Lochcearon').folders.length>0,'Existing seat aliases survive added icons');
});
