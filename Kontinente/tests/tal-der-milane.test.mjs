import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { territoriesById, descriptionsById, describePlace } from '../../Karten/Cenyr/tal-der-milane/places.mjs';
import { createReviewedPins } from '../../Karten/modules/territory-places/reviewed-pin-import.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root=new URL('../../',import.meta.url);
const read=file=>fs.readFileSync(new URL(file,root),'utf8');
const json=file=>JSON.parse(read(file));
const context={window:{}};
for(const file of ['kontinente.registry.js','assets/js/herrschaft-data.js'])vm.runInNewContext(read('Kontinente/'+file),context);
globalThis.ALERIA_HERRSCHAFT_DATA=context.window.ALERIA_HERRSCHAFT_DATA;
const entries=context.window.KONTINENTE_REGISTRY.filter(e=>e.page.includes('Grafschaft Tal der Milane/'));
const pages=await Promise.all(entries.map(async e=>(await import(new URL('Kontinente/'+e.data,root))).default));
const source=json('Karten/Cenyr/tal-der-milane/markers.source.json');
const document=json('Karten/Cenyr/tal-der-milane/data.json');
const pins=document.state.pins;
const original=json('Kontinente/docs/tal-der-milane/worldanvil/markers.worldanvil.json');
const places=pages[0].view.geography.domains.flatMap(d=>d.sections.flatMap(s=>s.places));
const fields=marker=>Object.fromEntries(marker.fields.map(f=>[f.id.replace('mapbundle_marker_',''),f.value]));
const markerAt=index=>pins.find(p=>p.sourceRef.markerId===original.markers[index-1].id);
const catalogContext=vm.createContext({});
for(const file of ['category-catalog.js','pin-template-catalog.js','pin-table-presets.js'])vm.runInContext(read('Karten/assets/js/pins/'+file),catalogContext);

test('the seven supplied pages and complete Chrome captures are archived byte for byte',()=>{
  for(const [file,count,prefix] of [['sources.json',7,''],['worldanvil/sources.json',4,'worldanvil/']]){
    const manifest=json('Kontinente/docs/tal-der-milane/'+file);assert.equal(manifest.length,count);
    for(const item of manifest){
      const bytes=fs.readFileSync(new URL('Kontinente/docs/tal-der-milane/'+prefix+item.file,root));
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
    }
  }
});

test('all 83 marker identities, exact coordinates and full texts are retained',()=>{
  assert.equal(original.markerCount,83);assert.equal(original.markers.length,83);
  assert.equal(pins.length,83);assert.equal(descriptionsById.size,83);
  assert.equal(new Set(pins.map(p=>p.sourceRef.markerId)).size,83);
  assert.deepEqual(source.imageSize,[4096,4018]);
  for(const marker of original.markers){
    const f=fields(marker);const pin=pins.find(p=>p.sourceRef.markerId===marker.id);
    assert.ok(pin,marker.id);assert.equal(pin.id,'tal-der-milane-'+marker.id);
    assert.equal(pin.sourceRef.mapId,original.mapId);assert.equal(pin.sourceRef.title,f.title);
    assert.equal(pin.x,Number(f.geoX)/4096);assert.equal(pin.y,1-Number(f.geoY)/4018);
    assert.equal(pin.secret,false);assert.equal(f.state,'public');assert.equal(f.seeded,'');
    const text=f.description.replace(/\[\/?(?:b|i|u)\]/g,'').replace(/\[\/?(?:quote|br|h[1-6])\]/g,' ').replace(/\s+/g,' ').trim();
    assert.equal(pin.text,text);if(f.description)assert.ok(pin.text.length>150);else assert.equal(pin.text,'');
    assert.equal(places.find(p=>p.id===pin.id).description,text);
  }
  assert.equal(pins.filter(p=>p.text).length,78);
  assert.deepEqual(original.markers.filter(m=>!fields(m).description).map(m=>m.rowIndex),[12,30,65,76,77]);
});

test('the actual World-Anvil rendering independently confirms all bottom-left positions',()=>{
  const geometry=json('Kontinente/docs/tal-der-milane/worldanvil/map-geometry.worldanvil.json');
  const images=json('Kontinente/docs/tal-der-milane/worldanvil/map-images.worldanvil.json');
  const point=style=>style.match(/translate3d\(([-.\d]+)px, ([-.\d]+)px/).slice(1).map(Number);
  const [dx,dy]=point(images[0].style);assert.equal(geometry.markers.length,84);
  for(const [i,marker] of original.markers.entries()){
    const f=fields(marker);const [x,y]=point(geometry.markers[i+1].style);
    assert.equal(x,Number(f.geoX)+dx);assert.equal(y,4018-Number(f.geoY)+dy);
    assert.equal(geometry.markers[i+1].alt.trim().replace(/&amp;/g,'&'),f.title.trim());
  }
});

test('county, baronies and knightly domains keep their own houses and named council roles',()=>{
  assert.equal(pages.length,7);
  assert.deepEqual(pages.map(p=>p.view.familySections.flatMap(s=>s.cards).length),[19,2,2,2,2,1,1]);
  for(const page of pages)assert.equal(page.view.familySections.flatMap(s=>s.cards).filter(h=>h.featured).length,1);
  const countyHouses=pages[0].view.familySections.flatMap(s=>s.cards);
  assert.equal(countyHouses.some(h=>h.id==='haus-sliabh'),false);
  assert.equal(countyHouses.some(h=>h.id==='haus-faelwyn'),false);
  assert.ok(pages[3].view.familySections.flatMap(s=>s.cards).some(h=>h.id==='haus-sliabh'));
  assert.ok(pages[4].view.familySections.flatMap(s=>s.cards).some(h=>h.id==='haus-faelwyn'));
  assert.notEqual(pages[0].view.familySections.find(s=>s.title==='Antike Crannath-Clans').variant,'extinct');
  assert.equal(pages[0].view.councilGroups[0].members[0].office,'Graf des Tals der Milane');
  assert.equal(pages[0].view.councilGroups[0].title,'Graf des Tals der Milane');
  assert.equal(pages[0].view.councilGroups[0].members[0].name,'Gareth Aderyn');
  assert.ok(pages[3].view.councilGroups.flatMap(g=>g.members).some(m=>m.name==='Reese'&&m.imageSrc.endsWith('/reese.png')));
  assert.equal(territoriesById.get('herrschaft-eryr').parentId,'baronie-yvains-klamm');
});

test('confirmed spellings merge references without inventing markers or missing descriptions',()=>{
  assert.equal(pins.filter(p=>p.title==='Trelinon').length,1);
  assert.equal(markerAt(60).dominionId,'baronie-falkenhoeh');
  assert.equal(places.some(p=>p.name==='Trevelin'),false);
  assert.equal(source.unpositionedPlaces.length,4);
  assert.equal(places.length,87);
  assert.equal(new Set(places.map(p=>p.id)).size,places.length);
  for(const place of source.unpositionedPlaces){
    assert.equal(place.x,undefined);assert.equal(place.y,undefined);
    assert.equal(pins.some(p=>p.id===place.id),false);
    assert.equal(places.find(p=>p.id===place.id).description,'');
  }
  for(const row of [12,30,65,76,77]){
    const pin=markerAt(row);assert.equal(pin.text,'');
    assert.ok(pin.table.some(r=>r.k==='Quellenstand'&&r.v.includes('ohne Beschreibungstext')));
  }
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
  assert.ok(markerAt(4).pinMarker.endsWith('/turm.png'));
  assert.ok(markerAt(20).pinMarker.endsWith('/gest-t.png'));
  assert.ok(markerAt(79).pinMarker.endsWith('/j-gerlager.png'));
  assert.ok(markerAt(1).pinMarker.endsWith('/antike-ruine.png'));
  const estate=markerAt(68);assert.equal(estate.house,territoriesById.get('grafschaft-tal-der-milane').house);
  assert.equal(territoriesById.get(estate.dominionId).parentId,'baronie-falkenhoeh');
  assert.equal(estate.table.find(r=>r.k==='Gebiet').v,'Baronie Falkenhöh');
});

test('live current symbols replace the old baked-in icons while the original map stays available',()=>{
  const config={window:{}};vm.runInNewContext(read('Karten/Cenyr/tal-der-milane/template.config.js'),config);
  const settings=config.window.KARTO_CONFIG;
  assert.equal(settings.images.pins,'');
  assert.equal(document.state.mapImages.pins,'');
  assert.equal(document.state.showMarkers,true);
  assert.deepEqual([document.state.dotSize,document.state.lblSize],[80,50]);
  assert.ok(settings.extraLayers.some(l=>l.id==='tal-der-milane-original-markers'&&l.url.endsWith('/Kartenbilder/pins.webp')));
  assert.ok(document.state.extraLayers.some(l=>l.id==='tal-der-milane-original-markers'));
});

test('source identity survives renaming and the first-import guard protects all subsequent edits',()=>{
  const renamed=structuredClone(source);renamed.markers[0].title+=' – neuer Anzeigename';
  const generated=createReviewedPins(renamed,{catalog:catalogContext.KartoCategoryCatalog,presets:catalogContext.KartoPinTablePresets,describePlace,region:'Tal der Milane'});
  assert.equal(generated[0].id,pins[0].id);assert.deepEqual(generated[0].sourceRef,pins[0].sourceRef);
  const options={folder:new URL('Karten/Cenyr/tal-der-milane/',root),region:'Tal der Milane',countyId:'grafschaft-tal-der-milane',describePlace,territoriesById};
  const before=read('Karten/Cenyr/tal-der-milane/data.json');importReviewedTerritory(options);
  assert.throws(()=>importReviewedTerritory({...options,write:true}),/bereits bearbeitet/);
  assert.equal(read('Karten/Cenyr/tal-der-milane/data.json'),before);
});
