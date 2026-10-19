import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { territoriesById, descriptionsById, describePlace } from '../../Karten/Cenyr/aehrental/places.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const json = file => JSON.parse(read(file));
const context = { window: {} };
for (const file of ['kontinente.registry.js', 'assets/js/herrschaft-data.js']) vm.runInNewContext(read('Kontinente/' + file), context);
globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
const entries = context.window.KONTINENTE_REGISTRY.filter(e => e.page.includes('Grafschaft Ährental/'));
const pages = await Promise.all(entries.map(async e => (await import(new URL('Kontinente/' + e.data, root))).default));
const source = json('Karten/Cenyr/aehrental/markers.source.json');
const snapshot = json('Karten/Cenyr/aehrental/data.json');
const pins = snapshot.state.pins;
const countyPlaces = pages[0].view.geography.domains.flatMap(d => d.sections.flatMap(s => s.places));

test('Ährental retains all six originals, 65 snippets and three coordinate lists byte-identically', () => {
  for (const [file, count, prefix] of [['sources.json',6,''], ['places/sources.json',65,'places/'], ['coordinates/sources.json',3,'coordinates/']]) {
    const manifest = json('Kontinente/docs/aehrental/' + file);
    assert.equal(manifest.length,count);
    for(const item of manifest) {
      const bytes = fs.readFileSync(new URL('Kontinente/docs/aehrental/'+prefix+item.file,root));
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),item.sha256);
    }
  }
});

test('61 listed coordinates become unique pins; the unpositioned Marchog castle stays in the register', () => {
  assert.equal(pins.length,61);
  assert.equal(countyPlaces.length,62);
  assert.equal(new Set(countyPlaces.map(p=>p.id)).size,62);
  assert.equal(source.unpositionedPlaces.length,1);
  assert.match(source.unpositionedPlaces[0].title,/Castell Chiffyddlon/);
  assert.ok(!pins.some(p=>p.title.includes('Castell Chiffyddlon')));
  for(const marker of source.markers) {
    const pin=pins.find(p=>p.id===marker.id);
    assert.equal(pin.x,marker.x/4096);
    assert.equal(pin.y,1-marker.y/2690);
    assert.equal(pin.templateId,marker.templateId);
  }
  assert.equal(pins.find(p=>p.title==='Graigwen').x,2786/4096);
});

test('60 descriptions are shared; Morydd uses the requested new text and missing originals remain empty', () => {
  assert.equal(descriptionsById.size,60);
  assert.equal(pins.filter(p=>p.text).length,60);
  for(const [id,d] of descriptionsById) {
    assert.equal(pins.find(p=>p.id===id).text,d.text);
    assert.equal(countyPlaces.find(p=>p.id===id).description,d.text);
  }
  assert.match(descriptionsById.get('aehrental-morydd').source,/Nutzerwunsch/);
  assert.match(pins.find(p=>p.id==='aehrental-morydd').text,/Bauernsiedlung der Morcanhuc/);
  assert.match(pins.find(p=>p.id==='aehrental-tynar').text,/Schafzucht/);
  assert.equal(pins.find(p=>p.title==='Eirwyn').text,'');
  assert.equal(countyPlaces.find(p=>p.id===source.unpositionedPlaces[0].id).description,'');
});

test('local family selection preserves ancient and extinct records and known council offices', () => {
  assert.equal(pages.length,6);
  assert.deepEqual(pages.map(p=>p.view.familySections.flatMap(s=>s.cards).length),[12,2,2,1,2,2]);
  for(const page of pages) {
    const houses=page.view.familySections.flatMap(s=>s.cards);
    assert.equal(houses.filter(h=>h.featured).length,1);
    for(const h of houses) {
      assert.ok(h.rank && h.href,h.name);
      assert.ok(fs.existsSync(new URL('.'+h.imageSrc,root)),h.imageSrc);
    }
  }
  assert.equal(pages[0].view.familySections.flatMap(s=>s.cards).find(h=>h.id==='haus-warthog').rank,'Offen');
  assert.ok(pages[0].view.councilGroups.some(g=>g.members.some(p=>p.name==='Iorwerth Grawn')));
  const ciarog=pages.find(p=>p.meta.id==='herrschaft-ciarog');
  assert.ok(ciarog.view.councilGroups.some(g=>g.members.some(p=>p.office==='Ritterfürst')));
  assert.ok(!JSON.stringify(ciarog.view.councilGroups).includes('Baron'));
  const flusstal=pages.find(p=>p.meta.id==='baronie-flusstal');
  assert.equal(flusstal.view.article.infobox.flatMap(g=>g.rows).find(r=>r.label==='Hauptstadt').value,'Aldwynd');
});

test('heraldry follows reviewed lordships, with explicit cross-county Teyrngarch exclaves', () => {
  for(const pin of pins) {
    const t=territoriesById.get(pin.dominionId);
    assert.equal(pin.house,t.house);assert.equal(pin.crest,t.crest);assert.equal(pin.banner,t.banner);
    assert.equal(pin.bannerLink,t.href);
    for(const asset of [pin.pinMarker,pin.crest,pin.banner])assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
  }
  assert.equal(pins.find(p=>p.title==='Abaty Dinasbryn').house,'Haus Sgwarnog');
  assert.equal(pins.find(p=>p.title==='Arllwyn').house,'Haus Marchog');
  const exclaves=pins.filter(p=>['Bragdyddolwyn','Trefbrewyn'].includes(p.title));
  assert.equal(exclaves.length,2);
  for(const pin of exclaves) {
    assert.equal(pin.house,'Haus Teyrngarch');
    assert.match(pin.bannerLink,/Grafschaft Sonnenküste/);
    assert.ok(pin.table.some(r=>r.k==='Gebietsform' && r.v.includes('Exklave')));
  }
  for(const page of [pages[0],pages.find(p=>p.meta.id==='baronie-flusstal')])assert.match(page.view.geography.domains.find(d=>d.territoryId==='aehrental-teyrngarch-exklaven').href,/Grafschaft Sonnenküste/);
});

test('the shared importer verifies the map and refuses overwriting edited snapshots', () => {
  const options={folder:new URL('Karten/Cenyr/aehrental/',root),region:'Ährental',countyId:'grafschaft-aehrental',describePlace,territoriesById};
  const before=read('Karten/Cenyr/aehrental/data.json');
  importReviewedTerritory(options);
  assert.throws(()=>importReviewedTerritory({...options,write:true}),/bereits bearbeitet/);
  assert.equal(read('Karten/Cenyr/aehrental/data.json'),before);
});
