/** Public runtime regression subset. Private source inventories stay local. */
import test from 'node:test';
import assert from 'node:assert/strict';
import {access} from 'node:fs/promises';
import {HOUSES} from '../house-data.mjs';
import {SETTLEMENTS,REGIONS,createMapProposal} from '../territory-data.mjs';
import {ARTWORKS} from '../art-data.mjs';
import {CLASS_PROTOTYPES} from '../warrior-data.mjs';
import {ESTATES,ESTATE_GROUPS} from '../estate-data.mjs';
import {REALM_CONTEXT} from '../realm-context.mjs';
import {FAITH_CONTEXT} from '../source-context.mjs';
import {createHousePlacementState,PLACEMENT_STORAGE_KEY} from '../placement-state.mjs';
import {renderMathringenPage} from '../proposal-render.mjs';
import {isAuthoringArchive} from '../../../netlify/build/publication-policy.mjs';
const realm=new URL('../',import.meta.url);
const makeState=()=>createHousePlacementState({houses:HOUSES,settlements:SETTLEMENTS});
const initial=Object.fromEntries(HOUSES.map(h=>[h.id,h.sourceSeat]));
const html=()=>renderMathringenPage({context:REALM_CONTEXT,faith:FAITH_CONTEXT,houses:HOUSES,
 prototypes:CLASS_PROTOTYPES,artworks:ARTWORKS,estates:ESTATES,estateGroups:ESTATE_GROUPS,settlements:SETTLEMENTS});

test('the 44 mapped houses keep their seats and Splettinger is added without a fabricated town',()=>{
 assert.equal(HOUSES.length,45);assert.equal(SETTLEMENTS.length,44);
 const mapped=HOUSES.filter(h=>h.sourceSeat!==null);assert.equal(mapped.length,44);
 assert.equal(HOUSES.find(h=>h.id==='splettinger').sourceSeat,null);
 assert.equal(new Set(HOUSES.map(h=>h.id)).size,45);
 assert.equal(new Set(HOUSES.map(h=>h.name)).size,45);
 assert.equal(new Set(mapped.map(h=>h.sourceSeat)).size,44);
 assert.deepEqual([...new Set(mapped.map(h=>h.sourceSeat))].sort(),SETTLEMENTS.map(s=>s.id).sort());
});
test('blank original cartouches receive proposal names without new political boundaries',()=>{
 assert(SETTLEMENTS.every(s=>s.nameStatus==='proposal'&&s.overlayLabel));
 assert.equal(SETTLEMENTS.filter(s=>s.capital).length,1);
 assert.equal(SETTLEMENTS.find(s=>s.capital).id,'seat-01');
 assert(REGIONS.every(r=>r.kindLabel==='Stadtraum ohne neue Verwaltungsgrenze'));
 assert(SETTLEMENTS.every(s=>s.point.every(v=>v>=0&&v<=100)&&s.pin.every(v=>v>=0&&v<=100)));
});
test('established names and motif provenance remain separated from new proposals',()=>{
 assert.equal(HOUSES.filter(h=>h.nameStatus==='existing').length,4);
 assert.equal(HOUSES.filter(h=>h.retainedSourceMotif).length,5);
 assert.equal(HOUSES.find(h=>h.id==='luitpoldinger').nameStatus,'proposal');
 assert.equal(HOUSES.find(h=>h.id==='luitpoldinger').sourceImage,'assets/originals/ducal-unidentified-original.png');
});
test('folder ranks do not create ranks for the other families',()=>{
 assert.equal(HOUSES.filter(h=>h.rank==='Kaiserfamilie').length,1);
 assert.equal(HOUSES.filter(h=>h.rank==='Reichsherzog').length,4);
 assert.equal(HOUSES.filter(h=>h.rank==='Rang offen').length,40);
 assert.equal(HOUSES.filter(h=>h.imperial).length,1);
});
test('five worldly estates, nine ranks and seven clerical vocations remain distinct',()=>{
 assert.equal(ESTATES.length,21);assert.equal(new Set(ESTATES.map(e=>e.id)).size,21);
 assert.deepEqual(ESTATE_GROUPS.map(g=>[g.id,ESTATES.filter(e=>e.group===g.id).length]),[['worldly',5],['rank',9],['clergy',7]]);
 assert.equal(new Set(ESTATE_GROUPS.map(g=>g.sectionId)).size,3);
 assert.equal(ESTATES.filter(e=>e.id==='clergy-inquisitor').length,1);
 assert(!ESTATES.some(e=>e.id.includes('visitator')));
});
test('eight male class prototypes follow the user-defined roles',()=>{
 assert.deepEqual(CLASS_PROTOTYPES.map(p=>p.id),['reichsknecht','reichsritter','ulan','fechtmeister','mariner','kampfbarde','greifenreiter','demogryphenritter']);
 assert(CLASS_PROTOTYPES.every(p=>p.gender==='male'));
 assert.match(html(),/Frauen dürfen in Mathringen keine Krieger sein/);
 assert.match(CLASS_PROTOTYPES.find(p=>p.id==='mariner').equipment,/Köcher|Rückenköcher/);
});
test('griffin riding remains exceptional and prototype examples do not assign house classes',()=>{
 assert.equal(HOUSES.filter(h=>h.prototypeId==='greifenreiter').length,1);
 assert.equal(HOUSES.find(h=>h.prototypeId==='greifenreiter').id,'martel');
 assert(HOUSES.filter(h=>!h.warrior).every(h=>h.prototypeStatus==='illustrative-example'));
 assert.equal(HOUSES.filter(h=>h.warrior).length,1);
 assert.match(REALM_CONTEXT.introduction,/wenige Ausnahmen/);
});
test('country and imperial-family signs remain separate',()=>{
 assert.equal(ARTWORKS.length,1);assert.equal(ARTWORKS[0].kind,'realm');
 assert.notEqual(ARTWORKS[0].image,HOUSES.find(h=>h.imperial).crest);
 assert.match(ARTWORKS[0].description,/getrennt/);
});
test('the shared gods retain their 9+5+5 grouping with Aelthar among the sovereigns',()=>{
 assert.deepEqual(FAITH_CONTEXT.groups.map(g=>g.names.length),[9,5,5]);
 assert.equal(new Set(FAITH_CONTEXT.groups.flatMap(g=>g.names)).size,19);
 assert(FAITH_CONTEXT.groups[1].names.includes('Aelthar'));
 assert(FAITH_CONTEXT.groups[0].names.includes('Lyris'));
 assert(!FAITH_CONTEXT.groups[0].names.includes('Aelthar'));
});
test('real-world inspiration and raw generator prompts never enter the page projection',()=>{
 assert.doesNotMatch(html(),/katholisch|Holy Roman|Heiliges Römisches|Witcher|Nilfgaard|Deutscher Nation|Prussian/i);
 for(const entry of [...HOUSES,...ESTATES,...CLASS_PROTOTYPES,...ARTWORKS]){
  assert(!Object.hasOwn(entry,'prompt'));assert(!Object.hasOwn(entry,'references'));
 }
 assert.doesNotMatch(html(),/onclick=|oninput=|onchange=/i);
});
test('draft movement, undo and reset preserve ranks and canonical source objects',()=>{
 const state=makeState(),before=JSON.stringify(HOUSES);
 assert.deepEqual(state.current(),initial);
 assert(state.move('martel','seat-02'));assert.equal(state.current().martel,'seat-02');
 assert(state.undo());assert.deepEqual(state.current(),initial);
 state.move('cassel',null);assert.equal(state.current().cassel,null);
 assert(state.reset());assert.deepEqual(state.current(),initial);
 assert.equal(JSON.stringify(HOUSES),before);
 assert.equal(PLACEMENT_STORAGE_KEY,'aleria:proposal:mathringen:placements:v1');
});
test('foreign and incomplete draft imports are rejected atomically',()=>{
 const state=makeState(),valid=JSON.parse(state.serialize());
 assert.throws(()=>state.restore({...valid,realm:'kemetara'}),/kein Mathringen-Entwurf/);
 assert.deepEqual(state.current(),initial);
 assert.throws(()=>state.restore({...valid,placements:{martel:'seat-02'}}),/unvollständig/);
 assert.deepEqual(state.current(),initial);
 const bad={...valid,placements:{...valid.placements,martel:'foreign-seat'}};
 assert.throws(()=>state.restore(bad),/Unbekanntes/);assert.deepEqual(state.current(),initial);
});
test('all 76 artwork files and originals are present in their scoped categories',async()=>{
 const art=[...HOUSES,...ESTATES,...CLASS_PROTOTYPES,...ARTWORKS,...HOUSES.flatMap(h=>h.warrior?[h.warrior]:[])];assert.equal(art.length,76);
 assert(art.every(a=>a.ready));assert.equal(new Set(art.map(a=>a.image)).size,76);
 for(const entry of art){await access(new URL(entry.image,realm));await access(new URL(entry.fullsize,realm));}
 const proposal=createMapProposal({houses:HOUSES,placements:initial});
 assert.equal(proposal.clans.length,45);
});
test('authoring sources and manifests stay outside a later delivery package',()=>{
 for(const file of ['sources/page-content.json','scripts/build-data.mjs','source-import.json','assets.source.json','assets/estates/generated/rank-page.png','assets/estates/rank-manifest.json','assets/warriors/manifest.json'])assert(isAuthoringArchive('Vorschau/Mathringen/'+file),file);
 for(const file of ['index.html','house-data.mjs','assets/emblems/production/house-martel.png','assets/estates/previews/rank-page.webp','assets/maps/mathringen.webp'])assert(!isAuthoringArchive('Vorschau/Mathringen/'+file),file);
});


test('complete 44-house drafts upgrade without losing old movements; malformed imports remain atomic',()=>{
 const state=makeState(),legacy={schemaVersion:1,realm:'mathringen',placements:Object.fromEntries(HOUSES.filter(h=>h.id!=='splettinger').map(h=>[h.id,h.sourceSeat]))};
 legacy.placements.martel='seat-02';legacy.placements.cassel=null;
 state.restore(legacy);assert.equal(state.current().martel,'seat-02');assert.equal(state.current().cassel,null);assert.equal(state.current().splettinger,null);
 assert.equal(Object.keys(state.current()).length,45);
 const before=state.current(),incomplete={...legacy,placements:{...legacy.placements}};delete incomplete.placements.cassel;
 assert.throws(()=>state.restore(incomplete),/unvollständig/);assert.deepEqual(state.current(),before);
});
test('Splettinger owns one male house figure while its rank and place stay open',()=>{
 const house=HOUSES.find(h=>h.id==='splettinger');assert(house);
 assert.equal(house.nameStatus,'user-established');assert.equal(house.rank,'Rang offen');assert.equal(house.sourceSeat,null);
 assert.deepEqual(house.palette,['Rot','Weiß','Schwarz']);assert.match(house.motif,/brauner.*Hengst/);
 assert.equal(house.prototypeId,null);assert.equal(house.warrior.id,'house-splettinger');assert.equal(house.warrior.gender,'male');assert(house.warrior.ready);
 assert(!CLASS_PROTOTYPES.some(p=>p.id===house.warrior.id));
 assert.match(CLASS_PROTOTYPES.find(p=>p.id==='demogryphenritter').description,/flügellosen/);
});
test('church practice protects noble latitude and controls the populace without inventing civil immunity',()=>{
 const realm=REALM_CONTEXT.themes.map(section=>section.text).join(' '),faith=FAITH_CONTEXT.sections.map(section=>section.text).join(' ');
 assert.match(realm,/Kirche lässt den Adel gewähren/);assert.match(realm,/sündigen/);assert.match(realm,/Druck.*Kontrolle.*Volk/);
 assert.match(faith,/Schonung des Adels ist ein Grundzug/);assert.match(faith,/allgemeine weltliche Immunität/);
});
