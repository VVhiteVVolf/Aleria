import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {houses as iathHouses} from '../Iathneach/house-data.mjs';
import {counties as iathCounties,settlements as iathSeats,territoryArt as iathArt} from '../Iathneach/territory-data.mjs';
import {houses as occupiedHouses} from '../Triarchie/house-data.mjs';
import {counties as occupiedCounties,settlements as occupiedSeats,territoryArt as occupiedArt} from '../Triarchie/territory-data.mjs';
import {createPlacementState as createIathDraft} from '../Iathneach/placement-state.mjs';
import {createPlacementState as createOccupiedDraft} from '../Triarchie/placement-state.mjs';
import {warriors as iathWarriors} from '../Iathneach/warrior-data.mjs';
import {warriors as occupiedWarriors} from '../Triarchie/warrior-data.mjs';
import {renderOccupation} from '../shared/country-workbench/occupation-view.mjs';

const workspace=new URL('../../',import.meta.url);
const countryRoot=name=>new URL(`Vorschau/${name}/`,workspace);
const json=async url=>JSON.parse(await readFile(url,'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');

test('Iathneachs zwei vorgegebenen Sitze und sieben freie Clans bleiben getrennt von Rängen',()=>{
 const state=createIathDraft(),original=state.current();
 assert.equal(iathHouses.length,9);
 assert.equal(original.cetchathach,'botharin');assert.equal(original.farraigeach,'sgeir-tearmainn');
 assert.equal(Object.values(original).filter(v=>v===null).length,7);
 assert.ok(state.move('salaig','mharaich'));assert.equal(state.current().salaig,'mharaich');
 assert.equal(iathHouses.find(h=>h.id==='salaig').sourceSeat,null);
 assert.ok(state.undo());assert.deepEqual(state.current(),original);
 assert.equal(iathHouses.find(h=>h.id==='farraigeach').formerSeat,'Cuansioda');
});

test('Entwurfsimporte sind atomar und lehnen fremde Länder, fehlende Familien und fremde Orte ab',()=>{
 const state=createIathDraft(),before=state.current();
 assert.throws(()=>state.restore(JSON.parse(createOccupiedDraft().serialize())));
 assert.throws(()=>state.restore({schemaVersion:1,realm:'iathneach',placements:{...before,farraigeach:'cuansioda'}}));
 const missing={...before};delete missing.salaig;
 assert.throws(()=>state.restore({schemaVersion:1,realm:'iathneach',placements:missing}));
 assert.deepEqual(state.current(),before);
 state.move('tairise','fiontarach');const imported=createIathDraft();imported.restore(JSON.parse(state.serialize()));
 assert.deepEqual(imported.current(),state.current());assert.ok(imported.reset());assert.deepEqual(imported.current(),before);
});

test('Jeder Kartenort gehört genau einer Großregion an; alle 27 Gebietszeichen sind abgedeckt',()=>{
 for(const [counties,seats,art] of [[iathCounties,iathSeats,iathArt],[occupiedCounties,occupiedSeats,occupiedArt]]){
  const membership=counties.flatMap(c=>c.seats);
  assert.equal(new Set(membership).size,seats.length);assert.equal(membership.length,seats.length);
  assert.deepEqual(new Set(membership),new Set(seats.map(s=>s.id)));
  assert.equal(new Set(art.map(t=>t.id)).size,counties.length+seats.length);
  for(const s of seats){assert.ok(counties.some(c=>c.id===s.county&&c.seats.includes(s.id)));for(const v of [...s.point,...s.pin])assert.ok(Number.isFinite(v)&&v>=0&&v<=100);assert.ok(art.some(t=>t.id===s.art));}
 }
 assert.equal(iathArt.length+occupiedArt.length,27);
 assert.ok(iathArt.every(t=>t.shape==='banner'));
 assert.equal(occupiedArt.filter(t=>t.shape==='banner').length,5);
 assert.equal(occupiedArt.filter(t=>t.shape==='kite').length,10);
});

test('Besatzung erhält Herkunft und ehemalige Herrschaft ohne doppelte aktuelle Farraigeach-Zuordnung',()=>{
 assert.equal(occupiedSeats.length,12);assert.equal(occupiedHouses.length,11);
 assert.equal(occupiedSeats.filter(s=>s.originRealm==='iathneach').length,4);
 assert.equal(occupiedSeats.filter(s=>s.originRealm==='aldingen').length,8);
 assert.ok(occupiedSeats.every(s=>s.continent==='lothir'&&s.occupier==='triarchie'));
 assert.equal(occupiedSeats.find(s=>s.id==='cuansioda').formerHouseId,'farraigeach');
 assert.ok(!occupiedHouses.some(h=>h.sourceSeat==='cuansioda'||h.id==='farraigeach'));
 const state=createOccupiedDraft();state.move('taghan','hohenreede');
 assert.equal(occupiedHouses.find(h=>h.id==='taghan').originRealm,'iathneach');
 assert.ok(renderOccupation('iathneach').includes('Mac Farraigeach'));
 assert.ok(renderOccupation('aldingen').includes('Haus Hufschlag'));
 assert.ok(!renderOccupation('aldingen').includes('Clan An Taghan'));
 assert.ok(!renderOccupation('iathneach').includes('Haus Hufschlag'));
});

test('Alle Familien haben genau eine Figur mit echten lokalen Klassen- und Bildverweisen',async()=>{
 for(const [name,houses,warriors,art] of [['Iathneach',iathHouses,iathWarriors,iathArt],['Triarchie',occupiedHouses,occupiedWarriors,occupiedArt]]){
  const root=countryRoot(name);
  assert.deepEqual(new Set(warriors.map(w=>w.id)),new Set(houses.map(h=>h.id)));
  assert.equal(warriors.length,houses.length);
  for(const asset of [...houses.flatMap(h=>[h.crest,h.fullsize]),...warriors.flatMap(w=>[w.image,w.fullsize]),...art.flatMap(t=>[t.image,t.fullsize])])await access(new URL(asset,root));
  for(const w of warriors){const url=new URL(w.classHref,root),anchor=url.hash.slice(1);url.hash='';const html=await readFile(url,'utf8');if(anchor)assert.ok(html.includes(`id="${anchor}"`),w.classHref);}
 }
});

test('Gelieferte Originale und sämtliche Produktionsbilder stimmen mit ihren Hashbelegen überein',async()=>{
 for(const name of ['Iathneach','Triarchie']){
  const root=countryRoot(name);
  for(const source of await json(new URL('assets.source.json',root)))assert.equal(sha(await readFile(new URL(source.original,workspace))),source.sha256,source.sourceFile);
  const heraldry=await json(new URL('assets/art-manifest.json',root));
  assert.equal(heraldry.entries.length,name==='Iathneach'?12:26);
  for(const entry of heraldry.entries){assert.equal(sha(await readFile(new URL(entry.source,root))),entry.sourceSha256);assert.equal(sha(await readFile(new URL(entry.production,root))),entry.productionSha256);assert.equal(sha(await readFile(new URL(entry.preview,root))),entry.previewSha256);assert.equal(entry.rgbUnchanged,true);}
 }
});
