import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { completeLachendeNixe } from '../modules/lachende-nixe/nixe-module.mjs';
import { nixeOriginalNodes } from '../modules/lachende-nixe/nixe-hierarchy.mjs';
import { NIXE_FAMILY_PEOPLE } from '../modules/lachende-nixe/nixe-family-people.mjs';
import { NIXE_DISHES, NIXE_WINES } from '../modules/lachende-nixe/nixe-menu.mjs';
import { NIXE_SERVICES } from '../modules/lachende-nixe/nixe-services.mjs';
import { planNixeCharacters } from '../modules/lachende-nixe/nixe-characters.mjs';
import { buildModuleOffers } from '../modules/item-register/item-register-module-catalog.js';
import vm from 'node:vm';
import { HOUSE_SONNENFELS_FAMILY as family } from '../../Stammbäume/assets/js/data/house-sonnenfels-family.js';
import { assertValidFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
const read = async path => JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
const source = (await read('../modules/lachende-nixe/sources/module-before-finalization.json')).entry;
const catalogs = [await read('../modules/krumme-kanne/source/teyrngarch.json'), ...await read('../modules/lachende-nixe/sources/drink-catalogs.json')];
const entry = completeLachendeNixe(source, catalogs);

test('Nixe preserves owner prose, portraits, page identities and scene clocks', () => {
  assert.equal(entry.id, source.id);
  assert.equal(entry.pages.length, source.pages.length + 1);
  source.pages.forEach((before, index) => {
    const page = entry.pages[index < 4 ? index : index + 1];
    assert.equal(page.commentThreadKey, before.commentThreadKey);
    assert.deepEqual(page.sessionDateAleria, before.sessionDateAleria);
  });
  const before = source.pages[1], after = entry.pages[1];
  for (const field of ['image', 'description', 'quote', 'quoteBy', 'stats']) assert.deepEqual(after[field], before[field]);
  for (const field of ['biographyText', 'historyText', 'works', 'trivia', 'quotes', 'footer']) assert.deepEqual(after.biography[field], before.biography[field]);
  assert.deepEqual(after.biography.connections.slice(0, before.biography.connections.length), before.biography.connections);
  assert.equal(after.biography.abilities.length, 4);
  assert.ok(after.biography.abilities.every(ability => ability.icon.endsWith('.png')));
  assert.match(entry.image, /scenes\/aussenansicht/);
  assert.match(entry.symbol, /references\/schild/);
});

test('six departments retain every old person and all fourteen user vacancies', () => {
  const hierarchy = entry.pages[2].hierarchy;
  assert.deepEqual(hierarchy.trees.map(tree => tree.label), ['Führung', 'Herberge & Gäste', 'Gesellschaft & Unterhaltung', 'Küche', 'Sicherheit', 'Sonstige']);
  assert.equal(hierarchy.treeDisplayMode, 'tabs');
  const nodes = hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
  assert.equal(new Set(nodes.map(node => node.id)).size, nodes.length);
  nixeOriginalNodes(source).forEach((node, index) => {
    const current = nodes.find(item => item.id === `nixe-original-${index + 1}`);
    assert.ok(current);
    assert.equal(current.portrait, node.portrait);
    assert.equal(current.subtitle, node.subtitle === 'Musikant' ? 'Musikantin' : node.subtitle);
  });
  assert.equal(nodes.filter(node => /^nixe-original/.test(node.id) && !node.portrait).length, 14);
  assert.ok(nodes.filter(node => !node.portrait).length > 25);
  assert.ok(hierarchy.trees.every(tree => tree.levels.every(level => level.nodes.length <= 6)));
  assert.ok(nodes.find(node => node.title === 'Rosalinde Sonnenfels'));
  assert.ok(nodes.find(node => node.title === 'Kaspar Sonnenfels'));
  for (const name of ['Eirona', 'Rhosiel', 'Lliwen', 'Severina', 'Adeltrud', 'Thjodhild']) assert.ok(nodes.find(node => node.title === name));
  for (const child of ['Raban Sonnenfels', 'Irmelin Sonnenfels']) assert.ok(!nodes.some(node => node.title === child));
});

test('goods migration preserves all standard purchase identities and adds the requested menu', async () => {
  const before = buildModuleOffers([source], []), after = buildModuleOffers([entry], []);
  assert.equal(before.length, 21);
  assert.equal(after.length, 45);
  for (const offer of before) {
    const current = after.find(item => item.id === offer.id);
    assert.ok(current, offer.name || offer.id);
    assert.deepEqual(current.priceRange, offer.priceRange);
    assert.equal(current.unit, offer.unit);
  }
  assert.equal(entry.pages[3].tradeCatalog.items.length, 41);
  assert.equal(NIXE_DISHES.filter(dish => dish.course === 'Vorspeise').length, 3);
  assert.equal(NIXE_DISHES.filter(dish => dish.course === 'Leichtes Hauptgericht').length, 3);
  assert.equal(NIXE_DISHES.filter(dish => dish.course === 'Monatsgericht').length, 1);
  assert.equal(NIXE_WINES.filter(wine => wine.id.startsWith('weinlaub')).length, 2);
  assert.equal(NIXE_WINES.filter(wine => wine.id.startsWith('weissmann')).length, 2);
  assert.equal(NIXE_WINES.filter(wine => wine.id.startsWith('tischwein')).length, 3);
  const context = vm.createContext({ console, window: {}, URL });
  const core = await readFile(new URL('../modules/core/app-core.js', import.meta.url), 'utf8');
  vm.runInContext(core.slice(core.indexOf('function slugify('), core.indexOf('\nfunction ', core.indexOf('function slugify(') + 1)), context);
  vm.runInContext(await readFile(new URL('../modules/module-editor/module-editor-data.js', import.meta.url), 'utf8'), context);
  context.catalog = entry.pages[3].tradeCatalog;
  const normalized = vm.runInContext('sanitizeTradeCatalogData(catalog)', context);
  assert.equal(normalized.items.length, 41);
  assert.equal(buildModuleOffers([{ ...entry, pages: [{ tradeCatalogPage: true, tradeCatalog: normalized }] }], []).length, 45);
});

test('guest book keeps existing IDs and retains named guests when expanded', () => {
  const guests = entry.pages[5].guestRegister.sections.flatMap(section => section.guests);
  assert.equal(guests.length, 20);
  for (const old of source.pages[4].guestRegister.sections.flatMap(section => section.guests)) assert.ok(guests.find(guest => guest.id === old.id));
  const custom = structuredClone(source);
  Object.assign(custom.pages[4].guestRegister.sections[0].guests[0], { name: 'Ein echter Gast', description: 'Wartet auf sein Schiff.', portrait: 'private.png' });
  const edited = completeLachendeNixe(custom, catalogs);
  assert.deepEqual(edited.pages[5].guestRegister.sections[0].guests[0], custom.pages[4].guestRegister.sections[0].guests[0]);
});

test('services use the existing service template, clear durations and 36-night lodging tariffs', () => {
  const page = entry.pages[4];
  assert.equal(page.guildServicesPage, true);
  assert.equal(page.guildServices.services.length, 14);
  assert.equal(new Set(page.guildServices.services.map(service => service.icon)).size, 8);
  assert.ok(page.guildServices.services.every(service => service.scope && /Kupfertaler/.test(service.terms)));
  const monthly = NIXE_SERVICES.find(service => service.id === 'dauerzimmer');
  assert.match(monthly.unit, /36 Nächte/);
  assert.equal(monthly.copper, (12 * 36 + .5 * 36) * .8);
  assert.equal(buildModuleOffers([entry], []).length, 45, 'Dienstleistungen bleiben eigenständig, ohne Figuren oder Zimmer als Inventarwaren anzulegen');
});

test('Sonnenfels keeps legitimate and illegitimate branches distinct and the nephew in charge', () => {
  assertValidFamily(family);
  assert.equal(family.persons.length, 25);
  assert.equal(family.timeJumps.length, 1);
  assert.equal(family.persons.find(person => person.id === 'dietmar-sonnenfels').lineageRole, 'head');
  const albrecht = family.parentages.find(link => link.childId === 'albrecht-sonnenfels');
  assert.ok(albrecht.parentIds.includes('dagorath-sonnenfels'));
  assert.notEqual(albrecht.legitimacy, 'illegitimate');
  const kaspar = family.parentages.find(link => link.childId === 'kaspar-sonnenfels');
  assert.equal(kaspar.legitimacy, 'illegitimate');
  assert.ok(kaspar.parentIds.includes('unbekannte-mutter-kaspar-sonnenfels'));
  assert.ok(!kaspar.parentIds.includes('johanna-falkenhayn'));
  assert.equal(family.cadetBranches[0].targetFamilyId, 'haus-unbekannt');
  assert.ok(!family.parentages.some(link => link.parentIds.includes('adelheid-sonnenfels')));
  assert.equal(1740 - Number(NIXE_FAMILY_PEOPLE.find(person => person.key === 'rosalinde').birth), 19);
});

test('character plan respects existing data and keeps distant relatives outside the staff', () => {
  const plan = planNixeCharacters(source, [], {}, '2026-10-16T12:00:00Z');
  assert.equal(plan.entries.length, 28);
  assert.equal(new Set(plan.entries.map(item => item.id)).size, 28);
  assert.equal(plan.entries.find(item => item.key === 'dietmar').data.currentLocation, 'Weisenfluh · Burg Sonnenfels');
  const existing = plan.entries.map(item => ({ id: item.id, ...item.data, bio: 'Eigener Text', hp: 9, inventory: { kept: true } }));
  const next = planNixeCharacters(source, existing, plan.config, '2026-10-16T13:00:00Z');
  assert.ok(next.entries.every(item => !item.create && !item.patch));
  assert.deepEqual(next.config, plan.config);
});

test('all newly referenced art and owner icons exist locally', async () => {
  const images = new Set();
  function collect(value) {
    if (typeof value === 'string' && /^(\.\/assets\/lachende-nixe\/|\.\.\/IconOrdner\/|\.\.\/Stammbäume\/assets\/images\/houses\/Weisenfluh\/haus-sonnenfels)/.test(value)) images.add(value);
    else if (Array.isArray(value)) value.forEach(collect);
    else if (value && typeof value === 'object') Object.values(value).forEach(collect);
  }
  collect(entry); collect(NIXE_FAMILY_PEOPLE.map(person => person.portrait));
  for (const image of images) await access(new URL(`../${image}`, import.meta.url));
});
