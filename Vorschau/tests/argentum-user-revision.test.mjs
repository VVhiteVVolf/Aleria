import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {REALM_CONTEXT as ARGENTUM} from '../Leukonia/realm-context.mjs';
import {REALM_CONTEXT as VARDENTIA} from '../Sylvarant/realm-context.mjs';
import {REALM_CONTEXT as CALIDARIA} from '../Calidaria/realm-context.mjs';
import {SETTLEMENTS,MAP_VARIANTS} from '../Leukonia/territory-data.mjs';
import {HOUSES} from '../Leukonia/house-data.mjs';
import {createMapProposal} from '../Leukonia/map-data.mjs';
import {createHousePlacementState} from '../Leukonia/placement-state.mjs';
import {createMapProposal as createPhalantiaMap} from '../Phalantia/map-data.mjs';
import {SETTLEMENTS as PHALANTIAN_CITIES} from '../Phalantia/territory-data.mjs';
import {renderGovernment} from '../Leukonia/realm-context-view.mjs';
import {renderMapLabelReplacements} from '../shared/map-label-replacements.mjs';
import {escapeHtml} from '../shared/country-workbench/render.mjs';

test('Argentum starts in the east and preserves migration, liberation and later imperial succession',()=>{
 assert.equal(VARDENTIA.title,'Vardentia');
 assert.deepEqual(ARGENTUM.provinces.map(p=>p.name),['Leukonia','Vardentia','Calidaria']);
 const history=ARGENTUM.history.find(h=>h.id==='leukonia-silverant').text;
 assert.match(history,/Osten.*Vardentia.*wanderten.*Westen.*Leukonia.*Stadtstaaten.*Shirazad und Phalantia.*befreiten.*Alerischen Kaiserreich/s);
 assert.match(ARGENTUM.history.find(h=>h.id==='argentum').text,/Zerfall.*Alerischen Kaiserreiches.*Vardentia.*Argentum/s);
 assert.doesNotMatch(ARGENTUM.history.map(h=>h.text).join(' '),/Von ihnen spalteten sich die Argonath ab und segelten nach Osten/);
});

test('current map names retain legacy city IDs, Mede domain, coordinates and draft imports',()=>{
 const replacements={alvanista:'Neravessa',aspio:'Ascervia',zaphias:'Caldessara',allantaic:'Orthevia'};
 for(const [id,name]of Object.entries(replacements)){
  const city=SETTLEMENTS.find(c=>c.id===id);assert.equal(city.name,name);assert.equal(city.nameStatus,'replacement-proposal');
  assert.equal(city.sourceKey,id);assert.equal(city.sourcePixelCentre.length,2);
 }
 const state=createHousePlacementState({houses:HOUSES,settlements:SETTLEMENTS});
 const exported=state.serialize();state.restore(JSON.parse(exported));assert.equal(state.current()['house-mede'],'zaphias');
 assert.equal(SETTLEMENTS.find(c=>c.id==='zaphias').imperialDomain,true);
 for(const variant of MAP_VARIANTS){const proposal=createMapProposal({houses:HOUSES,placements:state.current(),variant});assert.equal(proposal.labelReplacements.length,4);assert.equal(proposal.replacementNamesToggleable,true);}
});

test('both historical Leukonia raster maps remain byte-identical while the active view replaces labels',async()=>{
 const source=JSON.parse(await readFile(new URL('../Leukonia/sources/map-sources.json',import.meta.url),'utf8'));
 for(const variant of MAP_VARIANTS){
  const original=source.maps.find(m=>m.id===variant.id),bytes=await readFile(new URL('../Leukonia/'+variant.map,import.meta.url));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),original.sha256);
 }
 const state=createHousePlacementState({houses:HOUSES,settlements:SETTLEMENTS});
 const map=createMapProposal({houses:HOUSES,placements:state.current()});
 const html=renderMapLabelReplacements({replacements:map.labelReplacements,settlements:map.settlements,showNames:true,escape:escapeHtml});
 for(const name of ['Neravessa','Ascervia','Caldessara','Orthevia'])assert(html.includes('>'+name+'</span>'));
 assert.doesNotMatch(html,/>Alvanista<|>Aspio<|>Zaphias<|>Allantaic</);
 const hidden=renderMapLabelReplacements({replacements:map.labelReplacements,settlements:map.settlements,showNames:false,escape:escapeHtml});
 assert.equal((hidden.match(/<span hidden>/g)||[]).length,4);assert.equal((hidden.match(/data-label-replacement=/g)||[]).length,4);
});

test('external Orthevia annotation does not add a Phalantian city or house seat',()=>{
 assert.equal(PHALANTIAN_CITIES.length,8);assert(!PHALANTIAN_CITIES.some(c=>/orthevia|all?antaic/i.test(c.id+' '+c.name)));
 const map=createPhalantiaMap({houses:[],placements:{}});
 assert.equal(map.labelReplacements.length,1);assert.equal(map.labelReplacements[0].annotationId,'neighbor-orthevia');
 assert.equal(map.settlements.length,8);assert.deepEqual(map.clans,[]);
 const html=renderMapLabelReplacements({replacements:map.labelReplacements,settlements:map.settlements,showNames:true,escape:escapeHtml});
 assert.match(html,/map-label-stone/);assert.match(html,/>Orthevia<\/span>/);
});

test('optional map labels leave other variants unchanged, escape text and reject unbound or unsafe rectangles',()=>{
 assert.equal(renderMapLabelReplacements({settlements:[],showNames:true,escape:escapeHtml}),'');
 const render=replacements=>renderMapLabelReplacements({replacements,settlements:[],showNames:true,escape:escapeHtml});
 assert.match(render([{annotationId:'outside',label:'<town>',rect:[1,2,3,4]}]),/&lt;town&gt;/);
 for(const invalid of [
  {settlementId:'unknown',rect:[1,2,3,4]},
  {annotationId:'outside',label:'Town',rect:[1,2,3,NaN]},
  {annotationId:'outside',label:'Town',rect:[99,2,3,4]},
  {annotationId:'outside',label:'Town',rect:[1,2,0,4]},
 ])assert.throws(()=>render([invalid]),/Invalid measured/);
});

test('one shared imperial order distinguishes confirmed territorial rules and proposed procedures',()=>{
 for(const context of [VARDENTIA,CALIDARIA]){
  assert.equal(context.administration,ARGENTUM.administration);
  assert.equal(context.territorialRules,ARGENTUM.territorialRules);
  assert.equal(context.appointmentProposals,ARGENTUM.appointmentProposals);
  const html=renderGovernment(context);assert.match(html,/Bestätigte Regeln territorialer Herrschaft/);assert.match(html,/Vorschläge zur weiteren Ausgestaltung/);
 }
 assert.deepEqual(ARGENTUM.territorialRules.map(r=>r.id),['settled-archons','one-region','resident-peer']);
 assert.match(ARGENTUM.territorialRules.find(r=>r.id==='one-region').text,/nicht gleichzeitig zwei Regionen.*Mehrere örtliche Aufgaben.*derselben Region.*Kaiserfamilie/s);
 assert.match(ARGENTUM.territorialRules.find(r=>r.id==='resident-peer').text,/Heimatstadt.*gleichrangiges Haus/s);
 assert.match(ARGENTUM.administration.appointments,/Präfekt und Magistrat sind nicht erblich/);
 assert.match(ARGENTUM.offices.find(o=>o.id==='prokonsul').note,/weiteren Amt/);
});
