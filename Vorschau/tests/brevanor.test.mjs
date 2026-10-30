import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {houses} from '../Brevanor/house-data.mjs';
import {counties,settlements,territoryArt} from '../Brevanor/territory-data.mjs';
import {warriors} from '../Brevanor/warrior-data.mjs';
import {warriorDirections} from '../Brevanor/warrior-art-direction.mjs';
import {createPlacementState,createMapProposal} from '../Brevanor/placement-state.mjs';
import {context} from '../Brevanor/realm-context.mjs';
import {historicalEmblems} from '../Brevanor/historical-emblems.mjs';
import {BREVANOR_CULTURE} from '../../Klassenordner/Brevanor/kultur.js';
const root=new URL('../Brevanor/',import.meta.url),workspace=new URL('../../',import.meta.url);

test('Alle Kartenorte erhalten Sitzhäuser; Hauptstadt besitzt drei zusätzliche, sechs Häuser bleiben frei',()=>{
 const draft=createPlacementState(),initial=draft.current();
 assert.equal(houses.length,26);assert.equal(settlements.length,17);
 assert.equal(Object.values(initial).filter(v=>v===null).length,6);
 assert.equal(Object.values(initial).filter(v=>v==='caerennes').length,4);
 assert.equal(initial.gerain,'hervant');assert.equal(initial.kervaut,'caerennes');
 for(const s of settlements)assert.ok(Object.values(initial).includes(s.id),`Unbesetzter Ort ${s.name}`);
 assert.equal(houses.filter(h=>h.isNew).length,14);
 assert.equal(houses.find(h=>h.id==='bielle').nameProposed,undefined);
 assert.ok(!houses.some(h=>['desele','lothaire'].includes(h.id)),'Bürgerliche Familien werden nicht geadelt');
 draft.move('trevain','torvay');draft.move('aubert',null);
 const restored=createPlacementState();restored.restore(JSON.parse(draft.serialize()));assert.deepEqual(restored.current(),draft.current());
 for(const mutate of [v=>v.realm='talyndor',v=>delete v.placements.bielle,v=>v.placements.trevain='unbekannt']){
  const value=JSON.parse(draft.serialize());mutate(value);assert.throws(()=>restored.restore(value));assert.deepEqual(restored.current(),draft.current());
 }
 assert.ok(draft.undo());assert.equal(draft.current().aubert,'caerennes');assert.ok(draft.reset());assert.deepEqual(draft.current(),initial);
});

test('Kartenabdeckung bleibt vollständig und trennt Einzelgebiete, Comteyrate und königliche Form',()=>{
 assert.deepEqual(context.imageSize,[6144,5429]);
 assert.equal(createMapProposal(createPlacementState().current()).imageSize,context.imageSize);
 assert.equal(counties.length,4);assert.equal(territoryArt.length,21);
 assert.deepEqual(counties.map(c=>c.seats.length),[4,4,5,4]);
 assert.deepEqual(new Set(counties.flatMap(c=>c.seats)),new Set(settlements.map(s=>s.id)));
 assert.equal(new Set(territoryArt.map(t=>t.id)).size,21);
 assert.equal(territoryArt.filter(t=>t.level==='royal').length,1);
 for(const c of counties){
  const art=territoryArt.find(t=>t.id===c.art);assert.ok(art);assert.ok(houses.some(h=>h.id===art.houseId&&h.sourceSeat===c.capital));
 }
 for(const s of settlements){assert.ok(s.overlayLabel);assert.ok(territoryArt.some(t=>t.id===s.art&&t.level==='district'));for(const v of [...s.point,...s.pin,...s.label])assert.ok(v>0&&v<100);}
 assert.ok(territoryArt.every(t=>t.shape==='scalloped-shield'));
});

test('Hauskrieger verwenden Brevanors eigene Klassen und reale Cheval-Verweise; Helmkonzepte unterscheiden sich',async()=>{
 const allowed=new Set(['breval','hastrel','cantrel','havren','silvain','cabrant']);
 assert.deepEqual(new Set(warriors.map(w=>w.id)),new Set(houses.map(h=>h.id)));
 assert.equal(new Set(warriorDirections.map(d=>d.helmet)).size,26);
 for(const w of warriors){
  assert.ok(allowed.has(w.classId));await access(new URL(w.classHref,root));
  assert.equal(w.withHorse,w.classId==='cabrant');
  if(w.withHorse){assert.equal(w.horseName,'Cheval');await access(new URL(w.bestiaryHref,root));}
 }
 const ranks=BREVANOR_CULTURE.orderOverview.nobleRanks.map(r=>r.title);
 assert.equal(ranks[7],'Bannor');assert.equal(ranks[10],'Pajet');
 assert.equal(BREVANOR_CULTURE.orderOverview.nobleRanks[6].subtitle,'Ritterfürst');
 assert.ok(!/Belgrant/.test(JSON.stringify(warriors)));
 assert.match(context.history.map(x=>x.text).join(' '),/Briath[\s\S]*Brethneach[\s\S]*Königreich Brevanor/);
});

test('Originale, drei Formvorlagen und sämtliche finalen Wappen und Krieger bleiben überprüfbar',async()=>{
 const digest=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
 const sources=JSON.parse(await readFile(new URL('assets.source.json',root),'utf8'));assert.equal(sources.length,14);
 for(const s of sources)assert.equal(await digest(new URL(s.original,workspace)),s.sha256,s.sourceFile);
 for(const id of ['region','county','royal'])await access(new URL(`assets/shapes/${id}.png`,root));
 for(const p of [...houses.flatMap(h=>[h.crest,h.fullsize]),...warriors.flatMap(w=>[w.image,w.fullsize]),...territoryArt.flatMap(t=>[t.image,t.fullsize])])await access(new URL(p,root));
 const manifest=JSON.parse(await readFile(new URL('assets/art-manifest.json',root),'utf8'));assert.equal(manifest.entries.length,36);
 assert.equal(historicalEmblems[0].id,'brethneach');
 for(const h of historicalEmblems){await access(new URL(h.image,root));await access(new URL(h.fullsize,root));}
 for(const entry of manifest.entries){assert.equal(entry.rgbUnchanged,true);for(const field of ['source','production','preview'])assert.equal(await digest(new URL(entry[field],root)),entry[field+'Sha256']);}
 const artJobs=JSON.parse(await readFile(new URL('art-prompts.json',root),'utf8')).jobs;
 assert.equal(artJobs.filter(j=>j.kind==='crest'&&j.shape==='circle').length,14);
 const characterJobs=JSON.parse(await readFile(new URL('warrior-prompts.json',root),'utf8')).jobs;
 assert.equal(characterJobs.length,26);assert.ok(characterJobs.every(j=>j.references[0].includes('approved-house-knight')));
});
