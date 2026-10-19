import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { territoriesById, descriptionsById, describePlace } from '../../Karten/Cenyr/klaueninseln/places.mjs';
import { createReviewedPins } from '../../Karten/modules/territory-places/reviewed-pin-import.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root=new URL('../../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const json=file=>JSON.parse(read(file));
const context={window:{}};
for(const file of ['kontinente.registry.js','assets/js/herrschaft-data.js'])vm.runInNewContext(read('Kontinente/'+file),context);
globalThis.ALERIA_HERRSCHAFT_DATA=context.window.ALERIA_HERRSCHAFT_DATA;
const entries=context.window.KONTINENTE_REGISTRY.filter(e=>e.page.includes('Grafschaft Klaueninsel/'));
const pages=await Promise.all(entries.map(async e=>(await import(new URL('Kontinente/'+e.data,root))).default));
const source=json('Karten/Cenyr/klaueninseln/markers.source.json');
const document=json('Karten/Cenyr/klaueninseln/data.json');
const pins=document.state.pins;
const original=json('Kontinente/docs/klaueninseln/worldanvil/markers.worldanvil.json');
const countyPlaces=pages[0].view.geography.domains.flatMap(d=>d.sections.flatMap(s=>s.places));
const fields=marker=>Object.fromEntries(marker.fields.map(f=>[f.id.replace('mapbundle_marker_',''),f]));

test('the 14 supplied page sources and direct Chrome captures are archived with checksums',()=>{
  for(const [file,count,prefix] of [['sources.json',14,''],['worldanvil/sources.json',4,'worldanvil/']]){
    const manifest=json('Kontinente/docs/klaueninseln/'+file);assert.equal(manifest.length,count);
    for(const item of manifest){
      const bytes=fs.readFileSync(new URL('Kontinente/docs/klaueninseln/'+prefix+item.file,root));
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
    }
  }
});

test('all 46 original marker identities, coordinates and complete public texts are retained',()=>{
  assert.equal(original.markerCount,46);assert.equal(original.markers.length,46);
  assert.equal(pins.length,46);assert.equal(descriptionsById.size,46);
  assert.equal(new Set(pins.map(p=>p.sourceRef.markerId)).size,46);
  assert.equal(source.imageSize[0],4096);assert.equal(source.imageSize[1],2936);
  for(const marker of original.markers){
    const f=fields(marker);const pin=pins.find(p=>p.sourceRef.markerId===marker.id);
    assert.ok(pin,marker.id);assert.equal(pin.id,'klaueninseln-'+marker.id);
    assert.equal(pin.sourceRef.mapId,original.mapId);assert.equal(pin.sourceRef.title,f.title.value);
    assert.equal(pin.x,Number(f.geoX.value)/4096);assert.equal(pin.y,1-Number(f.geoY.value)/2936);
    assert.equal(pin.secret,false);assert.equal(f.state.value,'public');assert.equal(f.seeded.value,'');
    const text=f.description.value.replace(/\[\/?(?:quote|b|i|u|br)\]/g,' ').replace(/\s+/g,' ').trim();
    assert.equal(pin.text,text);assert.equal(countyPlaces.find(p=>p.id===pin.id).description,text);
  }
});

test('the browser-rendered positions independently confirm the bottom-left coordinate convention',()=>{
  const geometry=json('Kontinente/docs/klaueninseln/worldanvil/map-geometry.worldanvil.json');
  const images=json('Kontinente/docs/klaueninseln/worldanvil/map-images.worldanvil.json');
  const point=style=>style.match(/translate3d\(([-.\d]+)px, ([-.\d]+)px/).slice(1).map(Number);
  const [dx,dy]=point(images[0].style);
  assert.equal(geometry.markers.length,47); // Includes the editor's invisible placement handle.
  for(const [i,marker] of original.markers.entries()){
    const f=fields(marker);const [x,y]=point(geometry.markers[i+1].style);
    assert.equal(x,Number(f.geoX.value)+dx);assert.equal(y,2936-Number(f.geoY.value)+dy);
    assert.equal(geometry.markers[i+1].alt.trim(),f.title.value.trim());
  }
});

test('names are resolved from their own texts, while seven unpositioned caves remain register-only',()=>{
  for(const [name,text] of [['Talgarth','Talgarth'],['Llanvyr','Llanvyr'],['Zur Talrast','Taverne Zur Talrast'],['Zum Wandernden Bär','Taverne "Zum Wandernden Bär"']]){
    const pin=pins.find(p=>p.title===name);assert.ok(pin);assert.ok(pin.text.includes(text));
    assert.ok(pin.sourceRef.nameResolution);
  }
  assert.equal(countyPlaces.length,53);assert.equal(new Set(countyPlaces.map(p=>p.id)).size,53);
  assert.deepEqual(source.unpositionedPlaces.map(p=>p.title).sort(),['Donnergroll','Dunkelsturz','Frostkluft','Kargsschlund','Schattenschlund','Steinherzhöhle','Tiefenschlund']);
  for(const place of source.unpositionedPlaces){
    assert.equal(place.x,undefined);assert.equal(place.y,undefined);
    assert.equal(pins.some(p=>p.id===place.id),false);
    assert.equal(countyPlaces.find(p=>p.id===place.id).description,'');
  }
});

test('local house selection and historical family identities stay distinct',()=>{
  assert.equal(pages.length,14);
  assert.deepEqual(pages.map(p=>p.view.familySections.flatMap(s=>s.cards).length),[36,1,1,1,2,1,5,1,1,1,1,1,1,1]);
  for(const page of pages)assert.equal(page.view.familySections.flatMap(s=>s.cards).filter(h=>h.featured).length,1);
  const houses=pages[0].view.familySections.flatMap(s=>s.cards);
  assert.ok(houses.some(h=>h.id==='haus-blodyn-talgarth'));assert.ok(houses.some(h=>h.id==='haus-blodyn-aberdail'));
  assert.ok(houses.some(h=>h.id==='haus-diafol-talgarth'));assert.equal(houses.some(h=>h.id==='haus-diafol-trefgoch'),false);
  assert.equal(pages[7].view.familySections[0].cards[0].id,'haus-dianc-aberdail');
  const knight=pages[0].view.councilGroups.find(g=>g.title==='Ritterfürsten').members.find(m=>m.name==='Tryffin Diafol');
  assert.equal(knight.seat,'Talgarth');
  assert.ok(pages[0].view.article.copy.banditry.length>0);
  assert.ok(pages[1].view.article.floraSections.length>0);
});

test('each marker keeps the responsible local house, crest and independent territorial banner',()=>{
  for(const pin of pins){
    const t=territoriesById.get(pin.dominionId);assert.equal(pin.house,t.house);
    assert.equal(pin.crest,t.crest);assert.equal(pin.banner,t.banner);
    for(const asset of [pin.pinMarker,pin.crest,pin.banner])assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
  }
  for(const t of territoriesById.values())if(t.bannerSha256){
    const bytes=fs.readFileSync(new URL('.'+t.banner,root));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),t.bannerSha256);
  }
  assert.equal(pins.find(p=>p.title==='Zum Wandernden Bär').dominionId,'baronie-talklaue');
  assert.equal(pins.find(p=>p.title==='Tirwen').dominionId,'herrschaft-diafol');
  assert.equal(pins.find(p=>p.title==='Ard Dunrath').dominionId,'baronie-blutklaue');
});

test('source identities survive renamed markers and imports refuse to overwrite existing data',()=>{
  const catalogContext=vm.createContext({});
  for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js'])vm.runInContext(read('Karten/assets/js/pins/'+file),catalogContext);
  const renamed=structuredClone(source);renamed.markers[0].title+=' – geänderter Anzeigename';
  const generated=createReviewedPins(renamed,{catalog:catalogContext.KartoCategoryCatalog,presets:catalogContext.KartoPinTablePresets,describePlace,region:'Klaueninsel'});
  assert.equal(generated[0].id,pins[0].id);assert.deepEqual(generated[0].sourceRef,pins[0].sourceRef);
  const options={folder:new URL('Karten/Cenyr/klaueninseln/',root),region:'Klaueninsel',countyId:'grafschaft-klaueninsel',describePlace,territoriesById};
  const before=read('Karten/Cenyr/klaueninseln/data.json');importReviewedTerritory(options);
  assert.throws(()=>importReviewedTerritory({...options,write:true}),/bereits bearbeitet/);
  assert.equal(read('Karten/Cenyr/klaueninseln/data.json'),before);
});
