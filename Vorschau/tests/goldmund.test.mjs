import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {houses,counties,regions,settlements,realmDesigns,createMapProposal} from '../Goldmund/realm-data.mjs';
import {createDesignState} from '../Goldmund/design-state.mjs';
import {escapeHtml,renderCollectiveName,renderCounties,renderSettlements,renderRealmDesigns,renderNewHouses,renderRevisedHouses,renderHouseDetails} from '../Goldmund/proposal-render.mjs';

const root=new URL('../Goldmund/',import.meta.url);
const readJson=async file=>JSON.parse(await readFile(new URL(file,root),'utf8'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('Goldmund covers three counties, eight regions and sixteen houses with the retained source families',()=>{
 assert.equal(counties.length,3);
 assert.equal(regions.length,8);
 assert.equal(settlements.length,8);
 assert.equal(houses.length,16);
 for(const list of [counties,regions,settlements,houses,realmDesigns])assert.equal(new Set(list.map(item=>item.id)).size,list.length);
 assert.deepEqual(houses.filter(house=>house.sourceSeat!==null).map(({id,sourceSeat,rank})=>({id,sourceSeat,rank})),[
  {id:'goldveld',sourceSeat:'thronholt',rank:'prince'},
  {id:'roden',sourceSeat:'thronholt',rank:'knight-prince'}
 ]);
 assert.equal(houses.filter(house=>house.source==='Geliefertes Haus').length,5);
 assert.equal(houses.filter(house=>house.proposed).length,11);
 assert.equal(houses.filter(house=>house.sourceSeat===null).length,14);
 assert.ok(houses.filter(house=>house.proposed).every(house=>house.original===null&&house.sourceSeat===null));
 assert.ok(houses.find(house=>house.id==='aurelshain').theme.includes('Pferdezucht'));
 for(const region of regions){
  assert.ok(counties.some(county=>county.id===region.county),region.id);
  assert.ok(settlements.some(seat=>seat.id===region.seat&&seat.region===region.id&&seat.county===region.county),region.id);
 }
 for(const seat of settlements)for(const point of [seat.point,seat.pin])assert.ok(point.length===2&&point.every(value=>Number.isFinite(value)&&value>=0&&value<=100),seat.id);
});

test('locked Thronholt families cannot move while local house placements support undo and reset',()=>{
 const state=createDesignState(),baseline=state.current(),source=structuredClone(houses);
 assert.equal(state.canMove('goldveld'),false);
 assert.equal(state.canMove('roden'),false);
 assert.equal(state.move('goldveld','bregen'),false);
 assert.equal(state.move('roden',null),false);
 assert.deepEqual(state.current(),baseline);
 assert.equal(state.move('broeck','haarlen'),true);
 assert.equal(state.move('broeck','haarlen'),false);
 assert.equal(state.move('aurelshain','bramsen'),true);
 assert.equal(state.undo(),true);
 assert.equal(state.currentPlacements().aurelshain,null);
 assert.equal(state.currentPlacements().broeck,'haarlen');
 assert.equal(state.reset(),true);
 assert.deepEqual(state.current(),baseline);
 assert.equal(state.undo(),true);
 assert.equal(state.currentPlacements().broeck,'haarlen');
 assert.deepEqual(houses,source);
 const exposed=state.current();exposed.placements.broeck='bregen';exposed.design.collectiveName='Changed';
 assert.equal(state.currentPlacements().broeck,'haarlen');
 assert.notEqual(state.currentDesign().collectiveName,'Changed');
 const map=createMapProposal(state.currentPlacements());
 assert.equal(map.clans.find(house=>house.id==='goldveld').seat,'thronholt');
 assert.equal(map.clans.find(house=>house.id==='broeck').seat,'haarlen');
 assert.equal(createDesignState().currentPlacements().broeck,null);
});

test('names, realm crest choice and placements round-trip together and restore atomically',()=>{
 const state=createDesignState(),second=createDesignState();
 assert.equal(state.rename('collective',null,'  Goldener Bund  '),true);
 assert.equal(state.rename('county',counties[0].id,'Kronenlande'),true);
 assert.equal(state.rename('region',regions[0].id,'Hofmark'),true);
 assert.equal(state.chooseCrest(realmDesigns[1].id),true);
 assert.equal(state.move('lanette','hartenstein'),true);
 second.restore(JSON.parse(state.serialize()));
 assert.deepEqual(second.current(),state.current());
 const saved=second.current();
 const invalidSnapshots=[
  {},{...saved,realm:'other'},
  {...saved,placements:{broeck:'bregen'}},
  {...saved,placements:{...saved.placements,roden:'bregen'}},
  {...saved,placements:{...saved.placements,adrard:'unknown'}},
  {...saved,design:{...saved.design,realmCrest:'unknown'}},
  {...saved,design:{...saved.design,countyNames:{}}},
  {...saved,design:{...saved.design,regionNames:{...saved.design.regionNames,unknown:'Unbekannt'}}},
  {...saved,design:{...saved.design,collectiveName:'\u0000Bad'}}
 ];
 for(const value of invalidSnapshots){assert.throws(()=>second.restore(value));assert.deepEqual(second.current(),saved);}
 for(const change of [()=>second.move('unknown','bregen'),()=>second.move('broeck','unknown'),()=>second.rename('county','unknown','Name'),()=>second.rename('region',regions[0].id,'x'),()=>second.chooseCrest('unknown')]){
  assert.throws(change);assert.deepEqual(second.current(),saved);
 }
 assert.equal(state.undo(),true);
 assert.equal(state.currentPlacements().lanette,null);
 assert.equal(state.currentDesign().realmCrest,realmDesigns[1].id);
 assert.equal(state.reset(),true);
 assert.deepEqual(state.current(),createDesignState().current());
});

test('all supplied originals retain their SHA256 and retired crests remain archived',async()=>{
 const manifest=await readJson('assets.source.json');
 assert.equal(manifest.length,12);
 assert.equal(new Set(manifest.map(entry=>entry.sourceFile)).size,12);
 for(const entry of manifest){
  assert.equal(hash(await readFile(new URL(entry.file,root))),entry.sha256,entry.file);
  assert.equal(hash(await readFile(new URL(entry.preview,root))),entry.previewSha256,entry.preview);
  assert.ok(entry.dimensions.every(value=>Number.isInteger(value)&&value>0));
  assert.ok(entry.previewDimensions.every(value=>Number.isInteger(value)&&value>0));
 }
 assert.deepEqual(manifest.find(entry=>entry.sourceFile==='Goldmund.png').dimensions,[8192,5318]);
 assert.deepEqual(manifest.find(entry=>entry.sourceFile==='Goldmund.png').previewDimensions,[4096,2659]);
 for(const id of ['goldveld','lanette','roden']){
  assert.ok(manifest.some(entry=>entry.file===`assets/originals/houses/${id}.png`&&entry.preview===`assets/source-crests/${id}.webp`));
 }
 for(const house of houses){
  await stat(new URL(`assets/${house.crest}`,root));await stat(new URL(house.fullsize,root));
  if(house.original)await stat(new URL(house.original,root));
 }
});

test('both complete historical rosters migrate while preserving surviving assignments and rejecting invalid data',()=>{
 const state=createDesignState(),added=['eitelborn','herzau','silberhorst','samtborn','weisshorn'];
 state.move('broeck','haarlen');state.rename('collective',null,'Der Goldene Bund');state.chooseCrest(realmDesigns[2].id);
 const legacy=JSON.parse(state.serialize());
 Object.assign(legacy.placements,{adrard:'bregen',rielle:null,vandergard:null,waalen:null,witten:null});
 const prior=structuredClone(legacy);
 for(const id of added)delete legacy.placements[id];
 const source=structuredClone(legacy),restored=createDesignState();
 restored.restore(legacy);
 assert.deepEqual(restored.current(),state.current());
 assert.deepEqual(legacy,source);
 for(const id of added)assert.equal(restored.currentPlacements()[id],null);
 restored.restore(prior);
 assert.deepEqual(restored.current(),state.current());
 assert.equal(Object.hasOwn(restored.currentPlacements(),'adrard'),false);
 const saved=restored.current(),missing=structuredClone(legacy),unknown=structuredClone(legacy);
 delete missing.placements.broeck;
 delete unknown.placements.broeck;unknown.placements.unknown=null;
 for(const invalid of [missing,unknown,{...legacy,placements:{...legacy.placements,roden:'bregen'}},{...prior,placements:{...prior.placements,adrard:'unknown'}}]){
  assert.throws(()=>restored.restore(invalid));assert.deepEqual(restored.current(),saved);
 }
});

test('the discussion view renders every territory and escapes imported names',()=>{
 const state=createDesignState(),hostile='<img src=x onerror=alert(1)>';
 state.rename('collective',null,hostile);
 state.rename('county',counties[0].id,hostile);
 state.rename('region',regions[0].id,hostile);
 const design=state.currentDesign();
 assert.equal(escapeHtml('<a "&\'>'),'&lt;a &quot;&amp;&#39;&gt;');
 const collective=renderCollectiveName(design),countyCards=renderCounties(design),seatCards=renderSettlements(state.currentPlacements(),null,design);
 for(const html of [collective,countyCards,seatCards]){
  assert.ok(html.includes('&lt;img src=x onerror=alert(1)&gt;'));
  assert.ok(!html.includes(hostile));
 }
 assert.equal((countyCards.match(/class="county-card"/g)||[]).length,3);
 assert.equal((seatCards.match(/class="seat-card"/g)||[]).length,8);
 assert.equal((renderRealmDesigns(design.realmCrest).match(/class="realm-design /g)||[]).length,4);
 assert.equal((renderNewHouses().match(/class="new-house"/g)||[]).length,11);
 assert.equal((renderRevisedHouses().match(/class="revision-card"/g)||[]).length,3);
 assert.doesNotMatch(seatCards,/data-drag-house="(?:goldveld|roden)"/);
});

test('the art deliverable contains eighteen new crests and eleven distinct territorial banners',async()=>{
 const direction=await readJson('art-direction.json'),manifest=await readJson('assets.generated.json');
 assert.equal(direction.jobs.length,29);
 assert.equal(direction.jobs.filter(job=>job.kind==='crest').length,14);
 assert.equal(direction.jobs.filter(job=>job.kind==='realm').length,4);
 assert.equal(direction.jobs.filter(job=>job.kind==='banner').length,11);
 assert.equal(manifest.length,29);
 assert.equal(new Set(direction.jobs.map(job=>job.id)).size,29);
 assert.equal(new Set(manifest.map(entry=>entry.sha256)).size,29);
 for(const house of houses.filter(item=>item.proposed||item.revised))assert.ok(direction.jobs.some(job=>job.kind==='crest'&&job.id===house.id),house.id);
 for(const job of direction.jobs){
  const entry=manifest.find(item=>item.id===job.id);
  assert.ok(entry,job.id);
  assert.equal(entry.preview,job.destination,job.id);
  assert.equal(hash(await readFile(new URL(entry.file,root))),entry.sha256,entry.file);
  assert.equal(hash(await readFile(new URL(entry.preview,root))),entry.previewSha256,entry.preview);
  assert.equal(hash(await readFile(new URL(entry.production,root))),entry.productionSha256,entry.production);
  assert.equal(entry.production,`assets/production/${job.id}.png`);
  assert.equal(entry.alphaCleanup.rgbUnchanged,true,job.id);
  assert.equal(entry.alphaCleanup.sourceTransparentPixelsExposed,0,`${job.id}: no transparent source artifacts exposed`);
  assert.deepEqual(entry.alpha.alphaValues,[0,255],job.id);
  assert.equal(entry.alpha.cornersTransparent,true,job.id);
  assert.ok(entry.alpha.transparentPixels>0,job.id);
  if(job.kind!=='banner'){
   assert.equal(entry.alpha.visibleContentTouchesCanvas,false,`${job.id}: complete outer border`);
   assert.equal(entry.alpha.boundingBoxAspectRatio,1,`${job.id}: exact circle proportions`);
   assert.equal(entry.alphaCleanup.circle.addedOpaquePixels,0,`${job.id}: no hidden RGB exposed`);
   assert.equal(entry.alphaCleanup.circle.visualApprovalRequired,false,`${job.id}: approved circle cleanup`);
   assert.equal(entry.alpha.innerDiskNonopaquePixels,0,`${job.id}: opaque interior`);
   assert.equal(entry.previewAlpha.innerDiskNonopaquePixels,0,`${job.id}: preview opaque interior`);
  }
 }
 for(const item of [...counties,...regions])assert.ok(direction.jobs.some(job=>job.kind==='banner'&&job.id===item.id),item.id);
 for(const item of realmDesigns)assert.ok(direction.jobs.some(job=>job.kind==='realm'&&job.id===item.id),item.id);
 assert.equal(new Set(manifest.filter(entry=>entry.category==='banners').map(entry=>entry.sha256)).size,11);
 const state=createDesignState(),design=state.currentDesign(),placements=state.currentPlacements();
 const views=[await readFile(new URL('index.html',root),'utf8'),renderCounties(design),renderSettlements(placements,null,design),renderRealmDesigns(design.realmCrest),...houses.map(house=>renderHouseDetails(house,placements,design))].join('');
 const pngLinks=new Set([...views.matchAll(/\bhref="([^"]+\.png)"/g)].map(match=>match[1]));
 for(const path of pngLinks)await stat(new URL(path,root));
 for(const job of direction.jobs)assert.ok(pngLinks.has(`assets/production/${job.id}.png`),`${job.id}: production full-size link`);
});

test('the planning page uses local modules, no inline handlers and no canonical data writes',async()=>{
 const html=await readFile(new URL('index.html',root),'utf8');
 assert.match(html,/noindex,nofollow/);
 assert.match(html,/Goldmund/);
 const files=(await readdir(root)).filter(file=>/\.(?:mjs|html)$/.test(file)&&file!=='art-direction.mjs');
 for(const file of files){
  const content=await readFile(new URL(file,root),'utf8');
  assert.doesNotMatch(content,/\bon(?:click|input|change|drop|dragstart|dragover)\s*=/i,file);
  assert.doesNotMatch(content,/families\.registry|kontinente\.registry|firebase[/-]|firestore|setDoc\(|updateDoc\(/i,file);
  for(const match of content.matchAll(/^\s*import\s+(?:[^'";]*?\sfrom\s+)?['"]([^'"]+)['"]/gm)){
   assert.ok(match[1].startsWith('.'),`${file}: ${match[1]}`);
   await stat(new URL(match[1],new URL(file,root)));
  }
 }
});
