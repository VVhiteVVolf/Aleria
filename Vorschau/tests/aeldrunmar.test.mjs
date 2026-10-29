import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {houses} from '../Aeldrunmar/house-data.mjs';
import {counties,settlements,territoryArt} from '../Aeldrunmar/territory-data.mjs';
import {warriors} from '../Aeldrunmar/warrior-data.mjs';
import {createPlacementState} from '../Aeldrunmar/placement-state.mjs';
import {context} from '../Aeldrunmar/realm-context.mjs';
import {createCountryRenderer,renderCountryPage} from '../shared/country-workbench/render.mjs';
const root=new URL('../Aeldrunmar/',import.meta.url),workspace=new URL('../../',import.meta.url);

test('Earls und gemeinsam gelieferte Vasallen beginnen an sechs Hauptstädten; alle übrigen Häuser bleiben frei',()=>{
 const draft=createPlacementState(),initial=draft.current();
 assert.equal(houses.length,35);assert.equal(houses.filter(h=>h.sourceSeat).length,21);assert.equal(houses.filter(h=>!h.sourceSeat).length,14);
 for(const h of houses){
  assert.equal(initial[h.id],h.sourceSeat);
  if(h.sourceSeat)assert.ok(settlements.find(s=>s.id===h.sourceSeat).principal);
  else assert.equal(h.sourceFolder,'');
 }
 for(const county of counties){
  const assigned=houses.filter(h=>h.sourceSeat===county.capital);
  assert.equal(assigned.filter(h=>['royal','earl'].includes(h.rank)).length,1);
  assert.equal(new Set(assigned.map(h=>h.sourceFolder)).size,1);
 }
 assert.ok(draft.move('ashby','mornhall'));assert.ok(draft.move('kendryck','hydrathar'));
 const imported=createPlacementState();imported.restore(JSON.parse(draft.serialize()));assert.deepEqual(imported.current(),draft.current());
 const bad=JSON.parse(draft.serialize());bad.placements.ashby='fremder-ort';assert.throws(()=>imported.restore(bad));assert.deepEqual(imported.current(),draft.current());
 assert.ok(draft.undo());assert.equal(draft.current().kendryck,initial.kendryck);
 assert.ok(draft.reset());assert.deepEqual(draft.current(),initial);
});

test('Alle 23 Einzelgebiete besitzen ein eigenes Banner, getrennt von sechs Earltumsstandarten',()=>{
 assert.equal(counties.length,6);assert.equal(settlements.length,23);assert.equal(territoryArt.length,29);
 assert.equal(new Set(territoryArt.map(t=>t.id)).size,29);
 const memberships=counties.flatMap(c=>c.seats);
 assert.equal(new Set(memberships).size,22);assert.equal(memberships.length,22);
 assert.equal(settlements.filter(s=>s.county===null).length,1);
 assert.equal(settlements.find(s=>s.id==='hingstgard').county,null);
 for(const c of counties){assert.ok(c.art!==c.capital);assert.ok(territoryArt.some(t=>t.id===c.art&&t.level==='earldom'));}
 for(const s of settlements){assert.ok(territoryArt.some(t=>t.id===s.art&&t.level==='district'));for(const v of [...s.point,...s.pin])assert.ok(v>=0&&v<=100);}
 assert.doesNotThrow(()=>createCountryRenderer({houses,counties,settlements,territoryArt}).renderSeats(createPlacementState().current(),null));
 assert.match(renderCountryPage({houses,counties,settlements,context}),/Sechs Earltümer/);
});

test('Nur sechs adelige Klassen sind zugelassen; alle Hyld und Scoet besitzen den tatsächlichen Brycing-Verweis',async()=>{
 const allowed=new Set(['isen','wigar','hyld','scoet','s-rinc','gliwere']);
 assert.deepEqual(new Set(warriors.map(w=>w.id)),new Set(houses.map(h=>h.id)));
 for(const w of warriors){assert.ok(allowed.has(w.classId));assert.equal(w.withHorse,['hyld','scoet'].includes(w.classId));if(w.withHorse){assert.equal(w.horseName,'Brycing');await access(new URL(w.bestiaryHref,root));}}
 assert.equal(warriors.filter(w=>w.withHorse).length,12);
 assert.equal(warriors.find(w=>w.id==='kendryck').classId,'hyld');
 for(const id of ['earncynne','frye'])assert.equal(warriors.find(w=>w.id===id).classId,'isen');
 for(const id of ['tharn','estmere'])assert.equal(warriors.find(w=>w.id===id).classId,'s-rinc');
});

test('Alle 37 Originale sind unverändert archiviert und alle endgültigen Bilddateien vorhanden',async()=>{
 const sources=JSON.parse(await readFile(new URL('assets.source.json',root),'utf8'));assert.equal(sources.length,37);
 for(const s of sources)assert.equal(createHash('sha256').update(await readFile(new URL(s.original,workspace))).digest('hex'),s.sha256,s.sourceFile);
 for(const p of [...houses.flatMap(h=>[h.crest,h.fullsize]),...warriors.flatMap(w=>[w.image,w.fullsize,w.classHref.split('#')[0]]),...territoryArt.flatMap(t=>[t.image,t.fullsize])])await access(new URL(p,root));
 const manifest=JSON.parse(await readFile(new URL('assets/art-manifest.json',root),'utf8'));assert.equal(manifest.entries.length,29);
 for(const e of manifest.entries){assert.equal(e.rgbUnchanged,true);for(const field of ['source','production','preview'])assert.equal(createHash('sha256').update(await readFile(new URL(e[field],root))).digest('hex'),e[field+'Sha256']);}
});
