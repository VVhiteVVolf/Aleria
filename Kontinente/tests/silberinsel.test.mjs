import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { territoriesById, descriptionsById, describePlace } from '../../Karten/Cenyr/silberinsel/places.mjs';
import { importReviewedTerritory } from '../../Karten/tools/reviewed-territory-import.mjs';

const root = new URL('../../', import.meta.url);
const read = file => fs.readFileSync(new URL(file, root), 'utf8');
const json = file => JSON.parse(read(file));
const context = { window: {} };
for (const file of ['kontinente.registry.js', 'assets/js/herrschaft-data.js']) vm.runInNewContext(read('Kontinente/' + file), context);
globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
const entries = context.window.KONTINENTE_REGISTRY.filter(e => e.page.includes('Grafschaft Silberinsel/'));
const pages = await Promise.all(entries.map(async e => (await import(new URL('Kontinente/' + e.data, root))).default));
const source = json('Karten/Cenyr/silberinsel/markers.source.json');
const pins = json('Karten/Cenyr/silberinsel/data.json').state.pins;
const countyPlaces = pages[0].view.geography.domains.flatMap(d => d.sections.flatMap(s => s.places));

test('six HTML originals, 34 place screenshots and the coordinate list remain byte-identical', () => {
  for (const [file, count, prefix] of [['sources.json',6,''],['places/sources.json',34,'places/'],['coordinates/sources.json',1,'coordinates/']]) {
    const manifest = json('Kontinente/docs/silberinsel/' + file);
    assert.equal(manifest.length, count);
    for (const item of manifest) {
      const bytes = fs.readFileSync(new URL('Kontinente/docs/silberinsel/' + prefix + item.file, root));
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.sha256);
    }
  }
});

test('all 32 reviewed coordinates are preserved; the four unpositioned caves remain register-only', () => {
  assert.equal(pins.length,32);
  assert.equal(countyPlaces.length,36);
  assert.equal(new Set(countyPlaces.map(p=>p.id)).size,36);
  for (const marker of source.markers) {
    const pin = pins.find(p=>p.id===marker.id);
    assert.equal(pin.x,marker.x/4096); assert.equal(pin.y,1-marker.y/3463);
    assert.equal(pin.templateId,marker.templateId);
  }
  assert.deepEqual(source.unpositionedPlaces.map(p=>p.title).sort(),['Donnerfallhöhle','Eisenschlucht','Schattenklammhöhle','Silberstollen']);
  for (const marker of source.unpositionedPlaces) {
    assert.equal(marker.x,undefined); assert.equal(marker.y,undefined);
    assert.equal(pins.some(p=>p.id===marker.id),false);
    assert.ok(countyPlaces.some(p=>p.id===marker.id));
  }
  const ath = pins.filter(p=>p.title.startsWith('Ath Eryndor'));
  assert.equal(ath.length,2); assert.notEqual(ath[0].cat,ath[1].cat);
  assert.notEqual(ath[0].text,ath[1].text);
  assert.equal(ath[0].y,1-2989/3463); assert.equal(ath[1].y,1-2923/3463);
});

test('29 distinct descriptions are shared by map and registers, without filling missing sources', () => {
  assert.equal(descriptionsById.size,29); assert.equal(pins.filter(p=>p.text).length,29);
  assert.deepEqual(pins.filter(p=>!p.text).map(p=>p.title).sort(),['Caer Clwyd','Eiddon','Llanvane']);
  for (const [id,description] of descriptionsById) {
    assert.equal(pins.find(p=>p.id===id).text,description.text);
    assert.equal(countyPlaces.find(p=>p.id===id).description,description.text);
  }
  assert.deepEqual([...descriptionsById.values()].filter(p=>p.screenshots.length>1).map(p=>p.screenshots),[[5,7],[14,17],[23,25],[24,27],[26,28]]);
  const missing = countyPlaces.filter(p=>!p.description);
  assert.equal(missing.length,7);
});

test('house selection, ranks, heads and council seats follow the individual sources', () => {
  assert.equal(pages.length,6);
  assert.deepEqual(pages.map(p=>p.view.familySections.flatMap(s=>s.cards).length),[18,1,1,1,1,2]);
  for (const page of pages) assert.equal(page.view.familySections.flatMap(s=>s.cards).filter(h=>h.featured).length,1);
  const heads = ['Yvain Neidr','Duny Saith','Kimball Crefyddol','Eiddyl Canwyll','Yspaddaden Pyrth','Morholt Tiwna'];
  for (const [i,page] of pages.entries()) assert.equal(page.view.article.infobox.flatMap(g=>g.rows).find(r=>r.label==='Oberhaupt').value,heads[i]);
  const knights = pages[0].view.councilGroups.find(g=>g.title==='Ritterfürsten').members;
  assert.equal(knights.length,5);
  for (const member of knights) assert.equal(member.seat,member.name==='Yspaddaden Pyrth'?'Caer Clwyd':'Llanvane');
  assert.ok(!JSON.stringify(pages[0].view.councilGroups).includes('Talgarth'));
  assert.equal(pages[4].view.familySections[0].cards[0].rank,'Ritterfürstenhaus');
  assert.ok(pages[0].view.familySections.find(s=>s.cards.some(h=>h.id==='haus-tir-an-muirghin')));
  assert.equal(pages[5].view.familySections[1].cards[0].seat,'Ard Iasgleann');
});

test('territorial heraldry stays separate from religious and magical administration', () => {
  for (const pin of pins) {
    const territory = territoriesById.get(pin.dominionId);
    assert.equal(pin.house,territory.house); assert.equal(pin.crest,territory.crest); assert.equal(pin.banner,territory.banner);
    for (const asset of [pin.pinMarker,pin.crest,pin.banner]) assert.ok(fs.existsSync(new URL('.'+asset,root)),asset);
  }
  for (const key of ['saith','crefyddol','canwyll']) {
    const territory = territoriesById.get('herrschaft-'+key);
    const bytes = fs.readFileSync(new URL('.'+territory.banner,root));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),territory.bannerSha256);
  }
  const abbey = pins.find(p=>p.title.startsWith('Côr Llanberwyn'));
  assert.equal(abbey.house,'Haus Neidr'); assert.equal(abbey.dominionId,'baronie-silberbucht'); assert.equal(abbey.templateId,'institution');
  assert.equal(abbey.table.find(r=>r.k==='Träger').v,'Abtei von St. Sieffre');
  const ath = pins.find(p=>p.title.endsWith('Achatorden'));
  assert.equal(ath.house,'Haus Tiwna');
  assert.equal(ath.table.find(r=>r.k==='Verwaltung').v,'Magierorganisation von Cenyr');
  assert.equal(ath.table.find(r=>r.k==='Ehemalige Zugehörigkeit').v,'Achatorden');
});

test('reviewed import verifies the snapshot and refuses to overwrite existing edits', () => {
  const options = { folder:new URL('Karten/Cenyr/silberinsel/',root),region:'Silberinsel',countyId:'grafschaft-silberinsel',describePlace,territoriesById };
  const before = read('Karten/Cenyr/silberinsel/data.json');
  importReviewedTerritory(options);
  assert.throws(()=>importReviewedTerritory({...options,write:true}),/bereits bearbeitet/);
  assert.equal(read('Karten/Cenyr/silberinsel/data.json'),before);
});
