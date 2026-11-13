import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { buildStudRegistrations } from '../modules/gwynthor-horse-studs/stud-module.mjs';
import { STUD_PLACES } from '../modules/gwynthor-horse-studs/stud-places.mjs';
import { STUD_HORSES } from '../modules/gwynthor-horse-studs/stud-horses.mjs';
import { STUD_BREEDS, exemplarPrice, breedSalePrice } from '../modules/gwynthor-horse-studs/stud-pricing.mjs';
import { STUD_PEOPLE } from '../modules/gwynthor-horse-studs/stud-people.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { projectBuiltinTradeModule } from '../scripts/scene-trade/scene-trade-builtin-projection.mjs';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';
import { KYRIA_MARRIAGE_ID } from '../../Stammbäume/assets/js/data/caeffyn-aurdden-marriage.js';
import { buildAurddenModule } from '../modules/loer-hofjuwelier/aurdden-module.mjs';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { GWYNTHOR_CITY_PATH } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
const registrations = buildStudRegistrations(), family = id => FAMILY_REGISTRY.find(r => r.id === id).family;

test('both actual modules retain the requested ordered templates and six independent scene threads', () => {
  const threads = [];
  for (const registration of registrations) assert.deepEqual(registration.path, GWYNTHOR_CITY_PATH);
  for (const { entry } of registrations) {
    assert.equal(entry.pages.length, 10); assert.equal(entry.appendCommentsPage, false);
    assert(entry.pages[0].description); assert(entry.pages[1].biographyPage); assert(entry.pages[2].biographyPage); assert(entry.pages[3].hierarchyPage);
    assert(entry.pages[4].tradeCatalogPage); assert(entry.pages[5].tradeCatalogPage); assert(entry.pages[9].economyCalculationPage);
    assert.deepEqual(entry.pages.slice(6, 9).map(p => p.pageTitle), ['Szene · Verkaufsraum', 'Szene · Stall', 'Szene · Sattlerei']);
    assert(entry.pages.slice(6, 9).every(p => p.sessionPage));
    entry.pages.filter(p => p.sessionPage).forEach(p => threads.push(p.commentThreadKey));
    assert.equal(new Set(entry.pages.map(p => p.commentThreadKey)).size, 10);
  }
  assert.equal(new Set(threads).size, 6);
  assert.equal(JSON.stringify(registrations), JSON.stringify(buildStudRegistrations()), 'No random content or pricing at rebuild.');
});

test('four race offers and three pairs of named unique horses survive the authoritative offer projection', () => {
  const uniqueRefs = [];
  for (const { entry, ...section } of registrations) {
    const catalog = entry.pages[4].tradeCatalog, offers = buildModuleOffers([entry], STANDARD_ITEMS);
    assert.equal(catalog.categories.length, 4); assert.equal(catalog.items.filter(i => i.category === 'rassen').length, 4);
    for (const category of ['zucht', 'mischling', 'reinrassig']) assert.equal(catalog.items.filter(i => i.category === category).length, 2);
    assert.equal(offers.length, 20); assert.equal(offers.filter(o => o.definitionKind === 'unique').length, 6);
    assert(offers.filter(o => o.definitionKind === 'unique').every(o => o.category === 'pferde' && o.definitionRef.id.startsWith('module-unique:')));
    uniqueRefs.push(...offers.filter(o => o.definitionKind === 'unique').map(o => o.definitionRef.id));
    const projected = projectBuiltinTradeModule(entry, section);
    assert.deepEqual(buildModuleOffers([projected.entry], STANDARD_ITEMS), offers);
    for (const breed of STUD_BREEDS) {
      const row = catalog.items.find(i => i.title === breed.name); assert.equal(row.image, breed.standard.image);
      assert.deepEqual(row.definitionRef, breed.standard.definitionRef); assert.notEqual(row.definitionKind, 'unique');
    }
  }
  assert.equal(new Set(uniqueRefs).size, 12); assert.equal(new Set(STUD_HORSES.map(h => h.name)).size, 12);
});

test('guild selection has higher comparable prices and mixed ancestry never becomes a fabricated pedigree', () => {
  for (const breed of STUD_BREEDS) { assert(breedSalePrice(breed.id, true) > breedSalePrice(breed.id, false));
    assert(breedSalePrice(breed.id, true) <= breed.priceRange.maxCopper); }
  const mixed = STUD_HORSES.filter(h => h.category === 'mischling');
  assert(Math.min(...mixed.filter(h => h.venue === 'rhosmere').map(h => exemplarPrice(h).amount)) > Math.max(...mixed.filter(h => h.venue === 'halenrhyd').map(h => exemplarPrice(h).amount)));
  for (const h of mixed) { assert(!h.parents && !h.breed); assert.match(h.history, /unbekannt|unbewiesen|keine belastbaren|kein Pferd mit belegter Abstammung/i); }
  for (const h of STUD_HORSES.filter(h => h.category === 'zucht')) { assert.equal(h.parents.length, 2); const price = exemplarPrice(h); assert(price.amount >= price.range.minCopper && price.amount <= price.range.maxCopper); }
});

test('the saddlery is replenishable medieval equipment and no unnamed role creates a fictional character', () => {
  for (const { entry } of registrations) {
    const goods = entry.pages[5].tradeCatalog.items; assert.equal(goods.length, 10); assert(goods.every(g => g.definitionKind === 'shared' && g.definitionCategory === 'werkzeuge'));
    assert.equal(new Set(goods.map(g => g.image)).size, 10); assert(goods.every(g => /\/saddlery\/sattlerei-/.test(g.image)));
    const trees = entry.pages[3].hierarchy.trees, roles = trees.flatMap(t => t.levels.flatMap(l => l.nodes));
    assert.equal(trees.length, 8); assert(roles.length >= 40); assert.equal(roles.filter(r => r.characterId).length, 2);
    assert(roles.filter(r => !r.characterId).every(r => /placeholders/.test(r.portrait) && /Unbesetzter/.test(r.subtitle)));
    for (const title of ['Zuchtmeister', 'Bereiter', 'Sattlermeister', 'Riemer', 'Hufschmied', 'Nachtwächter']) assert(roles.some(r => r.title === title));
    assert(!roles.some(r => /Maelrig|Gorweth|Kyria|Eirfena/.test(r.text)));
    const scenario = entry.pages[9].economyCalculation.scenario;
    assert(scenario.channels.filter(c => /horse-/.test(c.id)).every(c => c.quantity === 0));
    assert.equal(scenario.levyRate, 0); assert(scenario.assumptions.some(a => /vor diesen offenen Ansprüchen/.test(a)));
  }
});

test('broad Halenrhyd genealogy and small Caeffyn couple are valid without invented biological generations', () => {
  const halenrhyd = family('haus-halenrhyd'), caeffyn = family('haus-caeffyn');
  for (const f of [halenrhyd, caeffyn]) { assert.deepEqual(assertValidFamily(f).diagnostics, []); assert.deepEqual(auditFamilyChartLayoutPolicy(f).issues, []); }
  assert.equal(halenrhyd.persons.length, 27); assert.equal(halenrhyd.timeJumps.length, 1);
  assert.equal(caeffyn.persons.length, 2); assert.equal(caeffyn.parentages.length, 0); assert.equal(caeffyn.timeJumps.length, 0);
  const maelrig = caeffyn.persons.find(p => p.id === 'maelrig-caeffyn'); assert.equal(maelrig.birth, '1678'); assert.match(maelrig.portrait, /v3/);
  assert.equal(STUD_PEOPLE.filter(p => p.portrait).length, 4);
});

test('Kyria keeps her world identity and Aurdden parents while one exact marriage links both families', () => {
  const aurdden = family('haus-aurdden'), caeffyn = family('haus-caeffyn');
  for (const f of [aurdden, caeffyn]) {
    const kyria = f.persons.find(p => p.id === 'kyria-aurdden'); assert.equal(kyria.worldPersonId, 'person--haus-aurdden--kyria-aurdden'); assert.match(kyria.title, /Finanzen/);
    const relation = f.partnerships.find(p => p.id === KYRIA_MARRIAGE_ID); assert.equal(relation.type, 'marriage'); assert.equal(relation.status, 'active');
    assert.deepEqual(relation.participantIds, ['maelrig-caeffyn', 'kyria-aurdden']);
  }
  assert.deepEqual(aurdden.parentages.find(p => p.childId === 'kyria-aurdden').parentIds, ['pereth-aurdden', 'uffyria-spouse-aurdden']);
  const oldRole = buildAurddenModule().pages[1].biography.connections.find(c => /Korrespondenz/.test(c.name));
  assert.match(oldRole.image, /placeholders/); assert.match(oldRole.detail, /Unbesetzte Rolle/);
});

test('all active commissioned art is present, versioned, and linked to an immutable original', async () => {
  const manifest = JSON.parse(await fs.readFile(new URL('../assets/gwynthor-horse-studs/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.active.length, 36); assert(manifest.images.length >= 42);
  for (const item of manifest.images) {
    const image = await fs.readFile(new URL(`../../${item.path}`, import.meta.url));
    assert.equal(createHash('sha256').update(image).digest('hex'), item.sha256);
    assert.match(item.original, /^AleriaAlmanach\/docs\/art\/gwynthor-horse-studs-20261113\/originals\//);
  }
  assert(manifest.active.some(i => i.path.includes('maelrig-caeffyn-v3.png')));
});

test('saved Aurdden revision one acquires Kyria’s new role and marriage without reopening adopted relatives', () => {
  const registered = family('haus-aurdden'), saved = structuredClone(registered);
  saved.extensions.sourceRevision = 1;
  saved.persons = saved.persons.filter(p => p.id !== 'maelrig-caeffyn');
  saved.houses = saved.houses.filter(h => h.id !== 'house-caeffyn');
  saved.partnerships = saved.partnerships.filter(p => p.id !== KYRIA_MARRIAGE_ID);
  saved.cadetBranches = saved.cadetBranches.filter(b => b.id !== 'married-away-kyria-caeffyn');
  const kyria = saved.persons.find(p => p.id === 'kyria-aurdden');
  Object.assign(kyria, { title: 'Bankzweig · Schriftverkehr', notes: 'Bisherige Bankkorrespondenz.', portrait: '', tags: ['bank'] });
  kyria.extensions.portraitIntentionallyAbsent = true;
  saved.persons.find(p => p.id === 'kyrwyn-aurdden').notes = 'Eigenständige bereits übernommene Chronik.';
  const upgraded = resolveRegisteredFamilyUpgrade(registered, saved), actual = upgraded.persons.find(p => p.id === kyria.id);
  for (const field of ['title', 'notes', 'portrait', 'tags']) assert.deepEqual(actual[field], registered.persons.find(p => p.id === kyria.id)[field]);
  assert.equal(actual.extensions.portraitIntentionallyAbsent, false);
  assert.deepEqual(upgraded.parentages, saved.parentages);
  for (const person of saved.persons.filter(p => p.id !== kyria.id)) {
    const { extensions, ...before } = person, { extensions: afterExtensions, ...after } = upgraded.persons.find(p => p.id === person.id);
    assert.deepEqual(after, before, person.id);
  }
  assert.equal(upgraded.partnerships.filter(p => p.id === KYRIA_MARRIAGE_ID).length, 1);
  assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, upgraded), upgraded);
});
