import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_BIOGRAPHY_DEFAULTS } from '../../Stammbäume/assets/js/data/house-biographies.registry.js';
import { normalizeFamily, validateFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { createHouseBiography, createHousePageData } from '../modules/house-content/house-content-outputs.mjs';
import { reviewedGraphFingerprint } from './house-lore-reviewed-expectations.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const tree = new URL('Stammbäume/', root);
const json = url => JSON.parse(readFileSync(url, 'utf8'));
const fixture = json(new URL('fixtures/ivarsheim-initial-review.json', import.meta.url));
const initial = new Map(fixture.records.map(record => [record.id, record]));
const expected = [...fixture.records, { id: fixture.newClan.familyId, contentPath: fixture.newClan.contentPath }];
const ids = expected.map(record => record.id).sort();
const records = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const sources = new Map(await Promise.all(expected.map(async record => {
  const url = new URL(record.contentPath, root);
  const { HOUSE_CONTENT: content } = await import(url);
  return [record.id, { content, url }];
})));
const biographies = new Map(await Promise.all([...sources].map(async ([id, { url }]) => {
  const { HOUSE_BIOGRAPHY: biography } = await import(new URL('haus.biography.mjs', url));
  return [id, biography];
})));
const registry = vm.createContext({ window: {} });
vm.runInContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registry);
const pages = JSON.parse(JSON.stringify(registry.window.HAEUSER_REGISTRY));
const gallery = json(new URL('Gallerien/krieger/data/catalog.json', root));
const sha = value => createHash('sha256').update(value).digest('hex');
const plain = value => JSON.parse(JSON.stringify(value));
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const graph = family => Object.fromEntries(graphKeys.map(key => [key, family[key] || []]));
const normalizedGraph = family => Object.fromEntries(graphKeys.map(key => [key,
  (family[key] || []).map(entry => ({ ...entry, extensions: entry.extensions || {} }))]));
const members = content => [content.founder, ...(content.heads || []), ...(content.heirs || []),
  ...(content.offices || []), ...(content.figures || [])].filter(Boolean);
const strings = value => Array.isArray(value) ? value.flatMap(strings)
  : value && typeof value === 'object' ? Object.values(value).flatMap(strings)
    : typeof value === 'string' ? [value] : [];

function pageData(url) {
  const context = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(new URL('haus.data.js', url), 'utf8'), context);
  return plain(context.window.HAEUSER_DATA);
}

test('zwölf vorhandene Ivarsheim-Familien und der neue Clan Hrafnvald besitzen aktive Seiten und Bios', () => {
  assert.equal(fixture.publicOnly, true);
  assert.equal(initial.size, 12);
  assert.equal(ids.length, 13);
  const scoped = FAMILY_REGISTRY.filter(record => record.folderPath?.[0] === 'Aldrimar'
    && record.folderPath?.[1] === 'Ivarsheim').map(record => record.id).sort();
  assert.deepEqual(scoped, ids);
  for (const [id, { content, url }] of sources) {
    const record = records.get(id), registered = pages.find(entry => entry.id === id);
    assert.ok(record, id);
    assert.equal(record.listing, 'listed', id);
    assert.equal(content.id, id);
    assert.equal(content.name, record.title, id);
    assert.equal(content.registerPage, true, id);
    assert.equal(registered?.status, 'active', id);
    assert.equal(new URL(registered.data, feature).pathname, new URL('haus.data.js', url).pathname, id);
    assert.deepEqual(pageData(url), plain(createHousePageData(content)), id);
    if (!content.biographyManagedExternally) assert.deepEqual(biographies.get(id), createHouseBiography(content), id);
    assert.deepEqual(record.family.extensions.houseBiographyModule, biographies.get(id), id);
    assert.deepEqual(HOUSE_BIOGRAPHY_DEFAULTS[id]?.biography, biographies.get(id), id);
  }
});

test('sämtliche zwölf alten Graphen, Hausprofile, Titel und Ortsordner bleiben unverändert', () => {
  for (const [id, previous] of initial) {
    const record = records.get(id), family = record.family;
    assert.equal(sha(JSON.stringify(graph(family))), reviewedGraphFingerprint(id, previous.graphFingerprint), id);
    assert.deepEqual(family.document.houseProfile, previous.profile, id);
    assert.deepEqual(record.houseProfile, previous.profile, id);
    assert.deepEqual(record.folderPath, previous.folderPath, id);
    assert.equal(record.title, previous.title, id);
    assert.equal(family.document.title, previous.documentTitle, id);
    assert.equal(family.document.motto || '', previous.motto, id);
  }
  assert.equal(records.get('haus-hyrmgardr').title, 'Clan Hyrmgarthr');
  assert.equal(records.has('haus-hyrmgarthr'), false, 'Die alte Schreibvariante erzeugt keine zweite Akte.');
});

test('Wolfshorn, Bleiddorn und Trachwylls Vennyr-Ursprung bleiben eigenständige unveränderte Akten', () => {
  for (const previous of fixture.protectedRelatedRecords) {
    const family = records.get(previous.id)?.family;
    assert.ok(family, previous.id);
    assert.equal(sha(JSON.stringify(graph(family))), reviewedGraphFingerprint(previous.id, previous.graphFingerprint), previous.id);
    assert.deepEqual(family.document.houseProfile, previous.profile, previous.id);
    assert.equal(family.document.title, previous.title, previous.id);
  }
  assert.equal(records.get('haus-hirschhorn').folderPath[0], 'Cenyr');
  assert.equal(records.get('haus-hirschhorn').family.document.houseProfile.seat, 'Talgarth');
  assert.equal(ids.includes('haus-hirschhorn'), false);
  assert.equal(ids.includes('haus-trachwyll-talfronwyn'), false);
});

test('Hrafnvald ist ein neuer gültiger Huskarlclan Ivarsfels und verwendet Livs bestehende Identität', () => {
  const contract = fixture.newClan, record = records.get(contract.familyId), family = record.family;
  assert.equal(initial.has(record.id), false);
  assert.equal(record.title, contract.title);
  assert.deepEqual(record.folderPath, ['Aldrimar', 'Ivarsheim', 'Ivarsklamm', 'Ivarsfels']);
  const profile = family.document.houseProfile;
  assert.equal(profile.rankId, 'huskarl');
  assert.equal(profile.seat, 'Ivarsfels');
  assert.equal(profile.county, 'Ivarsheim');
  assert.equal(profile.liegeHouseId.replace(/^house-/, 'haus-'), 'haus-wargh');
  assert.equal(profile.liegeHouseName, 'Clan Wargh');
  assert.deepEqual(validateFamily(family).diagnostics.filter(entry => entry.severity === 'error'), []);
  const appearances = family.persons.filter(person => person.worldPersonId === contract.liv.worldPersonId);
  assert.equal(appearances.length, 1);
  const liv = appearances[0];
  for (const field of ['id', 'worldPersonId', 'name', 'sex', 'birth', 'death', 'status']) {
    assert.equal(liv[field], contract.liv[field], `Liv: ${field}`);
  }
  for (const familyId of ['haus-wolfshorn', 'haus-bleiddorn']) {
    const existing = records.get(familyId).family.persons.find(person => person.id === contract.liv.id);
    assert.equal(existing.worldPersonId, liv.worldPersonId, familyId);
    assert.equal(existing.name, 'Liv', familyId);
  }
  assert.equal(new Set(family.persons.map(person => person.worldPersonId)).size, family.persons.length);
  assert.equal(family.persons.some(person => person.name === 'Ragnhild' && person.worldPersonId === liv.worldPersonId), false);
});

test('fünf historische Häuser bleiben erloschen; Kulturkategorien werden nicht als Sitze angezeigt', () => {
  const extinct = [...sources].filter(([, { content }]) => content.extinct).map(([id]) => id).sort();
  assert.deepEqual(extinct, fixture.extinctIds);
  assert.equal(extinct.length, 5);
  for (const id of extinct) {
    const content = sources.get(id).content;
    assert.equal(content.currentHead, '', id);
    assert.deepEqual(content.heirs, [], id);
    assert.equal(content.profile.highestTitle, 'Offen', id);
    assert.doesNotMatch(content.profile.seat, /Aldrimarer|Glaennath|Norrnaigh|jüngst ausgestorben/i, id);
    assert.ok(!content.hierarchy.some(entry => entry.type === 'Sitz'
      && /Aldrimarer|Glaennath|Norrnaigh|jüngst ausgestorben/i.test(entry.name)), id);
    assert.ok(biographies.get(id).stats.some(([label, value]) => label === 'Status' && /ausgestorben/i.test(value)), id);
  }
});

test('alle Iframes, Personenlinks und Gebietsverweise führen zu den bestehenden richtigen IDs', () => {
  for (const [id, { content }] of sources) {
    assert.equal(content.county, 'Ivarsheim', id);
    assert.equal(content.countyLabel, 'Jarltum', id);
    assert.equal(content.territoryId, 'jarltum-ivarsheim', id);
    assert.ok(existsSync(new URL(content.territoryHref, feature)), id);
    const frame = new URL(createHousePageData(content).familyTreeEmbed.src, feature);
    assert.equal(frame.searchParams.get('family'), id);
    assert.equal(frame.searchParams.get('mode'), 'view');
    assert.ok(biographies.get(id).house.documents.some(document =>
      String(document.link || '').includes(`haus=${id}`)), id);
    for (const member of members(content)) {
      if (!member.id) continue;
      const canonical = records.get(member.familyId)?.family.persons.find(person => person.id === member.id);
      assert.ok(canonical, `${id}: ${member.familyId}/${member.id}`);
      assert.equal(member.name, canonical.name, `${id}: ${member.id}`);
      if (member.image) assert.equal(new URL(member.image, feature).href,
        new URL(canonical.portrait, tree).href, `${id}: ${member.id}`);
    }
  }
});

test('zwölf Originalfiguren bleiben bytegleich und alle dreizehn Häuser sind bebildert und in der Galerie', () => {
  assert.equal(fixture.originalAssets.length, 12);
  for (const original of fixture.originalAssets) {
    assert.equal(sha(readFileSync(new URL(original.path, root))), original.sha256, original.id);
    if (original.primary) {
      const content = sources.get(original.id).content;
      assert.equal(sha(readFileSync(new URL(content.images.scene, feature))), original.sha256, original.id);
    }
  }
  for (const [id, { content }] of sources) {
    for (const image of Object.values(createHousePageData(content).images)) {
      if (!image.src) continue;
      assert.doesNotMatch(image.src, /^(?:https?:|data:|file:)/i, id);
      assert.ok(existsSync(new URL(image.src, feature)), `${id}: ${image.src}`);
    }
    assert.ok(existsSync(new URL(biographies.get(id).image, tree)), id);
    const hash = sha(readFileSync(new URL(content.images.scene, feature)));
    const illustration = gallery.illustrations.find(entry => entry.sha256 === hash && entry.houseIds.includes(id));
    const house = gallery.houses.find(entry => entry.id === id);
    assert.ok(illustration, id);
    assert.ok(house?.illustrationIds.includes(illustration.id), id);
  }
});

test('Militärstatistiken und Vorlagenplatzhalter werden nicht in Hausprofile oder Bio übernommen', () => {
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|vierzig|fünfzig|hundert|tausend)';
  const amount = new RegExp(`\\b${quantity}\\s+(?:Mann|Huskarle?n?|Hirdmännern?|Walküren|(?:Waffen)?knecht(?:e|en)?|Stadtwach(?:e|en)|Soldat(?:en)?|Kriegern?|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  for (const [id, { content }] of sources) {
    const page = createHousePageData(content), bio = biographies.get(id);
    assert.deepEqual(page.hiddenProfileGroups, ['military'], id);
    for (const field of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(page.profile[field], '', id);
    assert.ok(!bio.stats.some(([label]) => /Truppen|Mannstärke|Waffenknechte|Stadtwache|Flotte/i.test(label)), id);
    const prose = strings([content.sections, content.biographySummary, content.figures, content.trivia,
      bio.description, bio.house.biographyText, bio.house.historyText, bio.house.extraSections]).join('\n');
    assert.doesNotMatch(prose, amount, id);
    assert.doesNotMatch(prose, /Titel hier einfügen|Dialog von Figur|Beschreibung \.\.\.|unter undefined/i, id);
  }
});

test('Trachwylls bestehender Bio-Standard wird nur mit ausdrücklicher redaktioneller Übernahme ersetzt', () => {
  const previous = fixture.records.filter(record => record.hadBiography);
  assert.deepEqual(previous.map(record => record.id), ['haus-trachwyll']);
  for (const old of previous) {
    const content = sources.get(old.id).content;
    assert.ok(content.biographyManagedExternally
      || content.biographyPreviousDefaultFingerprints.includes(old.previousDefaultFingerprint), old.id);
  }
});

test('Upgrades erhalten eigene Hausbios, bewusste Löschungen und persönliche Graphbearbeitungen', () => {
  for (const [id] of sources) {
    const registered = records.get(id).family, local = structuredClone(registered), bio = biographies.get(id);
    local.extensions.sourceRevision = initial.get(id)?.sourceRevision ?? Math.max(0, registered.extensions.sourceRevision - 1);
    delete local.extensions.houseBiographyModule;
    if (local.persons.length) {
      local.persons[0].name = 'Eigene Personenbearbeitung';
      local.persons[0].notes = 'Eigene unveränderte Notiz';
    }
    const expectedGraph = normalizedGraph(normalizeFamily(local));
    const upgraded = resolveRegisteredFamilyUpgrade(registered, local);
    assert.deepEqual(normalizedGraph(upgraded), expectedGraph, id);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, bio, id);
    const ownBio = structuredClone(bio);
    ownBio.description = 'Eigene Hausgeschichte';
    ownBio.house.biographyText = 'Eigener ausführlicher Text';
    ownBio.commentSequence = [{ text: 'Eigene Notiz' }];
    for (const value of [null, ownBio]) {
      local.extensions.houseBiographyModule = value;
      const result = resolveRegisteredFamilyUpgrade(registered, local);
      assert.deepEqual(result.extensions.houseBiographyModule, value, id);
      assert.deepEqual(normalizedGraph(result), expectedGraph, id);
    }
  }
});
