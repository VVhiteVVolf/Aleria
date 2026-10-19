import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { territoriesById, descriptionsById, describePlace } from '../../Karten/Cenyr/graue-weite/places.mjs';
import { createReviewedPins } from '../../Karten/modules/territory-places/reviewed-pin-import.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root=new URL('../../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const json=file=>JSON.parse(read(file));
const context={window:{}};
for(const file of ['kontinente.registry.js','assets/js/herrschaft-data.js'])vm.runInNewContext(read('Kontinente/'+file),context);
globalThis.ALERIA_HERRSCHAFT_DATA=context.window.ALERIA_HERRSCHAFT_DATA;
const entries=context.window.KONTINENTE_REGISTRY.filter(e=>e.page.includes('Grafschaft Graue Weite/'));
const pages=await Promise.all(entries.map(async e=>(await import(new URL('Kontinente/'+e.data,root))).default));
const source=json('Karten/Cenyr/graue-weite/markers.source.json');
const document=json('Karten/Cenyr/graue-weite/data.json');
const pins=document.state.pins;
const original=json('Kontinente/docs/graue-weite/worldanvil/markers.worldanvil.json');
const places=pages[0].view.geography.domains.flatMap(d=>d.sections.flatMap(s=>s.places));
const fields=marker=>Object.fromEntries(marker.fields.map(f=>[f.id.replace('mapbundle_marker_',''),f.value]));
const markerAt=index=>pins.find(p=>p.sourceRef.markerId===original.markers[index-1].id);
const catalogContext=vm.createContext({});
for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js'])vm.runInContext(read('Karten/assets/js/pins/'+file),catalogContext);

test('the eleven supplied pages and complete Chrome captures are archived byte for byte',()=>{
  for(const [file,count,prefix] of [['sources.json',11,''],['worldanvil/sources.json',4,'worldanvil/']]){
    const manifest=json('Kontinente/docs/graue-weite/'+file);assert.equal(manifest.length,count);
    for(const item of manifest){
      const bytes=fs.readFileSync(new URL('Kontinente/docs/graue-weite/'+prefix+item.file,root));
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
    }
  }
});

test('all 102 marker identities, exact coordinates and full texts are retained',()=>{
  assert.equal(original.markerCount,102);assert.equal(original.markers.length,102);
  assert.equal(pins.length,102);assert.equal(descriptionsById.size,102);
  assert.equal(new Set(pins.map(p=>p.sourceRef.markerId)).size,102);
  assert.deepEqual(source.imageSize,[4096,2492]);
  for(const marker of original.markers){
    const f=fields(marker);const pin=pins.find(p=>p.sourceRef.markerId===marker.id);
    assert.ok(pin,marker.id);assert.equal(pin.id,'graue-weite-'+marker.id);
    assert.equal(pin.sourceRef.mapId,original.mapId);assert.equal(pin.sourceRef.title,f.title);
    assert.equal(pin.x,Number(f.geoX)/4096);assert.equal(pin.y,1-Number(f.geoY)/2492);
    assert.equal(pin.secret,false);assert.equal(f.state,'public');assert.equal(f.seeded,'');
    const text=f.description.replace(/\[\/?(?:b|i|u)\]/g,'').replace(/\[\/?(?:quote|br|h[1-6])\]/g,' ').replace(/\s+/g,' ').trim();
    assert.equal(pin.text,text);assert.ok(pin.text.length>150);
    assert.equal(places.find(p=>p.id===pin.id).description,text);
  }
  assert.ok(markerAt(78).text.includes('Einführung'));
  assert.ok(markerAt(78).text.includes('Geschichte'));
  assert.ok(markerAt(78).text.includes('Gegenwart'));
});

test('the actual World-Anvil rendering independently confirms all bottom-left positions',()=>{
  const geometry=json('Kontinente/docs/graue-weite/worldanvil/map-geometry.worldanvil.json');
  const images=json('Kontinente/docs/graue-weite/worldanvil/map-images.worldanvil.json');
  const point=style=>style.match(/translate3d\(([-.\d]+)px, ([-.\d]+)px/).slice(1).map(Number);
  const [dx,dy]=point(images[0].style);assert.equal(geometry.markers.length,103);
  for(const [i,marker] of original.markers.entries()){
    const f=fields(marker);const [x,y]=point(geometry.markers[i+1].style);
    assert.equal(x,Number(f.geoX)+dx);assert.equal(y,2492-Number(f.geoY)+dy);
    assert.equal(geometry.markers[i+1].alt.trim().replace(/&amp;/g,'&'),f.title.trim());
  }
});

test('same-name settlements remain distinct and only a marker’s own text resolves a generic title',()=>{
  const drynth=pins.filter(p=>p.title==='Drynth');assert.equal(drynth.length,2);
  assert.notEqual(drynth[0].id,drynth[1].id);assert.notEqual(drynth[0].dominionId,drynth[1].dominionId);
  assert.equal(markerAt(27).title,'Dolgan');assert.equal(markerAt(27).sourceRef.title,'Fischersiedlung');
  assert.equal(markerAt(27).dominionId,'herrschaft-blaidd');
  assert.equal(markerAt(5).dominionId,'herrschaft-blaidd');
  assert.equal(markerAt(51).dominionId,'herrschaft-blaidd');
  assert.equal(markerAt(56).dominionId,'herrschaft-gwaedlyd');
  assert.equal(markerAt(93).dominionId,'baronie-schimmerkueste');
  assert.equal(source.unpositionedPlaces.length,6);
  assert.equal(places.some(p=>p.name==='Glyndor'),false);
  assert.equal(places.length,108);
  for(const place of source.unpositionedPlaces){
    assert.equal(place.x,undefined);assert.equal(place.y,undefined);
    assert.equal(pins.some(p=>p.id===place.id),false);
    assert.equal(places.find(p=>p.id===place.id).description,'');
  }
  assert.equal(new Set(places.map(p=>p.id)).size,places.length);
});

test('local house selection, historical clans and source council roles keep their own scope',()=>{
  assert.equal(pages.length,11);
  assert.deepEqual(pages.map(p=>p.view.familySections.flatMap(s=>s.cards).length),[15,1,1,2,1,2,1,1,1,1,1]);
  for(const page of pages)assert.equal(page.view.familySections.flatMap(s=>s.cards).filter(h=>h.featured).length,1);
  const houses=pages[0].view.familySections.flatMap(s=>s.cards);
  assert.ok(houses.some(h=>h.id==='haus-blaidd-tredegar'));
  assert.equal(houses.some(h=>h.id==='haus-blaidd'),false);
  assert.notEqual(pages[0].view.familySections.find(s=>s.title==='Antike Crannath-Clans').variant,'extinct');
  assert.equal(pages[0].view.familySections.find(s=>s.title==='Ausgestorbene Häuser').cards[0].id,'haus-tanwyn');
  const blaiddVassal=pages[6].view.vassalGroups.flatMap(g=>g.members).find(m=>m.seat==='Dolgan');
  assert.equal(blaiddVassal.office,'Bürgermeister');
  assert.equal(pages[2].view.vassalGroups.flatMap(g=>g.members).filter(m=>m.seat==='Glydor').length,1);
  assert.equal(pages[4].view.article.parentLabel,'Silberwald');
  assert.equal(territoriesById.get('herrschaft-skelettkueste').parentId,'baronie-silberwald');
  assert.ok(pages[0].view.article.copy.banditry.length>0);
  assert.equal(pages[0].view.article.floraSections.length,4);
  assert.deepEqual(pages[3].view.article.copy.flora,[]); // The supplied page contains only a placeholder.
});

test('every place uses a current, existing icon and template, with local house and independent banner',()=>{
  for(const pin of pins){
    const t=territoriesById.get(pin.dominionId);assert.equal(pin.house,t.house);
    assert.equal(pin.crest,t.crest);assert.equal(pin.banner,t.banner);
    assert.ok(catalogContext.KartoPinTemplateCatalog.get(pin.templateId),pin.templateId);
    for(const asset of [pin.pinMarker,pin.crest,pin.banner])assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
  }
  for(const t of territoriesById.values())if(t.bannerSha256){
    const bytes=fs.readFileSync(new URL('.'+t.banner,root));assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),t.bannerSha256);
  }
  assert.ok(markerAt(2).pinMarker.endsWith('/j-gerlager.png'));
  assert.ok(markerAt(44).pinMarker.endsWith('/j-gerlager.png'));
  assert.ok(markerAt(8).pinMarker.endsWith('/heiligtum.png'));
  assert.ok(markerAt(51).pinMarker.endsWith('/l-ndliche-universit-t.png'));
  const lease=markerAt(81);assert.equal(lease.title,'Bragdyddol');
  assert.equal(lease.house,'Haus Teyrngarch');
  assert.equal(lease.table.find(r=>r.k==='Verpächter').v,'Haus Morfil');
  assert.ok(lease.banner.includes('Sonnenküste'));
});

test('live current symbols replace the old baked-in icons while the original map stays available',()=>{
  const config={window:{}};vm.runInNewContext(read('Karten/Cenyr/graue-weite/template.config.js'),config);
  const settings=config.window.KARTO_CONFIG;
  assert.equal(settings.images.pins,'');
  assert.equal(document.state.mapImages.pins,'');
  assert.equal(document.state.showMarkers,true);
  assert.deepEqual([document.state.dotSize,document.state.lblSize],[80,50]);
  assert.ok(settings.extraLayers.some(l=>l.id==='graue-weite-original-markers'&&l.url.endsWith('/Kartenbilder/pins.webp')));
  assert.ok(document.state.extraLayers.some(l=>l.id==='graue-weite-original-markers'));
});

test('source identity survives renaming and the first-import guard protects all subsequent edits',()=>{
  const renamed=structuredClone(source);renamed.markers[0].title+=' – neuer Anzeigename';
  const generated=createReviewedPins(renamed,{catalog:catalogContext.KartoCategoryCatalog,presets:catalogContext.KartoPinTablePresets,describePlace,region:'Graue Weite'});
  assert.equal(generated[0].id,pins[0].id);assert.deepEqual(generated[0].sourceRef,pins[0].sourceRef);
  const options={folder:new URL('Karten/Cenyr/graue-weite/',root),region:'Graue Weite',countyId:'grafschaft-graue-weite',describePlace,territoriesById};
  const before=read('Karten/Cenyr/graue-weite/data.json');importReviewedTerritory(options);
  assert.throws(()=>importReviewedTerritory({...options,write:true}),/bereits bearbeitet/);
  assert.equal(read('Karten/Cenyr/graue-weite/data.json'),before);
});
