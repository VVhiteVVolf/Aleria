import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { buildLetzterHeller } from '../modules/letzter-heller/heller-module.mjs';
import { HELLER_PEOPLE, HELLER_DOG } from '../modules/letzter-heller/heller-people.mjs';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { resolveCreatureBestiaryReference } from '../modules/creatures/creature-bestiary-reference.js';
import { planHellerCharacters } from '../modules/letzter-heller/heller-characters.mjs';
const entry = buildLetzterHeller(), catalog = entry.pages[5].tradeCatalog;
test('ten content pages keep family remembrance separate from the living staff', () => {
  assert.equal(entry.pages.length, 10);
  assert.equal(entry.pages.filter(p => p.sessionPage).length, 3);
  assert.equal(new Set(entry.pages.map(p => p.commentThreadKey)).size, 10);
  assert.deepEqual(entry.pages[4].hierarchy.trees.map(t => t.label), ['Führung & Ausschank', 'Dirnen', 'Sonstiges']);
  assert.match(entry.pages[2].description, /starb 1734/);
  assert.ok(HELLER_PEOPLE.every(p => p.age >= 26));
  for (const key of ['arran', 'finlay']) {
    const p = HELLER_PEOPLE.find(p => p.key === key);
    assert.ok(!entry.sessionCast.includes(p.worldPersonId));
    assert.ok(!JSON.stringify(entry.pages[4].hierarchy).includes(p.name));
  }
  assert.equal(entry.sessionCast.length, 10);
  assert.ok(HELLER_PEOPLE.filter(p => !['arran', 'alasdair', 'finlay'].includes(p.key)).every(p => !p.name.includes(' ')));
  assert.deepEqual(resolveCreatureBestiaryReference(HELLER_DOG), HELLER_DOG.bestiaryReference);
});
test('complete canonical standard foods and drinks retain prices and artwork', () => {
  const expected = STANDARD_ITEMS.filter(i => i.id.startsWith('standard:taverne:') && ['speisen', 'getraenke'].includes(i.category));
  assert.equal(catalog.items.length, expected.length + 3);
  assert.equal(new Set(catalog.items.map(i => i.id)).size, catalog.items.length);
  for (const source of expected) {
    const item = catalog.items.find(i => i.canonicalKey === source.canonicalKey);
    assert.ok(item); assert.equal(item.image, source.image);
    assert.equal(Number(item.priceMin.replaceAll('.', '').replace(',', '.')), source.priceRange.minCopper);
  }
});
test('old beers remain visible but cannot become purchasable offers; whisky is glass-only', () => {
  const beers = catalog.items.filter(i => i.status === 'unavailable');
  assert.equal(beers.length, 2); assert.ok(beers.every(i => i.category === 'sept'));
  const offers = buildModuleOffers([entry]);
  assert.ok(beers.every(b => !offers.some(o => o.title === b.title)));
  const whisky = catalog.items.find(i => i.id === 'bun-na-h-aibhne');
  assert.equal(Number(whisky.priceMin), 80); assert.equal(whisky.priceOptions.length, 0);
  assert.ok(whisky.features.includes('Vier Flaschen à 0,7 l'));
  assert.match(whisky.unit, /4 cl/);
  const whiskyOffers = offers.filter(o => o.title === whisky.title);
  assert.equal(whiskyOffers.length, 1); assert.match(whiskyOffers[0].hiddenMeta.unit, /4 cl/);
});
test('Sept has one historical placement and known father-son relationships', () => {
  const records = FAMILY_REGISTRY.filter(f => f.id === 'sept-cneacail');
  assert.equal(records.length, 1);
  const { family } = records[0];
  for (const child of ['alasdair-cneacail', 'finlay-cneacail']) {
    assert.ok(family.parentages.some(p => p.childId === child && p.parentIds.includes('arran-cneacail')));
  }
  assert.equal(family.persons.find(p => p.id === 'arran-cneacail').death, '1734');
  assert.match(family.document.description, /Mallacht Seaghda/);
  assert.deepEqual([...records[0].folderPath], ['Ceitheach', 'Tir na Dorcha', 'Glaennmor', 'Bun na h-Aibhne']);
  assert.deepEqual(family.extensions.registryAdditionalPlacements[0].folderPath, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor']);
});
test('registration is idempotent and every art destination resolves', async () => {
  const code = await readFile(new URL('../modules/letzter-heller/heller-data.js', import.meta.url), 'utf8');
  const context = vm.createContext({ SECTIONS: [] }); vm.runInContext(code, context); vm.runInContext(code, context);
  assert.equal(context.SECTIONS.flatMap(s => s.entries).filter(e => e.id === entry.id).length, 1);
  const manifest = JSON.parse(await readFile(new URL('../assets/letzter-heller/image-prompts.json', import.meta.url), 'utf8'));
  assert.equal(manifest.entries.length, 22);
  for (const job of manifest.entries) await access(new URL(job.destination, new URL('../../', import.meta.url)));
});
test('offline publication preserves existing identities, prose and live resources', () => {
  const initial = planHellerCharacters();
  assert.equal(initial.entries.length, 12);
  const existing = { ...initial.entries[0].data, id: 'existing-online-id', portrait: 'custom.png', bio: 'Eigener Text', resources: { hp: 7 } }, before = structuredClone(existing);
  const owner = planHellerCharacters([existing]).entries.find(e => e.key === 'alasdair');
  assert.equal(owner.id, existing.id); assert.equal(owner.create, false); assert.deepEqual(existing, before);
  assert.ok(!owner.patch || Object.keys(owner.patch).every(k => ['genealogy', 'updatedAt'].includes(k)));
});
