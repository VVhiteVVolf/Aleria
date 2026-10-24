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
test('unchanged maps retain their baseline; reviewed Leitheach revision 2 retains the symbol-map policy',()=>{
 const baseline=JSON.parse(fs.readFileSync(new URL('Kontinente/modules/faelaorn-skjaerheim/sources/alben-pin-baseline.json',root),'utf8'));
 const hash=v=>createHash('sha256').update(JSON.stringify(v)).digest('hex');
 const ctx={window:{}};vm.runInNewContext(fs.readFileSync(new URL('Karten/karten.registry.js',root),'utf8'),ctx);
 assert.equal(baseline.length,17);
 for(const map of baseline){
  const stored=JSON.parse(fs.readFileSync(new URL('Karten/'+map.path,root),'utf8'));
  const {state}=stored;
  if(map.id==='leitheach'||map.id.startsWith('leitheach-')){
   // The October 22 baseline had no Leitheach places and displaced borders.
   // Exact corrected geometry and all source markers are covered separately.
   assert.equal(stored.revision,2);
   assert.ok(state.pins.length>0);
   assert.ok(state.pins.every(pin=>pin.sourceRef?.markerId===pin.id));
  }else{
   assert.equal(hash(state.pins),map.pins,map.id);assert.equal(hash(state.regions),map.regions,map.id);
  }
  assert.equal(state.showMarkers,true);assert.equal(state.pinVisibilityVersion,1);
  assert.equal(ctx.window.KartoMapRegistry.byId(map.id).markerPresentation,'symbols');
 }
 for(const map of ctx.window.KartoMapRegistry.all().filter(m=>/^(cenyr|aldrimar)-/.test(m.id)))assert.notEqual(map.markerPresentation,'symbols',map.id);
});
