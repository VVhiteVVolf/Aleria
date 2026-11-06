import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { access, readFile } from 'node:fs/promises';
import { buildHonigtoertchen } from '../modules/zum-honigtoertchen/honigtoertchen-module.mjs';
import { HONIGTOERTCHEN_SECTION } from '../modules/zum-honigtoertchen/honigtoertchen-profile.mjs';
import { HONIGTOERTCHEN_ASSORTMENT } from '../modules/zum-honigtoertchen/honigtoertchen-assortment.mjs';
import { MELOG_PEOPLE, MELOG_FAMILY_CANDIDATES } from '../modules/zum-honigtoertchen/honigtoertchen-people.mjs';
import { buildMelogCharacterExports } from '../modules/zum-honigtoertchen/honigtoertchen-characters.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';
import { HOUSE_MELOG_FAMILY } from '../../Stammbäume/assets/js/data/house-melog-family.js';
import { HONIGTOERTCHEN_VACANCIES } from '../modules/zum-honigtoertchen/honigtoertchen-hierarchy.mjs';
import { buildVenueWorkforce } from '../modules/economy-calculator/economy-venue-workforce.mjs';
import { resolveModuleProduct } from '../../firebase/functions/src/mechanics/item-register-module-source.js';
import { projectBuiltinTradeModule } from '../scripts/scene-trade/scene-trade-builtin-projection.mjs';

const entry = buildHonigtoertchen();
const catalog = entry.pages.find(page => page.tradeCatalogPage).tradeCatalog;

test('the complete shop uses distinct stable threads and six genuine scene pages in Gwynthor', () => {
  assert.equal(entry.pages.length, 12);
  assert.equal(new Set(entry.pages.map(page => page.commentThreadKey)).size, entry.pages.length);
  const scenes = entry.pages.filter(page => page.sessionPage);
  assert.equal(scenes.length, 6);
  assert.deepEqual(scenes.map(page => page.commentThreadKey), [
    'honigtoertchen-szene-aussenansicht', 'honigtoertchen-szene-verkaufsraum',
    'honigtoertchen-szene-gastraum', 'honigtoertchen-szene-backstube',
    'honigtoertchen-szene-vorratskammer', 'honigtoertchen-szene-wohnstube'
  ]);
  assert.equal(entry.pages.at(-1).commentThreadKey, 'honigtoertchen-szene-wohnstube');
  assert.equal(entry.pages.at(-1).pageTitle, 'Die Wohnstube · Obere Etage');
  assert.match(entry.pages.at(-1).image, /\/scenes\/wohnstube\.png$/);
  assert(scenes.every(page => page.sessionIntro.length > 150 && page.sessionHint && page.sessionEmptyTitle && page.sessionEmptyText));
  assert(scenes.every(page => page.sessionDateAleria.year === null));
  assert.equal(HONIGTOERTCHEN_SECTION.path.at(-1), 'Gwynthor-Stadt');
  assert.equal(entry.sessionCast.length, 15);
  assert(!entry.sessionCast.includes(MELOG_PEOPLE.find(person => person.name === 'Ithel').worldPersonId));
});

test('all offered units become shared consumable Speisen with stable versioned definitions and fixed prices', () => {
  const offers = buildModuleOffers([entry]);
  assert.equal(offers.length, 24);
  assert.equal(new Set(offers.map(offer => offer.id)).size, 24);
  assert.equal(catalog.categories.length, 5);
  for (const offer of offers) {
    const product = HONIGTOERTCHEN_ASSORTMENT.find(product => product.id === offer.sourceRefs[0].itemId);
    assert.equal(offer.category, 'speisen', offer.title);
    assert.equal(offer.inventoryUseMode, 'consume', offer.title);
    assert.equal(offer.definitionKind, 'shared');
    assert.equal(offer.priceRange.minCopper, product.copper);
    assert.equal(offer.priceRange.maxCopper, product.copper);
    assert.equal(offer.hiddenMeta.unit, product.unit);
    assert(offer.definitionRef.id && offer.definitionRef.revision);
    assert.deepEqual(offer.attributes, []);
    assert.equal(offer.mechanicsStatus, 'narrative');
  }
  assert(!offers.some(offer => /messer/i.test(offer.title)));
});

test('the real editor round trip preserves every offer, price, unit, ingredients and consumable category', async () => {
  const context = vm.createContext({ console, window: {}, URL });
  const core = await readFile(new URL('../modules/core/app-core.js', import.meta.url), 'utf8');
  vm.runInContext(core.slice(core.indexOf('function slugify('), core.indexOf('\nfunction ', core.indexOf('function slugify(') + 1)), context);
  vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-data.js', import.meta.url), 'utf8'), context);
  context.catalog = structuredClone(catalog);
  const normalized = structuredClone(vm.runInContext('sanitizeTradeCatalogData(catalog)', context));
  const after = buildModuleOffers([{ ...entry, pages: entry.pages.map(page => page.tradeCatalogPage ? { ...page, tradeCatalog: normalized } : page) }]);
  const before = buildModuleOffers([entry]);
  assert.equal(after.length, before.length);
  for (const offer of after) {
    const prior = before.find(item => item.id === offer.id);
    assert(prior, offer.title);
    assert.equal(offer.category, 'speisen');
    assert.equal(offer.inventoryUseMode, 'consume');
    assert.deepEqual(offer.priceRange, prior.priceRange);
    assert.equal(offer.hiddenMeta.unit, prior.hiddenMeta.unit);
    assert.equal(offer.definitionRef.revision, prior.definitionRef.revision);
  }
  assert(normalized.items.every(item => item.features.length === 2));
});

test('the existing backend resolves all 24 offers with the same prices and revisions through an in-memory source reader', async () => {
  const offers = buildModuleOffers([entry]);
  const projected = projectBuiltinTradeModule(entry, HONIGTOERTCHEN_SECTION);
  assert.deepEqual(buildModuleOffers([projected.entry]), offers);
  const documents = new Map([
    ['char_tabs/config', { moduleStoreManifest: { entryOverrideIds: [entry.id], hiddenModuleIds: {} } }],
    [`module_store_entries/${entry.id}`, { entryJson: JSON.stringify(entry) }]
  ]);
  const database = { doc: path => path, collection: name => ({ doc: id => `${name}/${id}` }) };
  const transaction = { get: async path => ({ data: () => documents.get(path) }) };
  for (const offer of offers) {
    const resolved = await resolveModuleProduct({ database, transaction, standards: [], input: {
      action: 'buy', moduleId: entry.id, productId: offer.id, sourceRevision: offer.sourceRevision
    } });
    assert.deepEqual(resolved.priceRange, offer.priceRange);
    assert.equal(resolved.definitionSourceId, offer.definitionSourceId);
    assert.equal(resolved.sourceRevision, offer.sourceRevision);
  }
});

test('Gwynthor lists the family with its canonical ID and the bakery under craft businesses', async () => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(await readFile(new URL('../../Orte/Koenigreich_Cenyr/Grafschaft_Celtigerns_Wacht/Baronie_Llamreis_Ankunft/Gwynthors_Bannkreis/Gwynthor/ort.data.js', import.meta.url), 'utf8'), context);
  const city = structuredClone(context.window.ORT_DATA);
  const house = city.houses.flatMap(group => group.items).find(house => house.familyId === 'melog');
  assert(house);
  assert.match(house.emblem, /melog-emblem\.png$/);
  const bakery = city.merchants.filter(merchant => merchant.name === entry.title);
  assert.equal(bakery.length, 1);
  assert.equal(bakery[0].category, 'handwerk');
  assert.match(bakery[0].owner, /Tewdwr/);
});

test('services use existing icons only and retain detailed scopes, prices and order conditions', async () => {
  const page = entry.pages.find(page => page.guildServicesPage);
  assert.equal(page.image, undefined);
  assert.equal(page.guildServices.services.length, 12);
  for (const service of page.guildServices.services) {
    assert(service.icon.startsWith('../IconOrdner/'));
    assert(service.description.length > 150 && service.clients && service.scope && service.terms);
    assert(!service.icon.includes('/scenes/'));
    await access(new URL(`../${service.icon}`, import.meta.url));
  }
  assert.match(page.guildServices.process, /Gesamtpreis/);
  assert.match(page.guildServices.conditions, /ausdrücklicher Zusage/);
});

test('the hierarchy uses the supplied professional roles while children and unrelated occupations stay outside employment', () => {
  const hierarchy = entry.pages.find(page => page.hierarchyPage).hierarchy;
  assert.equal(hierarchy.trees.length, 3);
  assert.match(hierarchy.sideImage, /zum-honigtoertchen\/scenes\/backstube\.png$/);
  const names = hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes.filter(node => !/Unbesetzt/.test(node.subtitle)).map(node => node.title)));
  assert.deepEqual(new Set(names), new Set(['Tewdwr', 'Morfudd', 'Anest', 'Guto', 'Nerys', 'Afanen', 'Llywarch', 'Eiffion', 'Mabli']));
  assert(!names.some(name => ['Cerys', 'Iddon', 'Teleri', 'Elisedd'].includes(name)));
  const cerys = MELOG_PEOPLE.find(person => person.name === 'Cerys');
  assert.equal(cerys.birth, '1731');
  assert.match(cerys.role, /Kind/);
});

test('seven separately editable silhouette positions remain unfilled through the real hierarchy sanitizer and cost no wages', async () => {
  const hierarchy = entry.pages.find(page => page.hierarchyPage).hierarchy;
  const context = vm.createContext({ console, window: {}, URL });
  vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-data.js', import.meta.url), 'utf8'), context);
  context.hierarchy = structuredClone(hierarchy);
  const normalized = structuredClone(vm.runInContext('sanitizeHierarchyData(hierarchy)', context));
  const slots = normalized.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes)).filter(node => /Unbesetzt/.test(node.subtitle));
  assert.equal(slots.length, 7);
  assert.deepEqual(slots.map(node => node.title), ['Bäckergeselle', 'Bäckergesellin', 'Konditoreihilfe', 'Backstubenhilfe', 'Bäckerlehrling', 'Konditorlehrling', 'Lieferhilfe']);
  assert.equal(new Set(HONIGTOERTCHEN_VACANCIES.map(node => node.id)).size, 7);
  for (const slot of slots) {
    assert.match(slot.text, /Noch zu besetzen · später ausfüllbar/);
    assert.match(slot.portrait, /\/placeholders\/(?:male|female|unknown)\.png$/);
    await access(new URL(`../${slot.portrait}`, import.meta.url));
  }
  const workforce = buildVenueWorkforce({ ...entry, pages: [{ hierarchyPage: true, hierarchy: normalized }] }, { owners: ['Tewdwr'] });
  assert.equal(workforce.filter(worker => worker.kind === 'vacancy').length, 7);
  assert(workforce.filter(worker => worker.kind === 'vacancy').every(worker => worker.dailyCash === 0 && worker.days === 0 && worker.boardDays === 0));
  assert.equal(MELOG_PEOPLE.length, 16);
  assert.equal(buildMelogCharacterExports().length, 16);
});

test('the bounded character sources preserve canonical identities, relationships, portraits and corrected dates without equipment', () => {
  const exports = buildMelogCharacterExports();
  assert.equal(exports.length, 16);
  assert.equal(new Set(exports.map(entry => entry.character.id)).size, 16);
  for (const exported of exports) {
    const character = exported.character;
    const person = HOUSE_MELOG_FAMILY.persons.find(person => person.worldPersonId === character.id);
    assert(person);
    assert.equal(character.identity.worldPersonId, person.worldPersonId);
    assert.equal(character.genealogy.birth, person.birth);
    assert.equal(character.genealogy.death, person.death);
    assert.equal(character.portrait, `../Stammbäume/${person.portrait}`);
    assert.equal(character.inventory, null);
    assert.equal(character.combatProfile, undefined);
    assert(character.bio.length > 150);
    assert(character.biography);
  }
  assert.equal(MELOG_FAMILY_CANDIDATES.length, 18);
  assert(MELOG_FAMILY_CANDIDATES.every(candidate => candidate.url.includes(`person=${candidate.personId}`)));
  assert(!exports.some(entry => /Unbekannt/.test(entry.character.name)));
  assert.equal(exports.find(entry => entry.character.name === 'Morfudd').character.identity.worldPersonId, 'person--melog--person-30cd0b46');
});

test('the existing archive registration is repeatable and preserves an already present module object', () => {
  const context = vm.createContext({ SECTIONS: [], structuredClone });
  const registration = renderArchiveSectionRegistration('registerHonigtoertchen', [{ ...HONIGTOERTCHEN_SECTION, entry }], 'test');
  vm.runInContext(registration, context);
  context.SECTIONS[0].entries[0].customValue = 'local';
  vm.runInContext(registration, context);
  assert.equal(context.SECTIONS.length, 1);
  assert.equal(context.SECTIONS[0].entries.length, 1);
  assert.equal(context.SECTIONS[0].entries[0].customValue, 'local');
});

test('artwork referenced by the shop exists locally, including each individual product, portrait and scene', async () => {
  const paths = new Set();
  const collect = value => {
    if (typeof value === 'string' && /^(?:\.\/assets\/zum-honigtoertchen\/|\.\.\/Stammbäume\/assets\/|\.\.\/IconOrdner\/)/.test(value)
      && /\.(?:png|jpe?g|webp)$/i.test(value)) paths.add(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  };
  collect(entry);
  for (const path of paths) await access(new URL(`../${path}`, import.meta.url));
  assert([...paths].filter(path => path.includes('/food/')).length === 24);
});
