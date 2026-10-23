import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {validateRegions} from '../modules/regions/region-model.mjs';
import {territoriesById} from '../Dunfal/places.mjs';

const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url),'utf8'));
const capture=read('../Dunfal/sources/world-anvil.capture.json');
const {state}=read('../Dunfal/data.json');
const plain=s=>s.replace(/\[\/?(?:h1|quote|b|i)\]/gi,'').replace(/\*/g,'').replace(/\s+/g,' ').trim();

test('all 150 World Anvil IDs survive exactly once as 133 points and 17 region objects',()=>{
  assert.equal(capture.rows.length,150);assert.equal(state.pins.length,133);assert.equal(state.regions.length,17);
  assert.equal(capture.markers.length,150);
  const sourceIds=state.pins.map(p=>p.sourceRef.markerId).concat(state.regions.map(r=>r.source.markerId));
  assert.equal(new Set(sourceIds).size,150);
  assert.deepEqual(new Set(sourceIds),new Set(capture.markers.map(m=>m.id)));
  assert.doesNotThrow(()=>validateRegions(state.regions));
});

test('native image dimensions, bottom-left coordinates and all 23 descriptions are preserved',()=>{
  assert.deepEqual([capture.image.width,capture.image.height],[4063,4097]);
  for(const pin of state.pins){
    const source=capture.markers.find(m=>m.id===pin.sourceRef.markerId);
    const [x,y]=source.coordinate.split(':').map(Number);
    assert.equal(pin.x,x/4063);assert.equal(pin.y,1-y/4097);
    assert.equal(plain(pin.text),plain(source.description));
  }
  assert.equal(state.pins.filter(p=>p.text).length,23);
  assert.equal(state.pins.filter(p=>p.sourceRef.nameRecoveredFrom).length,9);
  assert.equal(state.dotSize,80);assert.equal(state.lblSize,50);
});

test('all pins use existing categories, templates, local symbols and valid dominions',()=>{
  const c=vm.createContext({});
  for(const file of ['category-catalog.js','pin-template-catalog.js'])vm.runInContext(fs.readFileSync(new URL('../assets/js/pins/'+file,import.meta.url),'utf8'),c);
  for(const pin of state.pins){
    assert.ok(c.KartoCategoryCatalog.definition({id:pin.cat}));assert.ok(c.KartoPinTemplateCatalog.get(pin.templateId));
    assert.ok(territoriesById.has(pin.dominionId));
    for(const src of [pin.pinMarker,pin.crest,pin.banner].filter(Boolean))assert.ok(fs.existsSync(new URL('../..'+src,import.meta.url)),src);
  }
});

test('unassigned numbered domains stay open while explicitly named seats have their evidenced owners',()=>{
  for(const number of ['I','II','III']){
    const t=territoriesById.get('dunfal-offen-'+number.toLowerCase());
    assert.equal(t.familyId,'');assert.equal(t.href,'');assert.equal(t.pending,true);
  }
  for(const [name,owner] of [['Cradh na Fírinne','oberherrschaft-tir-na-fathach'],['Dunfal','oberherrschaft-tir-na-rithe'],['Braighmòr','herrschaft-ailella'],['Caerthalas','herrschaft-cein'],['Dùnthàirne','herrschaft-birn'],['Burg der Fianna','herrschaft-fianna']]){
    assert.equal(state.pins.find(p=>p.title===name).dominionId,owner,name);
  }
});
