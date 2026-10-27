import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir,stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {houses,realmEmblem} from '../Aldingen/house-data.mjs';
import {counties,settlements,territoryShields} from '../Aldingen/territory-data.mjs';
import {context} from '../Aldingen/realm-context.mjs';
import {createPlacementState,createMapProposal} from '../Aldingen/placement-state.mjs';
import {renderSeats,renderCounties,renderContext,escapeHtml} from '../Aldingen/proposal-render.mjs';
import {renderHouseDetails,renderTerritoryDetails} from '../Aldingen/art-dialogs.mjs';
import {warriors} from '../Aldingen/warrior-data.mjs';
import {FAMILY_REGISTRY} from '../../Stammbäume/assets/js/data/families.registry.js';

const root=new URL('../Aldingen/',import.meta.url),workspace=new URL('../../',root);
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');

test('every Aldingen family has one complete warrior asset set with real class, heraldry and horse references',async()=>{
 assert.deepEqual(warriors.map(w=>w.id).sort(),houses.map(h=>h.id).sort());
 const {prompts,corrections,tool}=JSON.parse(await readFile(new URL('assets/warriors/prompts.json',root),'utf8'));
 const {entries}=JSON.parse(await readFile(new URL('assets/warriors/manifest.json',root),'utf8'));
 assert.equal(tool,'built-in image_gen');
 assert.equal(prompts.length,23);assert.equal(entries.length,23);
 const classPage=await readFile(new URL('Klassenordner/Klassenseite.html',workspace),'utf8');
 for(const warrior of warriors){
  const house=houses.find(h=>h.id===warrior.id),entry=entries.find(e=>e.id===warrior.id),prompt=prompts.find(p=>p.id===warrior.id);
  assert.ok(entry&&prompt,warrior.id);assert.ok(classPage.includes(`id="klasse-goldmund-${warrior.classId}"`),warrior.id);
  assert.deepEqual(warrior.palette,house.palette);assert.equal(warrior.albic,Boolean(house.clan));
  for(const ref of prompt.references)await stat(new URL(ref,workspace));
  for(const path of [warrior.image,warrior.fullsize,entry.source])await stat(new URL(path,root));
  if(warrior.bestiary)await stat(new URL(warrior.bestiary,root));
  assert.equal(entry.alpha.touchesCanvas,false);assert.equal(entry.proof.rgbUnchanged,true);
 }
 for(const correction of corrections)for(const ref of correction.references)await stat(new URL(ref,workspace));
 for(const id of ['brechten','rosswarth'])assert.ok(corrections.some(c=>c.id===id));
});

test('Aldingen retains fifteen supplied houses, adds eight distinct unprefixed families and starts with only four specified seats',()=>{
 assert.equal(houses.length,23);
 assert.equal(houses.filter(h=>!h.isNew).length,15);
 assert.equal(houses.filter(h=>h.isNew&&!h.clan).length,4);
 assert.equal(houses.filter(h=>h.clan).length,4);
 assert.equal(new Set(houses.map(h=>h.id)).size,23);
 assert.deepEqual(Object.fromEntries(houses.filter(h=>h.sourceSeat).map(h=>[h.name,h.sourceSeat])),{Hohenmund:'grimberg',Klingen:'klingenhagen',Ritten:'barenstadt',Truchsen:'zollern'});
 assert.equal(houses.filter(h=>!h.sourceSeat).length,19);
 assert.ok(houses.every(h=>h.clan?h.rank==='laird':h.rank==='open'));
 for(const house of houses.filter(h=>h.isNew)){
  assert.doesNotMatch(house.name,/^(?:von|zu|ua|mac|nic|dal)\s|[òó]/i);
  assert.ok(!FAMILY_REGISTRY.some(f=>f.title.toLocaleLowerCase('de').includes(house.name.toLocaleLowerCase('de'))),house.name);
 }
 const turtle=houses.find(h=>h.id==='ronnach');
 assert.match(turtle.motif,/Meeresschildkröte/);assert.doesNotMatch(turtle.motif,/Walross/);
 assert.equal(new Set(houses.filter(h=>h.clan).map(h=>h.frame)).size,4);
});

test('the four counties and ducal domain cover all eleven red-bordered districts exactly once, using fifteen distinct kite shields',()=>{
 assert.equal(counties.filter(c=>!c.ducal).length,4);assert.equal(counties.filter(c=>c.ducal).length,1);
 assert.equal(settlements.length,11);assert.equal(territoryShields.length,15);
 assert.equal(new Set(territoryShields.map(s=>s.id)).size,15);
 assert.deepEqual(counties.flatMap(c=>c.seats).sort(),settlements.map(s=>s.id).sort());
 for(const s of settlements){
  assert.ok(counties.find(c=>c.id===s.county).seats.includes(s.id));
  assert.ok(territoryShields.some(t=>t.id===s.shield));
  assert.ok([...s.point,...s.pin].every(v=>Number.isFinite(v)&&v>0&&v<100));
 }
 assert.equal(counties.find(c=>c.ducal).shield,'klingenhagen');
 assert.equal(settlements.find(s=>s.id==='klingenhagen').shield,'klingenhagen');
 assert.equal(settlements.find(s=>s.id==='aldershafen').county,'ducal');
 assert.equal((renderCounties().match(/class="county-card"/g)||[]).length,5);
});

test('draft moves, undo, file restore and reset preserve source seats and reject incomplete imports atomically',()=>{
 const state=createPlacementState(),initial=state.current();
 assert.equal(state.canMove('klingen'),true);
 assert.equal(state.move('klingen','welden'),true);assert.equal(state.current().klingen,'welden');
 assert.equal(houses.find(h=>h.id==='klingen').sourceSeat,'klingenhagen');
 state.undo();assert.deepEqual(state.current(),initial);
 state.move('ronnach','aldershafen');
 const saved=state.serialize(),other=createPlacementState();other.restore(JSON.parse(saved));assert.deepEqual(other.current(),state.current());
 assert.throws(()=>state.restore({schemaVersion:1,realm:'aldingen',placements:{ronnach:null}}),/unvollständig/);
 assert.equal(state.current().ronnach,'aldershafen');
 assert.throws(()=>state.move('ronnach','unknown'),/Unbekanntes/);
 state.reset();assert.deepEqual(state.current(),initial);
 const proposal=createMapProposal(initial);
 assert.equal(proposal.clans.filter(h=>h.seat).length,4);
 assert.ok(proposal.clans.every(h=>h.liege===null));
 assert.ok(proposal.clans.every(h=>!h.crest.startsWith('assets/')));
});

test('all thirty-nine final artworks have preserved generator sources, matching production hashes and correct shapes',async()=>{
 const manifest=JSON.parse(await readFile(new URL('assets/art-manifest.json',root),'utf8'));
 const art=JSON.parse(await readFile(new URL('art-prompts.json',root),'utf8'));
 const provenance=JSON.parse(await readFile(new URL('assets/generated/provenance.json',root),'utf8'));
 assert.equal(manifest.entries.length,39);assert.equal(art.jobs.length,39);assert.equal(provenance.length,39);
 assert.equal(manifest.entries.filter(e=>e.shape==='circle').length,24);
 assert.equal(manifest.entries.filter(e=>e.shape==='kite').length,15);
 assert.equal(new Set(manifest.entries.map(e=>e.productionSha256)).size,39);
 for(const entry of manifest.entries){
  for(const kind of ['source','production','preview'])assert.equal(hash(await readFile(new URL(entry[kind],root))),entry[kind+'Sha256'],entry.id+' '+kind);
  const png=await readFile(new URL(entry.production,root));
  assert.equal(png.toString('ascii',1,4),'PNG');assert.equal(png[25],6);
  assert.equal(png.readUInt32BE(16),png.readUInt32BE(20));
  assert.equal(entry.rgbUnchanged,true);assert.equal(entry.interiorOpaque,true);
  const job=art.jobs.find(j=>j.id===entry.id);assert.ok(job&&job.prompt.length>1500&&job.referenceFiles.length);
  for(const ref of job.referenceFiles)await stat(new URL(ref,workspace));
 }
 assert.equal(manifest.entries.find(e=>e.id==='ronnach').source,'assets/generated/ronnach-turtle.png');
 const turtleJob=art.jobs.find(j=>j.id==='ronnach');assert.match(turtleJob.prompt,/SEA TURTLE/);
 assert.equal(realmEmblem.fullsize,'assets/production/aldingen.png');
 await stat(new URL(houses.find(h=>h.id==='rosswarth').bestiary,root));
});

test('all sixteen supplied crests remain byte-identical and the large original map is kept outside the published asset set',async()=>{
 const sources=JSON.parse(await readFile(new URL('assets.source.json',root),'utf8'));
 assert.equal(sources.length,17);assert.equal(sources.filter(s=>s.publishedOriginal).length,16);
 for(const source of sources.filter(s=>s.publishedOriginal))assert.equal(hash(await readFile(new URL(source.original,workspace))),source.sha256,source.sourceFile);
 const map=sources.find(s=>!s.publishedOriginal);assert.deepEqual(map.dimensions,[8192,5982]);
 for(const name of ['map.webp','map-full.webp']){const bytes=await readFile(new URL('assets/'+name,root));assert.equal(bytes.toString('ascii',8,12),'WEBP');}
});

test('the rendered discussion page includes all families, all district targets, the new history and safe independent draft dependencies',async()=>{
 const placements=createPlacementState().current(),seats=renderSeats(placements,null);
 assert.equal((seats.match(/class="seat-card"/g)||[]).length,11);
 for(const house of houses){const html=renderHouseDetails(house,placements);assert.ok(html.includes(house.crest)&&html.includes(house.name));assert.match(html,/Kriegerdarstellung/);assert.ok(html.includes(`assets/warriors/previews/${house.id}.webp`));}
 for(const territory of territoryShields)assert.ok(renderTerritoryDetails(territory).includes(territory.id+'.webp'));
 assert.equal(escapeHtml('<draft>"&'),'&lt;draft&gt;&quot;&amp;');
 const story=renderContext();for(const name of ['Órneach','Aulvernath','Iathneach','Lothir','Champania','Triarichie'])assert.ok(story.includes(name),name);
 assert.equal(context.themes.length,6);
 for(const name of (await readdir(root)).filter(n=>/\.(mjs|html|css)$/.test(n))){
  const source=await readFile(new URL(name,root),'utf8');
  assert.doesNotMatch(source,/\bon(?:click|input|change)=|firebase|families\.registry|kontinente\.registry/i,name);
  for(const match of source.matchAll(/(?:from\s+['"]|(?:src|href)="|url\(['"]?)(\.\.?\/[^'"\s)]+|assets\/[^'"\s)]+|[\w-]+\.(?:mjs|css))/g))if(!match[1].includes('${'))await stat(new URL(match[1],root));
 }
 assert.match(await readFile(new URL('index.html',root),'utf8'),/noindex,nofollow/);
});
