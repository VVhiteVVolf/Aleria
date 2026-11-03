import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { createHousePageData, createHouseBiography } from '../modules/house-content/house-content-outputs.mjs';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const before = JSON.parse(readFileSync(new URL('diagnostics/tal-der-milane-house-pages-20261103/before.json', root), 'utf8'));
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
  return entry.isDirectory() ? walk(url) : [url];
});
const modules = walk(new URL('Estryll/Cenyr/Tal_der_Milane/', feature)).filter(url => url.pathname.endsWith('/haus.content.mjs'));
const sources = new Map(await Promise.all(modules.map(async url => {
  const { HOUSE_CONTENT: content } = await import(url);
  return [content.id, { content, url }];
})));
const records = FAMILY_REGISTRY.filter(record => sources.has(record.id));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const graph = family => Object.fromEntries(graphKeys.map(key => [key, family[key]]));
const normalizedGraph = family => Object.fromEntries(graphKeys.map(key => [key,
  family[key].map(entry => ({ ...entry, extensions: entry.extensions || {} }))]));
const context = vm.createContext({ window: {} });
vm.runInContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), context);

test('19 Häuser haben verknüpfte Hausseite, Bio und das eigene kanonische Iframe', () => {
  assert.equal(sources.size, 19);
  for (const { content, url } of sources.values()) {
    const page = createHousePageData(content);
    const bio = createHouseBiography(content);
    const registered = context.window.HaeuserRegistry.byId(content.id);
    assert.equal(registered.status, 'active', content.id);
    const tree = new URL(page.familyTreeEmbed.src, feature);
    assert.equal(tree.searchParams.get('family'), content.id);
    assert.equal(tree.searchParams.get('mode'), 'view');
    assert.equal(tree.pathname, new URL('Stammbäume/Stammbaum.html', root).pathname);
    const local = { window: {} };
    vm.runInNewContext(readFileSync(new URL('haus.data.js', url), 'utf8'), local);
    assert.deepEqual(JSON.parse(JSON.stringify(local.window.HAEUSER_DATA)), page);
    assert.deepEqual(FAMILY_REGISTRY.find(record => record.id === content.id).family.extensions.houseBiographyModule, bio);
    assert.equal(new URL(bio.house.documents[0].link, new URL('Stammbäume/', root)).searchParams.get('haus'), content.id);
    assert.deepEqual(page.hiddenProfileGroups, ['military']);
    for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(page.profile[key], '', `${content.id}: ${key}`);
  }
});

test('Alle 21 bestehenden Stammbäume behalten sämtliche Personen und Graphsammlungen', () => {
  assert.equal(before.length, 21);
  for (const baseline of before) {
    const record = FAMILY_REGISTRY.find(record => record.id === baseline.id);
    assert.equal(sha256(JSON.stringify(graph(record.family))), baseline.graphFingerprint, record.id);
  }
});

test('Bio-Ergänzung erhält eigene Texte, explizite Löschungen und eigene Personenänderungen', () => {
  for (const record of records) {
    const local = structuredClone(record.family);
    local.extensions.sourceRevision = before.find(entry => entry.id === record.id).sourceRevision;
    delete local.extensions.houseBiographyModule;
    local.persons[0].name = 'Eigene Personenbearbeitung';
    const normalized = normalizeFamily(local);
    const upgraded = resolveRegisteredFamilyUpgrade(record.family, local);
    assert.equal(sha256(JSON.stringify(normalizedGraph(upgraded))), sha256(JSON.stringify(normalizedGraph(normalized))), record.id);
    assert.equal(upgraded.extensions.houseBiographyModule.pageTitle, sources.get(record.id).content.name);
    for (const custom of [null, { ...structuredClone(record.family.extensions.houseBiographyModule), description: 'Eigene Hausgeschichte', commentSequence: [{ text: 'Eigene Notiz' }] }]) {
      local.extensions.houseBiographyModule = custom;
      const result = resolveRegisteredFamilyUpgrade(record.family, local);
      assert.deepEqual(result.extensions.houseBiographyModule, custom, record.id);
      assert.equal(result.persons[0].name, 'Eigene Personenbearbeitung');
    }
  }
});

test('Alle Bild- und Personenlinks sind lokal vorhanden und verwenden echte Identitäten', () => {
  for (const { content } of sources.values()) {
    const page = createHousePageData(content);
    for (const image of Object.values(page.images)) {
      if (!image.src) continue;
      assert.doesNotMatch(image.src, /^https?:/);
      assert.ok(existsSync(new URL(image.src, feature)), `${content.id}: ${image.src}`);
    }
    assert.ok(existsSync(new URL(content.territoryHref, feature)), content.territoryHref);
    for (const member of [content.founder, ...content.heads, ...content.heirs, ...content.offices, ...content.figures].filter(Boolean)) {
      if (!member.id) continue;
      assert.ok(FAMILY_REGISTRY.find(record => record.id === member.familyId)?.family.persons.some(person => person.id === member.id), `${content.id}: ${member.id}`);
    }
    assert.doesNotMatch(JSON.stringify(page), /Gelieferte Stammbaumgrafik|wl3UqqR|〈Platzhalter|Titel hier einfügen|Dialog von Figur/);
  }
});

test('Die 11 knappen Vorbereitungen erfinden weder Gründer noch Amtsinhaber', () => {
  const prepared = [...sources.values()].map(entry => entry.content).filter(content => content.prepared && !['haus-sliabh'].includes(content.id));
  assert.equal(prepared.length, 11);
  for (const content of prepared) {
    assert.equal(content.founder, null);
    assert.deepEqual(content.heads, []);
    assert.deepEqual(content.offices, []);
    assert.equal(content.profile.founding, '');
    assert.match(content.biographySummary.history, /bislang nicht vor/);
  }
  assert.equal(sources.get('haus-ffwnarch').content.type, 'Bürgerliches Haus');
  assert.match(sources.get('haus-durdynn').content.biographySummary.relations, /Caryl Durdynn.*Cónán Sliabh/);
  assert.equal(sources.get('haus-faelwyn').content.liege, "Haus Tylluan O'Penbryn");
});

test('Die Galerie weist alle 19 Hauptbilder genau ihren bestehenden Häusern zu', () => {
  const catalog = JSON.parse(readFileSync(new URL('Gallerien/krieger/data/catalog.json', root), 'utf8'));
  for (const { content } of sources.values()) {
    const hash = sha256(readFileSync(new URL(content.images.scene, feature)));
    const image = catalog.illustrations.find(image => image.sha256 === hash);
    assert.ok(image?.houseIds.includes(content.id), content.id);
    assert.ok(catalog.houses.find(house => house.id === content.id)?.illustrationIds.includes(image.id), content.id);
  }
});

test('Originalquellen und verworfene Bildfassungen bleiben im Archiv; aktive Ausgaben bleiben auslieferbar', () => {
  for (const { content, url } of sources.values()) {
    assert.ok(shouldPublish(`Familien Häuser und Clans/${content.images.scene}`), content.id);
    const directory = decodeURIComponent(url.pathname).split('/Familien Häuser und Clans/')[1].replace(/haus\.content\.mjs$/, '');
    const original = `Familien Häuser und Clans/${directory}animexx-original.html`;
    assert.equal(shouldPublish(original), false);
    for (const file of ['haus.data.js', 'haus.biography.mjs']) assert.ok(shouldPublish(`Familien Häuser und Clans/${directory}${file}`));
    if (content.images.scene.endsWith('-v2.png')) assert.equal(shouldPublish(`Familien Häuser und Clans/${content.images.scene.replace('-v2.png', '.png')}`), false);
  }
});
