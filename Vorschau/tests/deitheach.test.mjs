import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {houses} from '../Deitheach/house-data.mjs';
import {counties,settlements,territoryArt} from '../Deitheach/territory-data.mjs';
import {warriors} from '../Deitheach/warrior-data.mjs';
import {createPlacementState} from '../Deitheach/placement-state.mjs';
import {context} from '../Deitheach/realm-context.mjs';
import {renderOccupation} from '../shared/country-workbench/occupation-view.mjs';

const root=new URL('../Deitheach/',import.meta.url),workspace=new URL('../../',import.meta.url);
const json=async url=>JSON.parse(await readFile(url,'utf8'));
test('Die gelieferten Clans haben Sitze, die fünf späteren Ergänzungen bleiben frei; Entwürfe verändern die Vorlage nicht',()=>{
 const state=createPlacementState(),initial=state.current();
 assert.equal(houses.filter(h=>!h.isNew).length,7);assert.equal(houses.filter(h=>h.isNew).length,5);
 assert.equal(initial['ard-roth'],'ailseag');
 assert.ok(houses.filter(h=>!h.isNew).every(h=>settlements.some(s=>s.id===initial[h.id])));
 assert.ok(houses.filter(h=>h.isNew).every(h=>initial[h.id]===null));
 assert.ok(state.move('snaith','treabhair'));assert.equal(houses.find(h=>h.id==='snaith').sourceSeat,null);
 const imported=createPlacementState();imported.restore(JSON.parse(state.serialize()));assert.deepEqual(imported.current(),state.current());
 const malformed=JSON.parse(state.serialize());malformed.placements.snaith='fremder-ort';
 assert.throws(()=>imported.restore(malformed));assert.deepEqual(imported.current(),state.current());
 assert.ok(state.undo());assert.deepEqual(state.current(),initial);
});
test('Jede Kartenregion ist abgedeckt; vier Eigenherrschaften teilen jeweils genau ein Mor-Banner',()=>{
 assert.equal(counties.length,4);assert.equal(settlements.length,9);assert.equal(territoryArt.length,9);
 const memberships=counties.flatMap(c=>c.seats);assert.equal(new Set(memberships).size,9);assert.equal(memberships.length,9);
 for(const c of counties){
  assert.equal(settlements.filter(s=>s.county===c.id&&s.art===c.art).length,1);
  assert.ok(territoryArt.some(a=>a.id===c.art));
 }
 for(const s of settlements){assert.ok(counties.find(c=>c.id===s.county).seats.includes(s.id));assert.ok(territoryArt.some(a=>a.id===s.art));for(const v of [...s.point,...s.pin])assert.ok(v>=0&&v<=100);}
 assert.equal(context.continent,'Aldervan');assert.equal(renderOccupation('deitheach'),'');
});
test('Öffentliche Originale sind unverändert; private Kartenarchive bleiben als Quellen belegt',async()=>{
 const entries=await json(new URL('assets.source.json',root));assert.equal(entries.length,10);
 const publicEntries=entries.filter(entry=>entry.publishedOriginal);
 const privateEntries=entries.filter(entry=>!entry.publishedOriginal);
 assert.equal(publicEntries.length,8);assert.equal(privateEntries.length,2);
 for(const entry of publicEntries){const bytes=await readFile(new URL(entry.original,workspace));assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,entry.sourceFile);}
 for(const entry of privateEntries){assert.match(entry.original,/^diagnostics\/deitheach\/source-originals\//);assert.match(entry.sha256,/^[a-f0-9]{64}$/);}
});
test('Jeder Clan besitzt eine lokale Ganzkörperfigur mit gültiger Klasse; alle 14 Heraldikbilder sind verknüpft',async()=>{
 assert.deepEqual(new Set(warriors.map(w=>w.id)),new Set(houses.map(h=>h.id)));assert.equal(warriors.length,12);
 for(const file of [...houses.flatMap(h=>[h.crest,h.fullsize]),...warriors.flatMap(w=>[w.image,w.fullsize,w.classHref]),...territoryArt.flatMap(a=>[a.image,a.fullsize])])await access(new URL(file,root));
 const manifest=await json(new URL('assets/art-manifest.json',root));assert.equal(manifest.entries.length,14);
 for(const entry of manifest.entries){for(const kind of ['source','production','preview'])assert.equal(createHash('sha256').update(await readFile(new URL(entry[kind],root))).digest('hex'),entry[kind+'Sha256']);assert.equal(entry.rgbUnchanged,true);}
});
