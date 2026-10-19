import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { territoriesById, descriptionsById, describePlace } from '../../Karten/Cenyr/weidebucht/places.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const json = file => JSON.parse(read(file));
const context = { window: {} };
for (const file of ['kontinente.registry.js', 'assets/js/herrschaft-data.js']) vm.runInNewContext(read('Kontinente/' + file), context);
globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
const entries = context.window.KONTINENTE_REGISTRY.filter(e => e.page.includes('Grafschaft Weidebucht/'));
const pages = await Promise.all(entries.map(async e => (await import(new URL('Kontinente/' + e.data, root))).default));
const source = json('Karten/Cenyr/weidebucht/markers.source.json');
const pins = json('Karten/Cenyr/weidebucht/data.json').state.pins;
const countyPlaces = pages[0].view.geography.domains.flatMap(d => d.sections.flatMap(s => s.places));

test('all six HTML originals, 87 screenshots and three coordinate lists remain byte-identical', () => {
  for(const [file,count,prefix] of [['sources.json',6,''],['places/sources.json',87,'places/'],['coordinates/sources.json',3,'coordinates/']]) {
    const manifest=json('Kontinente/docs/weidebucht/'+file);assert.equal(manifest.length,count);
    for(const item of manifest) {
      const bytes=fs.readFileSync(new URL('Kontinente/docs/weidebucht/'+prefix+item.file,root));
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
    }
  }
});

test('81 unique map coordinates and register places preserve both distinct Maesgorn settlements', () => {
  assert.equal(pins.length,81);assert.equal(countyPlaces.length,81);
  assert.equal(new Set(countyPlaces.map(p=>p.id)).size,81);
  assert.equal(source.unpositionedPlaces.length,0);
  for(const marker of source.markers) {
    const pin=pins.find(p=>p.id===marker.id);
    assert.equal(pin.x,marker.x/4096);assert.equal(pin.y,1-marker.y/3500);
    assert.equal(pin.templateId,marker.templateId);
  }
  const settlements=pins.filter(p=>p.title==='Maesgorn');assert.equal(settlements.length,2);
  assert.deepEqual(new Set(settlements.map(p=>p.house)),new Set(['Haus Mochdaer','Haus Hwyaden']));
  assert.notEqual(settlements[0].text,settlements[1].text);
  assert.equal(pins.find(p=>p.title==='Zur Schwarzen Eiche').x,2060/4096);
  assert.equal(pins.find(p=>p.title==='Zur Grünen Laterne').x,2527/4096);
  assert.equal(pins.find(p=>p.title==='Bhiorach').y,1-3163/3500);
  assert.equal(pins.find(p=>p.title==='Talamhard').y,1-1449/3500);
});

test('76 distinct texts are shared; duplicates, clipped snippets and missing descriptions are handled explicitly', () => {
  assert.equal(descriptionsById.size,76);assert.equal(pins.filter(p=>p.text).length,76);
  assert.deepEqual(pins.filter(p=>!p.text).map(p=>p.title).sort(),['Cerrigarth','Esgairmor','Glyndale','Mynfonn','Trefyddin']);
  for(const [id,d] of descriptionsById) {
    assert.equal(pins.find(p=>p.id===id).text,d.text);
    assert.equal(countyPlaces.find(p=>p.id===id).description,d.text);
  }
  assert.ok(pins.find(p=>p.title==='Tirfonwll').text.startsWith('Tirfonwll'));
  assert.ok(pins.find(p=>p.title==='Coedgwell').text.startsWith('Coedgwell'));
  assert.match(pins.find(p=>p.title==='Tŵr Erwyth').text,/verantwortlich ist\.$/);
  assert.match(pins.find(p=>p.title==='Fonadwyth').text,/südlichen Region der Baronie\.$/);
});

test('local house selection and canonical council seats preserve the surviving Asyn line', () => {
  assert.equal(pages.length,6);
  assert.deepEqual(pages.map(p=>p.view.familySections.flatMap(s=>s.cards).length),[20,2,2,1,2,1]);
  for(const page of pages) {
    assert.equal(page.view.familySections.flatMap(s=>s.cards).filter(h=>h.featured).length,1);
    const former=page.view.familySections.find(s=>s.cards.some(h=>h.id==='haus-asyn'));
    if(former)assert.notEqual(former.variant,'extinct');
  }
  const barons=pages[0].view.councilGroups.find(g=>g.title==='Barone').members;
  for(const [name,seat] of [['Goronwy Creyr','Esgairmor'],['Cadwg Hwyaden','Trefyddin'],['Gwynham Tir Addawol','Glyndale']])assert.equal(barons.find(p=>p.name===name).seat,seat);
  assert.ok(!JSON.stringify(pages[0].view.councilGroups).includes('Talgarth'));
  assert.equal(pages[5].view.article.infobox.flatMap(g=>g.rows).find(r=>r.label==='Hauptstadt').value,'Cerrigarth');
  const houses=pages[0].view.familySections.flatMap(s=>s.cards);
  assert.equal(houses.find(h=>h.id==='haus-fhaire').rank,'Laird');
  assert.equal(houses.find(h=>h.id==='haus-trisceil').rank,'Mor Tiarna');
});

test('Erims Hof retains both ruling houses and their heraldry on the map and all responsible pages', () => {
  const pin=pins.find(p=>p.title==='Erims Hof');
  assert.equal(pin.cat,'location-kultstaette');assert.equal(pin.templateId,'institution');
  assert.equal(pin.crest,'');assert.equal(pin.banner,'');
  assert.equal(pin.coRulers.length,2);
  assert.deepEqual(new Set(pin.coRulers.map(r=>r.familyId)),new Set(['haus-dinefwr','haus-tir-addawol']));
  assert.match(pin.house,/Dinefwr.*Tir Addawol/);
  for(const index of [0,2,5]) {
    const place=pages[index].view.geography.domains.flatMap(d=>d.sections.flatMap(s=>s.places)).find(p=>p.name==='Erims Hof');
    assert.deepEqual(place.coRulers,pin.coRulers);
  }
  for(const ruler of pin.coRulers)for(const asset of [ruler.crest,ruler.banner])assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
});

test('heraldry, operators and Teyrngarch exclaves remain separate and locally available', () => {
  for(const pin of pins) {
    const t=territoriesById.get(pin.dominionId);
    assert.equal(pin.house,t.house);assert.equal(pin.crest,t.crest);assert.equal(pin.banner,t.banner);
    for(const asset of [pin.pinMarker,pin.crest,pin.banner].filter(Boolean))assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
  }
  const brewery=pins.filter(p=>p.title.startsWith('Teyrngarch Brauerei'));assert.equal(brewery.length,2);
  assert.ok(brewery.every(p=>p.house==='Haus Teyrngarch' && p.table.some(r=>r.k==='Gebietsform' && r.v.includes('Exklave'))));
  const tavern=pins.find(p=>p.title==='Zur Grünen Laterne');assert.equal(tavern.house,'Haus Wylan');
  assert.equal(tavern.table.find(r=>r.k==='Betreiber').v,'Haus Teyrngarch');
  assert.equal(pins.find(p=>p.title==='Llanforyn').cat,'location-flusssiedlung');
  assert.equal(pins.find(p=>p.title==='Gorwynd').cat,pins.find(p=>p.title==='Llangedarn').cat);
});

test('import verifies the reviewed snapshot and refuses to overwrite existing edits', () => {
  const options={folder:new URL('Karten/Cenyr/weidebucht/',root),region:'Weidebucht',countyId:'grafschaft-weidebucht',describePlace,territoriesById};
  const before=read('Karten/Cenyr/weidebucht/data.json');
  importReviewedTerritory(options);
  assert.throws(()=>importReviewedTerritory({...options,write:true}),/bereits bearbeitet/);
  assert.equal(read('Karten/Cenyr/weidebucht/data.json'),before);
});
