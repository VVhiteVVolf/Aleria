import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,stat,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {houses,provinces,settlements,createMapProposal} from '../Weisenfluh/realm-data.mjs';
import {createPlacementState} from '../Weisenfluh/proposal-state.mjs';
import {escapeHtml,renderProvinces,renderSettlements} from '../Weisenfluh/proposal-render.mjs';

const root=new URL('../Weisenfluh/',import.meta.url);

test('Weisenfluh follows the supplied five provinces, eight Landmann seats and separate leased order',()=>{
 assert.equal(provinces.length,5);
 assert.equal(settlements.length,14);
 assert.equal(settlements.filter(s=>s.kind==='Landmannssitz').length,8);
 assert.equal(settlements.find(s=>s.id==='aehrensass').province,null);
 assert.deepEqual(Object.fromEntries(provinces.map(p=>[p.id,p.ruler])),{ewigensee:'goldkranz',ewiggruen:'rosenstolz',weisshort:'sommerfeld',seeblick:'silberthal',weisslauf:'weissmann'});
 assert.equal(houses.filter(h=>h.rank==='king').length,1);
 assert.equal(houses.filter(h=>h.rank==='baron').length,4);
 assert.equal(houses.filter(h=>h.rank==='landmann').length,18);
 assert.equal(houses.filter(h=>h.rank==='order').length,1);
 assert.equal(houses.filter(h=>h.rank==='laird').length,7);
 assert.equal(new Set(houses.map(h=>h.id)).size,houses.length);
 assert.ok(houses.filter(h=>h.rank==='laird').every(h=>h.sourceSeat===null&&h.province===null));
 assert.equal(settlements.find(s=>s.id==='wolfrieden').sourceName,'Wolfenried');
 for(const id of ['silbermundt','weissklippe','hohenklamm'])assert.ok(!houses.some(h=>h.sourceSeat===id),id);
 for(const p of provinces)assert.ok(houses.some(h=>h.id===p.ruler));
});

test('moves, undo and reset affect draft seats while source roles and allegiance stay intact',()=>{
 const state=createPlacementState(),baseline=state.current(),source=structuredClone(houses);
 assert.equal(state.move('catrannoch','silbermundt'),true);
 assert.equal(state.current().catrannoch,'silbermundt');
 assert.equal(state.move('catrannoch','silbermundt'),false);
 assert.equal(state.move('goldkranz','weisslauf'),true);
 assert.equal(state.undo(),true);
 assert.equal(state.current().goldkranz,'ewigensee');
 assert.equal(state.current().catrannoch,'silbermundt');
 assert.equal(state.reset(),true);
 assert.deepEqual(state.current(),baseline);
 assert.equal(state.undo(),true);
 assert.equal(state.current().catrannoch,'silbermundt');
 assert.deepEqual(houses,source);
 const exposed=state.current();exposed.catrannoch='hohenklamm';
 assert.equal(state.current().catrannoch,'silbermundt');
 assert.equal(createPlacementState().current().catrannoch,null);
 const map=createMapProposal(state.current());
 assert.equal(map.clans.find(h=>h.id==='sommerfeld').liege,'goldkranz');
 assert.equal(map.clans.find(h=>h.id==='bruggemann').liege,'sommerfeld');
});

test('draft files round-trip and reject unknown or incomplete assignments atomically',()=>{
 const first=createPlacementState(),second=createPlacementState();
 first.move('damhcallan','ewiggruen');first.move('torcradan','ottersburg');
 second.restore(JSON.parse(first.serialize()));
 assert.deepEqual(second.current(),first.current());
 const saved=second.current();
 for(const value of [{}, {...JSON.parse(first.serialize()),realm:'other'}, {...JSON.parse(first.serialize()),placements:{catrannoch:'ewigensee'}}, {...JSON.parse(first.serialize()),placements:{...saved,catrannoch:'unknown'}}]){
  assert.throws(()=>second.restore(value));assert.deepEqual(second.current(),saved);
 }
 assert.throws(()=>second.move('unknown','ewigensee'));
 assert.throws(()=>second.move('catrannoch','unknown'));
 assert.deepEqual(second.current(),saved);
});

test('source originals remain byte-identical and every supplied crest is present',async()=>{
 const manifest=JSON.parse(await readFile(new URL('assets.source.json',root),'utf8'));
 assert.equal(manifest.length,33);
 for(const entry of manifest){
  const bytes=await readFile(new URL(entry.file,root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),entry.sha256,entry.file);
  await stat(new URL(entry.preview,root));
 }
 for(const house of houses){await stat(new URL('assets/'+house.crest,root));await stat(new URL(house.original,root));}
 const art=JSON.parse(await readFile(new URL('banneach-art.json',root),'utf8'));
 assert.equal(art.id,'banneach-antique-white-bull');
 assert.match(art.prompt,/weisser Stier/);
 assert.equal(art.references.length,3);
 const audit=JSON.parse(await readFile(new URL('banneach-alpha-audit.json',root),'utf8'));
 assert.equal(audit.rgbUnchanged,true);
 assert.deepEqual(audit.alphaValues,[0,255]);
});

test('proposal output is escaped, complete and independent of canonical world data',async()=>{
 assert.equal(escapeHtml('<a "&>'),'&lt;a &quot;&amp;&gt;');
 assert.equal((renderProvinces().match(/class="province-card"/g)||[]).length,5);
 assert.equal((renderSettlements(createPlacementState().current()).match(/data-seat=/g)||[]).length,14);
 const html=await readFile(new URL('index.html',root),'utf8');
 assert.match(html,/noindex,nofollow/);assert.match(html,/weißer Stier/);
 for(const file of (await readdir(root)).filter(name=>/\.(?:mjs|html)$/.test(name))){
  const text=await readFile(new URL(file,root),'utf8');
  assert.doesNotMatch(text,/\bon(?:click|input|change)=|firebase|families\.registry|kontinente\.registry/,file);
 }
});
