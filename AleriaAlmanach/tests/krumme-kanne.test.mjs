import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { completeKrummeKanne } from '../modules/krumme-kanne/krumme-kanne-module.mjs';
import { KANNE_PEOPLE, KANNE_PETS } from '../modules/krumme-kanne/krumme-kanne-roster.mjs';
import { KANNE_DISHES } from '../modules/krumme-kanne/krumme-kanne-menu.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { HOUSE_TONNARTH_FAMILY } from '../../Stammbäume/assets/js/data/house-tonnarth-family.js';
import { expandKanneGuestRegister } from '../modules/krumme-kanne/krumme-kanne-guests.mjs';
import { planKanneCharacters } from '../modules/krumme-kanne/krumme-kanne-characters.mjs';
const json = async name => JSON.parse(await readFile(new URL(`../modules/krumme-kanne/source/${name}.json`, import.meta.url), 'utf8'));
const original = await json('module-before');
const released = await json('module-before-editorial');
const catalogs = await Promise.all(['teyrngarch', 'penderyn'].map(json));
const completed = completeKrummeKanne(original, catalogs);
const originalBeforeEdit = structuredClone(original);

test('Kanne content edit preserves identities, threads and scene clocks', () => {
  assert.equal(completed.id, original.id);
  assert.equal(completed.pages.length, 10);
  assert.deepEqual(completed.pages.map(p => p.commentThreadKey), original.pages.map(p => p.commentThreadKey));
  assert.equal(completed.pages[4].commentThreadKey, original.pages[4].commentThreadKey);
  // The archived page predates the shared price review; preserve its metadata
  // while comparing its rebuilt assortment with the current canonical offers.
  assert.deepEqual(completeKrummeKanne(released, catalogs).pages[3], {
    ...released.pages[3], tradeCatalog: completed.pages[3].tradeCatalog
  });
  assert.equal(completed.pages[1].image, original.pages[1].image);
  for (let i = 5; i < 10; i++) {
    for (const key of Object.keys(original.pages[i]).filter(k => !['image', 'imageWidth', 'imageSquare', 'imageTall', 'pageTitle', 'sessionIntro'].includes(k)))
      assert.deepEqual(completed.pages[i][key], original.pages[i][key], `scene field ${i}.${key}`);
  }
  assert.deepEqual(completeKrummeKanne(completed, catalogs), completed);
  assert.deepEqual(original, originalBeforeEdit);
});

test('six switchable departmental trees contain individuals, three equal founders and the requested actual staffing', () => {
  const h = completed.pages[2].hierarchy;
  assert.equal(h.treeDisplayMode, 'tabs');
  assert.deepEqual(h.trees.map(t => t.label), ['Führung', 'Ausschank', 'Zimmer & Versorgung', 'Küche', 'Sicherheit', 'Haustiere']);
  assert.deepEqual(h.trees[0].levels[0].nodes.map(n => n.title), ['Merrik Trevoryn', 'Hrolf Svathamar', 'Aedan Dubhdarach']);
  const names = new Set(h.trees.flatMap(t => t.levels.flatMap(l => l.nodes.map(n => n.title))));
  assert.deepEqual(names, new Set([...KANNE_PEOPLE.filter(p => p.resident !== false), ...KANNE_PETS].map(p => p.name)));
  assert.ok(!names.has('Caradog Tonnarth'));
  const meier = h.trees[0].levels[2].nodes[0];
  assert.equal(meier.title, 'Gorwyst');
  assert.match(meier.portrait, /gorwyst.png$/);
  assert.equal(h.trees.find(t => t.id === 'kueche').levels.flatMap(l => l.nodes).length, 3);
  assert.equal(h.trees.find(t => t.id === 'sicherheit').levels.flatMap(l => l.nodes).length, 3);
  assert.equal(KANNE_PEOPLE.filter(p => /Schankmagd/.test(p.role)).length, 3);
  assert.deepEqual(KANNE_PEOPLE.filter(p => p.age < 18).map(p => p.age).sort((a,b) => a-b), [6, 9, 10, 12, 14, 15]);
  for (const person of KANNE_PEOPLE.filter(p => !p.family)) assert.equal(person.name.split(' ').length, 1);
});

test('guest book offers sixteen slots and retains named guests, portraits and existing IDs', () => {
  const page = structuredClone(released.pages[4]);
  const guest = page.guestRegister.sections[0].guests[0];
  Object.assign(guest, { name: 'Alter Kamerad', portrait: 'portrait.png', description: 'Seine Geschichte.', status: 'Anwesend' });
  const retained = structuredClone(guest);
  const ids = page.guestRegister.sections.flatMap(s => s.guests.map(g => g.id));
  expandKanneGuestRegister(page);
  const guests = page.guestRegister.sections.flatMap(s => s.guests);
  assert.equal(guests.length, 16);
  assert.deepEqual(guests.find(g => g.id === retained.id), retained);
  assert.ok(ids.every(id => guests.some(g => g.id === id)));
  const once = structuredClone(page);
  expandKanneGuestRegister(page);
  assert.deepEqual(page, once);
});

test('register plan creates distinct individuals, links family projections and preserves Caradog and other groups', () => {
  const id = 'person--haus-tonnarth--caradog-bastard-tonnarth';
  const caradog = { id, name: 'Caradog Tonnarth', identity: { worldPersonId: id }, portrait: 'original.png',
    title: 'Schreiber & Adjutant der Tiefenwyrm', biography: { existing: true }, inventory: { live: 7 },
    genealogy: { worldPersonId: id, sources: [], relationships: { original: true } } };
  const unrelated = { id: 'other-hrolf', name: 'Hrolf Wolfshorn', identity: { worldPersonId: 'other-hrolf' } };
  const config = { tabs: ['Idwals Schiffsmannschaft'], map: { 'Idwals Schiffsmannschaft': [id] },
    subtabs: {}, subtabMap: {}, moduleStoreManifest: { live: true } };
  const before = structuredClone({ caradog, unrelated, config });
  const plan = planKanneCharacters([caradog, unrelated], config, '2026-10-14T00:00:00Z');
  assert.equal(plan.entries.filter(e => e.create).length, 29);
  assert.equal(plan.entries.filter(e => !e.create).length, 1);
  assert.deepEqual(Object.keys(plan.entries.find(e => e.key === 'caradog').patch), ['genealogy', 'updatedAt']);
  assert.deepEqual(Object.keys(plan.entries.find(e => e.key === 'caradog').patch.genealogy), ['sources']);
  assert.equal(plan.config.map['Die Krumme Kanne'].length, 30);
  assert.deepEqual(plan.config.map['Idwals Schiffsmannschaft'], [id]);
  assert.equal(plan.entries.find(e => e.key === 'hrolf').create, true);
  assert.equal(plan.entries.find(e => e.key === 'eirian').data.genealogy.sources.length, 2);
  assert.equal(plan.entries.find(e => e.key === 'mair').group, 'Dubhdarach');
  assert.equal(plan.entries.find(e => e.key === 'gorwyst').data.genealogy.sources.length, 0);
  assert.deepEqual({ caradog, unrelated, config }, before);
  const published = plan.entries.map(e => e.create ? { id: e.id, ...e.data } : { ...caradog, genealogy: { ...caradog.genealogy, ...e.patch.genealogy } });
  const again = planKanneCharacters(published, { ...config, ...plan.config }, '2026-10-15T00:00:00Z');
  assert.ok(again.entries.every(e => !e.create && !e.patch));
  assert.deepEqual(again.config, plan.config);
});

test('Mair and her adult son match the actual genealogy, and pets link to real breed profiles', async () => {
  const mair = HOUSE_TONNARTH_FAMILY.persons.find(p => p.id === 'mair-affair-tonnarth');
  const son = HOUSE_TONNARTH_FAMILY.persons.find(p => p.id === 'caradog-bastard-tonnarth');
  assert.equal(KANNE_PEOPLE.find(p => p.id === 'mair').birth, Number(mair.birth));
  assert.equal(KANNE_PEOPLE.find(p => p.id === 'caradog').birth, Number(son.birth));
  const active = HOUSE_TONNARTH_FAMILY.partnerships.filter(p => p.status === 'active' && p.participantIds.includes(mair.id));
  assert.equal(active.length, 1);
  assert.deepEqual(active[0].participantIds, ['aedan-dubhdarach-kanne', mair.id]);
  assert.equal(HOUSE_TONNARTH_FAMILY.partnerships.find(p => p.id === 'affair-gareth-mair-tonnarth').status, 'ended');
  assert.deepEqual(HOUSE_TONNARTH_FAMILY.parentages.find(p => p.childId === son.id).parentIds, ['gareth-tonnarth', mair.id]);
  for (const p of KANNE_PETS) await access(new URL(`../${p.bestiary}`, import.meta.url));
});

test('register preserves all released standard offers, adds exact meal counts and reuses import images and prices', () => {
  const before = original.pages[3].goodsTable.tables[0];
  const after = completed.pages[3].tradeCatalog;
  assert.equal(completed.pages[3].tradeCatalogPage, true);
  assert.equal(completed.pages[3].goodsTable, undefined);
  const oldOffers = buildModuleOffers([original]);
  const offers = buildModuleOffers([completed]);
  for (const old of oldOffers) {
    const ported = offers.find(o => o.id === old.id);
    assert.ok(ported, `Stable offer identity for ${old.title}`);
    assert.equal(ported.image, old.image);
    assert.deepEqual(ported.priceRange, old.priceRange);
    assert.equal(ported.hiddenMeta.unit, old.hiddenMeta.unit);
  }
  assert.equal(after.items.filter(i => i.id.startsWith('standard-')).length, before.rows.length);
  assert.equal(KANNE_DISHES.filter(d => d.course === 'Vorspeise').length, 4);
  assert.equal(KANNE_DISHES.filter(d => d.course === 'Hauptspeise').length, 8);
  assert.equal(KANNE_DISHES.filter(d => d.course === 'Hauptspeise' && d.meat).length, 5);
  assert.equal(KANNE_DISHES.filter(d => d.course === 'Wochenspezialität').length, 3);
  assert.deepEqual(after.categories.slice(-2).map(c => c.label), ['Hauseigene Speisen', 'Importierte Getränke']);
  const imports = after.items.filter(r => r.category === 'importierte-getraenke');
  assert.equal(imports.length, 8);
  assert.ok(imports.every(r => catalogs.some(c => c.pages.some(p => p.tradeCatalog?.items.some(i => i.image === r.image && i.description === r.description && i.priceOptions.some(o => JSON.stringify(o) === JSON.stringify(r.priceOptions[0])))))));
  assert.equal(offers.length, 44);
  assert.equal(offers.filter(o => /Hirsch vom offenen Feuer/.test(o.title)).length, 1);
  assert.ok(offers.every(o => o.priceRange));
  for (const dish of after.items.filter(i => i.category === 'besonderes-menu')) {
    assert.ok(dish.description.replace(/<[^>]*>/g, ' ').split(/\s+/).length >= 100, dish.title);
    assert.equal((dish.description.match(/<p>/g) || []).length, 3);
  }
});

test('editor normalization retains the complete 44-item catalog and stable serving units', async () => {
  const context = vm.createContext({ console, window: {}, URL });
  const core = await readFile(new URL('../modules/core/app-core.js', import.meta.url), 'utf8');
  vm.runInContext(core.slice(core.indexOf('function slugify('), core.indexOf('\nfunction ', core.indexOf('function slugify(') + 1)), context);
  vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-data.js', import.meta.url), 'utf8'), context);
  context.catalog = structuredClone(completed.pages[3].tradeCatalog);
  const normalized = vm.runInContext('sanitizeTradeCatalogData(catalog)', context);
  assert.equal(normalized.items.length, 44);
  assert.equal(normalized.items[0].unit, 'Pro Schüssel');
  assert.equal(normalized.items.at(-1).title, completed.pages[3].tradeCatalog.items.at(-1).title);
});

test('all newly referenced local artwork and CK trait icons exist', async () => {
  const paths = new Set();
  const walk = value => {
    if (typeof value === 'string' && /^(\.\/assets\/krumme-kanne\/|\.\.\/IconOrdner\/)/.test(value)) paths.add(value);
    else if (Array.isArray(value)) value.forEach(walk);
    else if (value && typeof value === 'object') Object.values(value).forEach(walk);
  };
  walk(completed);
  for (const path of paths) await access(new URL(`../${path}`, import.meta.url));
});
