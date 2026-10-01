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

test('marking import preserves existing pins and media, matches by position, and stays idempotent', () => {
  const existing = {id:'user-pin',title:'Mein Name',x:.15,y:.15,cat:'mine-custom',crest:'/own-crest.png',extra:{keep:true}};
  const state = {cats:[{id:'mine-custom',label:'Mine',color:'#123456'}],pins:[existing],dm:{notes:'keep'}};
  const inventory = {imageSize:[1000,1000],crest:'/crest.png',banner:'/banner.png',markings:[
    {id:'a',title:'Mine',categoryId:'location-mine',bounds:[100,100,200,200]},
    {id:'b',title:'Mine',categoryId:'location-mine',bounds:[700,700,800,800]},
  ]};
  const result = mergeMarkingPins(state,inventory);
  assert.deepEqual(result.state.pins[0],existing);
  assert.equal(state.pins.length,1);
  assert.equal(result.state.pins.length,2);
  assert.deepEqual(result.state.dm,state.dm);
  assert.equal(result.state.pins[1].cat,'mine-custom');
  assert.equal(result.state.pins[1].crest,inventory.crest);
  assert.equal(result.state.pins[1].banner,inventory.banner);
  assert.deepEqual(result.state.pins[1].table,[]);
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
});
