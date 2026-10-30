import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {houses} from '../Talyndor/house-data.mjs';
import {counties,settlements,territoryArt} from '../Talyndor/territory-data.mjs';
import {warriors} from '../Talyndor/warrior-data.mjs';
import {createPlacementState} from '../Talyndor/placement-state.mjs';
import {context} from '../Talyndor/realm-context.mjs';
const root=new URL('../Talyndor/',import.meta.url),workspace=new URL('../../',import.meta.url);

test('Nur erkennbare Herrscherhäuser beginnen an den vier Hauptsitzen; Entwürfe sind beweglich und atomar',()=>{
 const draft=createPlacementState(),initial=draft.current();
 assert.equal(houses.length,18);assert.equal(houses.filter(h=>h.isNew).length,6);
 assert.equal(houses.filter(h=>h.sourceSeat===null).length,14);
 for(const c of counties){assert.equal(initial[c.id],c.capital);assert.ok(settlements.find(s=>s.id===c.capital).principal);}
 assert.equal(initial.thornwick,null);assert.match(houses.find(h=>h.id==='thornwick').placementNote,/1720 verloren/);
 assert.ok(draft.move('wulmer','hartham'));assert.ok(draft.move('aldred','cawden'));
 const restored=createPlacementState();restored.restore(JSON.parse(draft.serialize()));assert.deepEqual(restored.current(),draft.current());
 for(const mutate of [v=>v.realm='aeldrunmar',v=>delete v.placements.thornwick,v=>v.placements.wulmer='thornholt']){
  const bad=JSON.parse(draft.serialize());mutate(bad);assert.throws(()=>restored.restore(bad));assert.deepEqual(restored.current(),draft.current());
 }
 assert.ok(draft.undo());assert.equal(draft.current().aldred,initial.aldred);assert.ok(draft.reset());assert.deepEqual(draft.current(),initial);
});

test('Jeder Kartenbezirk hat ein eigenes Landschaftsbanner, jede Großregion ein getrenntes Hausbanner',()=>{
 assert.equal(counties.length,4);assert.equal(settlements.length,12);assert.equal(territoryArt.length,16);
 assert.equal(new Set(territoryArt.map(t=>t.id)).size,16);
 assert.deepEqual(new Set(counties.flatMap(c=>c.seats)),new Set(settlements.map(s=>s.id)));
 for(const c of counties){const art=territoryArt.find(t=>t.id===c.art);assert.equal(art.houseId,c.id);assert.equal(art.level,'earldom');assert.notEqual(c.art,c.capital);}
 for(const s of settlements){assert.ok(s.overlayLabel);assert.ok(territoryArt.some(t=>t.id===s.art&&t.level==='district'));for(const v of [...s.point,...s.pin,...s.label])assert.ok(v>=0&&v<=100);}
 assert.ok(territoryArt.every(t=>t.shape==='banner'));
});

test('Schwere ritterliche Klassen überwiegen, seltene Wege haben echte Klassen- und Zuchtverweise',async()=>{
 const common=new Set(['miles','ceorl','isen','wigar']),rare=new Set(['hyld','scoet','gliwere']);
 assert.deepEqual(new Set(warriors.map(w=>w.id)),new Set(houses.map(h=>h.id)));
 assert.equal(warriors.filter(w=>common.has(w.classId)).length,15);
 for(const id of rare)assert.equal(warriors.filter(w=>w.classId===id).length,1);
 const classes=await readFile(new URL('Klassenordner/Klassenseite.html',workspace),'utf8');
 for(const w of warriors){assert.ok(common.has(w.classId)||rare.has(w.classId));assert.ok(classes.includes(`id="${w.classHref.split('#')[1]}"`));assert.equal(w.withHorse,['hyld','scoet'].includes(w.classId));if(w.withHorse){assert.equal(w.horseName,'Brycing');await access(new URL(w.bestiaryHref,root));}}
 assert.doesNotMatch(JSON.stringify(context),/englisch|angelsächsisch/i);
});

test('Unveränderte Quellen und fertige Haus-, Krieger- und Gebietsbilder sind vollständig nachweisbar',async()=>{
 const sources=JSON.parse(await readFile(new URL('assets.source.json',root),'utf8'));assert.equal(sources.length,14);
 const digest=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
 for(const s of sources)assert.equal(await digest(new URL(s.original,workspace)),s.sha256,s.sourceFile);
 for(const p of [...houses.flatMap(h=>[h.crest,h.fullsize]),...warriors.flatMap(w=>[w.image,w.fullsize]),...territoryArt.flatMap(t=>[t.image,t.fullsize])])await access(new URL(p,root));
 const manifest=JSON.parse(await readFile(new URL('assets/art-manifest.json',root),'utf8'));assert.equal(manifest.entries.length,23);
 for(const entry of manifest.entries){assert.equal(entry.rgbUnchanged,true);for(const field of ['source','production','preview'])assert.equal(await digest(new URL(entry[field],root)),entry[field+'Sha256']);}
});
