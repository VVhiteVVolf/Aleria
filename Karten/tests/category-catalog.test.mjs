import assert from 'node:assert/strict';
import {existsSync, readFileSync} from 'node:fs';
import test from 'node:test';
import '../assets/js/pins/category-catalog.js';
import {mergeMarkingPins} from '../tools/merge-marking-pins.mjs';

const catalog = globalThis.KartoCategoryCatalog;

test('legacy maps gain the common smaller types without replacing their categories', () => {
  const state = {cats:[
    {id:'user-farm',label:'Einfacher Hof',color:'#123456',marker:'/own.png'},
    {id:'user-castle',label:'Castell/ Burg',color:'#987654'},
    {id:'user-estate',label:'Anwesen',color:'#abcdef'},
    {id:'user-camp',label:'Lager',color:'#555555'},
    {id:'user-home',label:'Heim',color:'#234567'},
    {id:'other',label:'Mein eigener Ort',color:'#999999'},
  ]};
  const before = structuredClone(state);
  const result = catalog.upgrade(state);
  assert.deepEqual(state, before);
  assert.deepEqual(result.cats.slice(0,state.cats.length), state.cats);
  for(const key of ['bauernhof','burg','anwesen','lagerplatz','wohnhaus']){
    assert.equal(result.cats.some(item => item.id === 'location-'+key), false);
  }
  assert.ok(result.cats.some(item => item.label === 'Mine'));
  assert.equal(new Set(result.cats.map(item => item.id)).size, result.cats.length);
});

test('upgrades are idempotent and respect later removal or renaming', () => {
  const once = catalog.upgrade({cats:[]});
  assert.deepEqual(catalog.upgrade(once), once);
  const mine = once.cats.find(item => item.id === 'location-mine');
  mine.label = 'Meine Bergwerke';
  once.cats = once.cats.filter(item => item.id !== 'location-quelle');
  assert.deepEqual(catalog.upgrade(once), once);
  assert.match(catalog.placeholder(mine), /location-mine\.webp$/);
});

test('all default types have unique identities, canonical names, and local markers', () => {
  const defs = catalog.definitions;
  assert.equal(new Set(defs.map(item => item.id)).size, defs.length);
  assert.equal(new Set(defs.map(item => item.label)).size, defs.length);
  assert.equal(catalog.defaults().length, defs.length);
  for(const entry of defs){
    if(entry.marker) assert.ok(existsSync(new URL('../../'+entry.marker.slice(1), import.meta.url)), entry.marker);
    assert.equal(catalog.definition({label:entry.label}), entry);
  }
});

test('every named type from the supplied symbol sheet is represented', () => {
  const labels = JSON.parse(readFileSync(new URL('../docs/location-symbol-types.json',import.meta.url),'utf8'));
  for(const label of labels) assert.ok(catalog.definition({label}),label);
  for(const [general,specific] of [
    ['Brauerei','Brauersiedlung'],['Gestüt','Rosszucht Siedlung'],['Turm','Magierturm'],
    ['Quelle','Heiße Quellen'],['Burg','Festung'],['Hain','Verwunschener Wald'],
  ]) assert.notEqual(catalog.definition({label:general}).id,catalog.definition({label:specific}).id);
});

test('previously upgraded maps receive only the new symbol types', () => {
  const earlier = catalog.defaults().filter(item => catalog.definition(item).addedIn < 2 && item.id !== 'location-mine');
  const state = {cats:earlier,categoryCatalogVersion:1};
  const upgraded = catalog.upgrade(state);
  assert.ok(upgraded.cats.some(item => item.id === 'location-magierturm'));
  assert.equal(upgraded.cats.some(item => item.id === 'location-mine'),false);
  assert.deepEqual(upgraded.cats.slice(0,earlier.length),earlier);
  assert.deepEqual(catalog.upgrade(upgraded),upgraded);
});

test('marking import preserves existing pins and media, matches by position, and stays idempotent', () => {
  const existing = {id:'user-pin',title:'Mein Name',x:.15,y:.15,cat:'mine-custom',crest:'/own-crest.png',extra:{keep:true}};
  const state = {cats:[{id:'mine-custom',label:'Mine',color:'#123456'}],pins:[existing],dm:{notes:'keep'}};
  const inventory = {imageSize:[1000,1000],crest:'/crest.png',banner:'/banner.png',markings:[
    {id:'a',title:'Mine',categoryId:'location-mine',templateId:'handwerk',bounds:[100,100,200,200]},
    {id:'b',title:'Mine',categoryId:'location-mine',templateId:'handwerk',bounds:[700,700,800,800]},
  ]};
  const result = mergeMarkingPins(state,inventory);
  assert.deepEqual(result.state.pins[0],existing);
  assert.equal(state.pins.length,1);
  assert.equal(result.state.pins.length,2);
  assert.deepEqual(result.state.dm,state.dm);
  assert.equal(result.state.pins[1].cat,'mine-custom');
  assert.equal(result.state.pins[1].crest,inventory.crest);
  assert.equal(result.state.pins[1].banner,inventory.banner);
  assert.equal(result.state.pins[1].templateId,'handwerk');
  assert.deepEqual(result.state.pins[1].table,globalThis.KartoPinTablePresets.createTable('handwerk',{label:'Mine'}));
  assert.ok(result.state.pins[1].table.every(row => row.v === ''));
  assert.equal(result.state.pins[1].img,'');
  assert.deepEqual(mergeMarkingPins(result.state,inventory).state,result.state);
});

test('every reviewed Gwynthor symbol has one corresponding pin', () => {
  const base = '../Cenyr/celtigerns-wacht/llamrais-ankunft/gwynthor-bannkreis/';
  const inventory = JSON.parse(readFileSync(new URL(base+'markings.inventory.json',import.meta.url),'utf8'));
  const {state} = JSON.parse(readFileSync(new URL(base+'data.json',import.meta.url),'utf8'));
  const result = mergeMarkingPins(state,inventory);
  assert.equal(result.matches.length,inventory.markings.length);
  assert.equal(result.matches.filter(match => match.added).length,0);
  assert.equal(new Set(result.matches.map(match => match.pin)).size,inventory.markings.length);
  assert.deepEqual(result.state,state);
  for(const marking of inventory.markings){
    assert.ok(globalThis.KartoPinTemplateCatalog.get(marking.templateId), marking.id);
    const pin = state.pins.find(item => item.id === marking.id);
    if(!pin) continue;
    assert.equal(pin.templateId,marking.templateId,pin.id);
    assert.deepEqual(pin.table,globalThis.KartoPinTablePresets.createTable(marking.templateId,catalog.definition({id:marking.categoryId})));
  }
});

test('template tables are independent copies and unknown templates cannot create bare pins', () => {
  const templates = globalThis.KartoPinTemplateCatalog;
  const first = templates.createTable('landwirtschaft');
  const second = templates.createTable('landwirtschaft');
  first[0].v = 'Edited farm';
  assert.equal(second[0].v,'');
  assert.equal(templates.get('landwirtschaft').table[0].v,'');
  const inventory = {imageSize:[100,100],markings:[
    {id:'unassigned',title:'Farm',categoryId:'location-bauernhof',bounds:[10,10,20,20]},
  ]};
  assert.throws(() => mergeMarkingPins({pins:[]},inventory),/Unknown pin template/);
});
