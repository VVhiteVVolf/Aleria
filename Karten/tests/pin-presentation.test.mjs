import fs from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=new URL('../../',import.meta.url),context=vm.createContext({});
vm.runInContext(fs.readFileSync(new URL('Karten/assets/js/pins/pin-presentation.js',root),'utf8'),context);
const resolve=(...args)=>JSON.parse(JSON.stringify(context.KartoPinPresentation.resolve(...args)));

test('old hidden defaults migrate on symbol maps without changing any marker content',()=>{
 const old={showMarkers:false,pins:[{id:'kept',text:'Local note',x:.2,y:.3}],regions:[{id:'kept-border'}]};
 const before=JSON.stringify(old);
 assert.deepEqual(resolve(old,{markerPresentation:'symbols'}),{markerPresentation:'symbols',pinVisibilityVersion:1,showMarkers:true});
 assert.equal(JSON.stringify(old),before);
 assert.deepEqual(resolve({markerPresentation:'symbols',showMarkers:false}),{markerPresentation:'symbols',pinVisibilityVersion:1,showMarkers:true});
});
test('subsequent deliberate symbol visibility choices survive subsequent loads',()=>{
 for(const showMarkers of [true,false])assert.equal(resolve({markerPresentation:'symbols',pinVisibilityVersion:1,showMarkers}).showMarkers,showMarkers);
});
test('maps with drawn markers retain their existing visibility settings',()=>{
 for(const showMarkers of [true,false])assert.deepEqual(resolve({showMarkers},{images:{pins:'drawn-map.webp'}}),{showMarkers});
 assert.deepEqual(resolve(),{showMarkers:false});
});
test('all 17 affected maps keep their pins and borders byte-for-byte, with no changes to embedded-marker map policy',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('Kontinente/modules/faelaorn-skjaerheim/sources/alben-pin-baseline.json',root),'utf8'));
 const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('Karten/karten.registry.js',root),'utf8'),ctx);
 assert.equal(baseline.length,17);
 for(const map of baseline){
  const {state}=JSON.parse(fs.readFileSync(new URL('Karten/'+map.path,root),'utf8'));
  assert.equal(hash(state.pins),map.pins,map.id);assert.equal(hash(state.regions),map.regions,map.id);
  assert.equal(state.showMarkers,true);assert.equal(state.pinVisibilityVersion,1);
  assert.equal(ctx.window.KartoMapRegistry.byId(map.id).markerPresentation,'symbols');
 }
 for(const map of ctx.window.KartoMapRegistry.all().filter(m=>/^(cenyr|aldrimar)-/.test(m.id)))assert.notEqual(map.markerPresentation,'symbols',map.id);
});
