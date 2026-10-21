import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import vm from 'node:vm';
import { buildArkaneum, ARKANEUM_SECTION } from '../modules/arkaneum/arkaneum-module.mjs';
import { ARKANEUM_PEOPLE, ARKANEUM_STAFF, LOTHAIRE_FAMILY } from '../modules/arkaneum/arkaneum-people.mjs';
import { STANDARD_ITEMS } from '../modules/item-register/item-register-standard.js';
import { parsePrice } from '../modules/item-register/item-register-money.js';
import { evaluateVenueScope } from '../modules/economy-calculator/economy-venue-scope.mjs';
import { GWYNTHOR_CITY_PATH } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
import { HOUSE_LOTHAIRE_FAMILY as family } from '../../Stammbäume/assets/js/data/house-lothaire-family.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { auditFamilyChartLayoutPolicy } from '../../Stammbäume/assets/js/adapters/family-chart-layout-policy.js';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';

const entry = buildArkaneum();
const root = new URL('../../', import.meta.url);
test('Arkaneum is one ordinary city module, even when registration is repeated', async () => {
  assert.deepEqual(ARKANEUM_SECTION.path, GWYNTHOR_CITY_PATH);
  const context = vm.createContext({ SECTIONS: [{ tab: ARKANEUM_SECTION.tab, path: GWYNTHOR_CITY_PATH, entries: [{ id: 'existing-shop' }] }] });
  const source = await readFile(new URL('../modules/arkaneum/arkaneum-data.js', import.meta.url), 'utf8');
  vm.runInContext(source, context); vm.runInContext(source, context);
  assert.equal(context.SECTIONS.length, 1);
  assert.deepEqual(Array.from(context.SECTIONS[0].entries, e => e.id), ['existing-shop', entry.id]);
  assert.equal(entry.pages.length, 15);
  assert.equal(entry.pages.filter(p => p.sessionPage).length, 5);
  assert.equal(entry.appendCommentsPage, false);
  assert.equal(new Set(entry.pages.map(p => p.commentThreadKey)).size, entry.pages.length);
});
test('calculation deferral is explicit and does not change ordinary shop eligibility', () => {
  assert.equal(evaluateVenueScope(entry, ARKANEUM_SECTION).eligible, false);
  assert.equal(evaluateVenueScope({ ...entry, economyCalculationDeferred: false }, ARKANEUM_SECTION).eligible, true);
  assert.ok(!entry.pages.some(p => p.economyCalculationPage || p._commentsPage));
});
test('all new standard goods share canonical prices and units with the central register', () => {
  const pages = entry.pages.filter(p => p.tradeCatalogPage);
  assert.deepEqual(pages.map(p => p.tradeCatalog.items.length), [24, 38, 5, 6]);
  for (const page of pages.slice(0, 2)) for (const item of page.tradeCatalog.items) {
    const source = STANDARD_ITEMS.find(s => s.id === item.canonicalKey);
    assert.ok(source, item.title);
    assert.deepEqual(parsePrice(item.priceMax ? `${item.priceMin} - ${item.priceMax}` : item.priceMin, item.currencyCode), source.priceRange);
    assert.equal(item.unit, source.hiddenMeta.unit);
  }
  const arcane = pages[1].tradeCatalog;
  assert.equal(arcane.items.filter(i => i.category === 'steine').length, 20);
  const calc = pages[0].tradeCatalog.items.find(i => i.canonicalKey.endsWith(':kalzinator'));
  assert.match(calc.unit, /10 × 8 cm/);
  assert.match(calc.image, /kalzinator-v2\.png$/);
  assert.match(calc.description, /Reisekalzinator/);
});
test('rare materials remain in own assortment; six requested arcane specials are retained', () => {
  const [alch, arc, ownAlch, ownArc] = entry.pages.filter(p => p.tradeCatalogPage).map(p => p.tradeCatalog.items);
  assert.ok(!alch.some(i => /blut|ektoplasma|gift|droge|trollherz/i.test(i.title)));
  assert.ok(!arc.some(i => /schwarzer seelenstein/i.test(i.title)));
  assert.equal(ownAlch.length, 5); assert.equal(ownArc.length, 6);
  const bomb = ownAlch.find(i => /Splitterbombe/.test(i.title));
  assert.equal(bomb.canonicalKey, undefined);
  assert.ok(!alch.some(i => /bombe/i.test(i.title)));
  assert.notEqual(bomb.image, STANDARD_ITEMS.find(i => i.id === 'standard:alchemist:tenebrium-bombe').image);
  assert.match(ownArc.find(i => /Glutversprechen/.test(i.title)).description, /Feuerschaden/);
  assert.match(ownArc.find(i => /Pfeilspitzen/.test(i.title)).conditions, /ohne Schäfte/);
});
test('local display names retain their canonical standard template', () => {
  const chains = buildModuleOffers([entry], STANDARD_ITEMS).find(item => item.title === 'Tenebrit-Ketten');
  assert.equal(chains.templateId, 'standard:arkanist:tenebrium-ketten');
  const book = buildModuleOffers([entry], STANDARD_ITEMS).find(item => item.title === 'Grundlagen der Magie · Band I');
  assert.equal(book.templateId, 'standard:arkanist:grundlagen-der-magie');
});
test('hierarchy has eleven distinct working people and no deceased women', () => {
  const hierarchy = entry.pages.find(p => p.hierarchyPage).hierarchy;
  const nodes = hierarchy.trees.flatMap(t => t.levels.flatMap(l => l.nodes));
  assert.equal(nodes.length, 11); assert.equal(new Set(nodes.map(n => n.title)).size, 11);
  assert.equal(ARKANEUM_STAFF.length, 11);
  assert.equal(ARKANEUM_PEOPLE.length, 13);
  assert.ok(!nodes.some(n => ['Helygyn', 'Perdella'].includes(n.title)));
});
test('family uses serial founders and an explicit motifless bastard branch with shared identities', () => {
  assert.deepEqual(assertValidFamily(family).diagnostics, []);
  assert.deepEqual(auditFamilyChartLayoutPolicy(family).issues, []);
  assert.equal(family.persons.length, 7);
  assert.equal(family.timeJumps.length, 1);
  assert.deepEqual(family.timeJumps[0].childIds, ['herluin-lothaire']);
  assert.deepEqual(family.cadetBranches[0].childIds, ['rhydian-o-cenyr']);
  assert.match(family.cadetBranches[0].emblem, /neutral-crest/);
  assert.equal(family.parentages.find(p => p.childId === 'rhydian-o-cenyr').legitimacy, 'illegitimate');
  assert.equal(family.parentages.find(p => p.childId === 'maelwyn-o-cenyr').legitimacy, 'legitimate');
  for (const p of LOTHAIRE_FAMILY) assert.equal(family.persons.find(f => f.id === p.id).worldPersonId, p.worldPersonId);
  assert.equal(family.persons.filter(p => p.sex === 'female' && p.birth).every(p => !p.houseId && !/\s/.test(p.name) && !!p.death), true);
});
test('every local referenced image exists and inventory illustrations are square RGBA PNGs', async () => {
  const goods = entry.pages.filter(p => p.tradeCatalogPage).flatMap(p => p.tradeCatalog.items);
  const images = new Set([...ARKANEUM_PEOPLE.map(p => p.portrait), entry.symbol, ...entry.pages.map(p => p.image), ...goods.map(i => i.image)].filter(Boolean));
  for (const src of images) {
    if (/^https?:/.test(src)) continue;
    const url = src.startsWith('/AleriaAlmanach/') ? new URL(src.slice(1), root) : new URL(src, new URL('../', import.meta.url));
    await access(url);
    if (!goods.some(i => i.image === src)) continue;
    const bytes = await readFile(url);
    assert.equal(bytes.toString('ascii', 1, 4), 'PNG');
    assert.equal(bytes.readUInt32BE(16), bytes.readUInt32BE(20), src);
    assert.equal(bytes[25], 6, `${src}: expected RGBA`);
  }
});
