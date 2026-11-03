import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { HOUSE_BIOGRAPHY_DEFAULTS } from '../../Stammbäume/assets/js/data/house-biographies.registry.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { createHouseBiography, createHousePageData } from '../modules/house-content/house-content-outputs.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const tree = new URL('Stammbäume/', root);
const readJson = url => JSON.parse(readFileSync(url, 'utf8'));
const fixture = readJson(new URL('fixtures/roriksheim-initial-review.json', import.meta.url));
const initial = new Map(fixture.records.map(record => [record.id, record]));
const ids = [...initial.keys()].sort();
const extinctIds = [...fixture.extinctIds].sort();
const records = new Map(FAMILY_REGISTRY.filter(record => initial.has(record.id)).map(record => [record.id, record]));
const sources = new Map(await Promise.all(fixture.records.map(async baseline => {
  const url = new URL(baseline.contentPath, root);
  const { HOUSE_CONTENT: content } = await import(url);
  return [baseline.id, { content, url }];
})));
const exportedBios = new Map(await Promise.all([...sources].map(async ([id, { url }]) => {
  const { HOUSE_BIOGRAPHY: biography } = await import(new URL('haus.biography.mjs', url));
  return [id, biography];
})));
const registryContext = vm.createContext({ window: {} });
vm.runInContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
const pageRegistry = JSON.parse(JSON.stringify(registryContext.window.HAEUSER_REGISTRY));
const gallery = readJson(new URL('Gallerien/krieger/data/catalog.json', root));
const sha = value => createHash('sha256').update(value).digest('hex');
const plain = value => JSON.parse(JSON.stringify(value));
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const graph = family => Object.fromEntries(graphKeys.map(key => [key, family[key] || []]));
const normalizedGraph = family => Object.fromEntries(graphKeys.map(key => [key,
  (family[key] || []).map(entry => ({ ...entry, extensions: entry.extensions || {} }))]));
const courtEntries = content => [content.founder, ...(content.heads || []), ...(content.heirs || []),
  ...(content.offices || []), ...(content.figures || [])].filter(Boolean);
const strings = value => Array.isArray(value) ? value.flatMap(strings)
  : value && typeof value === 'object' ? Object.values(value).flatMap(strings)
    : typeof value === 'string' ? [value] : [];

function readGeneratedPage(sourceUrl) {
  const context = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(new URL('haus.data.js', sourceUrl), 'utf8'), context);
  return plain(context.window.HAEUSER_DATA);
}

// The existing Eisenjungfer text is preserved. Only the hero-image display and
// the added link to this house's page may differ from the reviewed old default.
function protectedBiography(biography, id) {
  const result = structuredClone(biography);
  delete result.image;
  delete result.imageSquare;
  delete result.imageTall;
  if (result.house?.documents) {
    result.house.documents = result.house.documents.filter(document =>
      !String(document.link || '').includes(`haus=${id}`));
  }
  return result;
}

test('genau die 33 öffentlich geprüften Roriksheim-Familien besitzen aktive Hausseiten und Hausbios', () => {
  assert.equal(fixture.publicOnly, true);
  assert.equal(ids.length, fixture.expectedCount);
  assert.equal(ids.length, 33);
  const registeredIds = FAMILY_REGISTRY.filter(record => record.folderPath?.[0] === 'Aldrimar'
    && record.folderPath?.[1] === 'Roriksheim').map(record => record.id).sort();
  assert.deepEqual(registeredIds, ids);
  assert.deepEqual([...sources.keys()].sort(), ids);
  for (const id of ids) {
    const { content, url } = sources.get(id);
    assert.equal(content.id, id);
    assert.equal(content.registerPage, true, id);
    const entry = pageRegistry.find(page => page.id === id);
    assert.ok(entry, id);
    assert.equal(entry.status, 'active', id);
    assert.equal(entry.name, initial.get(id).title, id);
    assert.equal(new URL(entry.data, feature).pathname, new URL('haus.data.js', url).pathname, id);
    assert.ok(exportedBios.get(id)?.house, id);
    assert.deepEqual(readGeneratedPage(url), plain(createHousePageData(content)), id);
    if (!content.biographyManagedExternally) {
      assert.deepEqual(exportedBios.get(id), createHouseBiography(content), id);
    }
    assert.deepEqual(records.get(id).family.extensions.houseBiographyModule, exportedBios.get(id), id);
    assert.deepEqual(HOUSE_BIOGRAPHY_DEFAULTS[id]?.biography, exportedBios.get(id), id);
  }
});

test('alle Graphen, Personen, Hausprofile, Ortsordner und bestehenden Titel bleiben unverändert', () => {
  for (const [id, record] of records) {
    const baseline = initial.get(id), family = record.family;
    assert.equal(sha(JSON.stringify(graph(family))), baseline.graphFingerprint, id);
    assert.deepEqual(family.document.houseProfile, baseline.profile, id);
    assert.deepEqual(record.houseProfile, baseline.profile, id);
    assert.deepEqual(record.folderPath, baseline.folderPath, id);
    assert.equal(record.title, baseline.title, id);
    assert.equal(family.document.title, baseline.documentTitle, id);
    assert.equal(family.document.motto || '', baseline.motto, id);
    assert.equal(sha(JSON.stringify({ record: record.title, document: family.document.title })),
      baseline.titleFingerprint, id);
  }
});

test('fünf historische Clans bleiben ausgestorben und erhalten keine gegenwärtigen Amtsinhaber', () => {
  assert.equal(extinctIds.length, 5);
  assert.deepEqual(extinctIds, ['haus-bjornskar', 'haus-fiadhrach', 'haus-tiogar', 'haus-ulvasar', 'haus-vanir']);
  assert.deepEqual([...sources.values()].filter(({ content }) => content.extinct).map(({ content }) => content.id).sort(), extinctIds);
  for (const id of extinctIds) {
    const content = sources.get(id).content;
    assert.equal(initial.get(id).profile.rankId, 'unknown', id);
    assert.equal(content.profile.highestTitle, 'Offen', id);
    assert.equal(content.currentHead, '', id);
    assert.deepEqual(content.heirs, [], id);
    assert.ok(exportedBios.get(id).stats.some(([label, value]) => label === 'Status' && /ausgestorben/i.test(value)), id);
  }
  assert.notEqual(sources.get('haus-vanir').content.id, sources.get('haus-vangandr').content.id);
  assert.equal(sources.get('haus-vangandr').content.extinct, false);
});

test('Namen, Ränge und Rückverweise folgen der vorhandenen Roriksheim-Struktur', () => {
  const expectedRanks = { jarl: 'Jarl', thane: 'Thane', hesire: 'Hesire', huskarl: 'Huskarl',
    commoner: 'Bürgerlich', knight: 'Ritterherr', unknown: 'Offen' };
  for (const [id, { content }] of sources) {
    const baseline = initial.get(id);
    assert.equal(content.name, baseline.title, id);
    assert.equal(content.county, 'Roriksheim', id);
    assert.equal(content.countyLabel, 'Jarltum', id);
    assert.equal(content.profile.highestTitle, expectedRanks[baseline.profile.rankId], id);
    assert.equal(content.type, baseline.profile.rankId === 'commoner' ? 'Bürgerliches Haus' : 'Clan', id);
    assert.equal(content.territoryId, 'jarltum-roriksheim', id);
    assert.ok(existsSync(new URL(content.territoryHref, feature)), id);
    const page = createHousePageData(content);
    const frame = new URL(page.familyTreeEmbed.src, feature);
    assert.equal(frame.searchParams.get('family'), id);
    assert.equal(frame.searchParams.get('mode'), 'view');
    const backLink = exportedBios.get(id).house.documents.find(document =>
      String(document.link || '').includes(`haus=${id}`));
    assert.ok(backLink, id);
    assert.equal(new URL(backLink.link, tree).searchParams.get('haus'), id);
  }
  assert.equal(initial.get('haus-wolfshorn').profile.rankId, 'knight');
  assert.equal(sources.get('haus-wolfshorn').content.currentHead, 'Bjoern Wolfshorn');
  assert.match(sources.get('haus-wolfshorn').content.sections.history, /Bleiddorn/);
});

test('Angehörigenkarten verweisen auf reale Personen und deren vorhandene Portraits', () => {
  const allRecords = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
  for (const [id, { content }] of sources) {
    for (const member of courtEntries(content)) {
      if (!member.id) continue;
      const canonical = allRecords.get(member.familyId)?.family.persons.find(person => person.id === member.id);
      assert.ok(canonical, `${id}: ${member.familyId}/${member.id}`);
      assert.equal(member.name, canonical.name, `${id}: ${member.id}`);
      if (member.image) {
        assert.ok(canonical.portrait, `${id}: ${member.id}`);
        assert.equal(new URL(member.image, feature).href, new URL(canonical.portrait, tree).href,
          `${id}: ${member.id}`);
      }
    }
    assert.doesNotMatch(strings([content.sections, content.figures, content.trivia]).join('\n'),
      /Titel hier einfügen|Dialog von Figur|Beschreibung \.\.\.|tumblr_otwjgn|unter undefined/i, id);
  }
});

test('sämtliche lokalen Bildpfade existieren und jedes Haus besitzt eine passende Galerieabbildung', () => {
  for (const [id, { content }] of sources) {
    const page = createHousePageData(content), biography = exportedBios.get(id);
    for (const image of Object.values(page.images)) {
      if (!image.src) continue;
      assert.doesNotMatch(image.src, /^(?:https?:|data:|file:)/i, id);
      assert.ok(existsSync(new URL(image.src, feature)), `${id}: ${image.src}`);
    }
    assert.ok(biography.image, id);
    assert.ok(existsSync(new URL(biography.image, tree)), id);
    assert.notEqual(new URL(biography.image, tree).href, new URL(page.images['haus-wappen'].src, feature).href, id);
    const picture = new URL(content.images.scene, feature);
    const digest = sha(readFileSync(picture));
    const house = gallery.houses.find(entry => entry.id === id);
    assert.ok(house?.illustrationIds.length > 0, id);
    const illustration = gallery.illustrations.find(entry => entry.sha256 === digest && entry.houseIds.includes(id));
    assert.ok(illustration, id);
    assert.ok(house.illustrationIds.includes(illustration.id), id);
  }
  for (const original of fixture.originalAssets) {
    assert.equal(sha(readFileSync(new URL(original.path, root))), original.sha256,
      `${original.id}: Original bleibt unverändert`);
    if (original.primary) {
      const content = sources.get(original.id).content;
      assert.equal(sha(readFileSync(new URL(content.images.scene, feature))), original.sha256, original.id);
    }
  }
});

test('Militärstatistiken fehlen in Profilen, redaktionellen Texten und Hausbios', () => {
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|vierzig|fünfzig|hundert|tausend)';
  const militaryAmount = new RegExp(`\\b${quantity}\\s+(?:Mann|Huskarle?n?|Hirdmännern?|Walküren|(?:Waffen)?knecht(?:e|en)?|Stadtwach(?:e|en)|Soldat(?:en)?|Kriegern?|Galeer(?:e|en)|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  for (const [id, { content }] of sources) {
    const page = createHousePageData(content), biography = exportedBios.get(id);
    assert.deepEqual(page.hiddenProfileGroups, ['military'], id);
    for (const field of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(page.profile[field], '', `${id}: ${field}`);
    assert.ok(!biography.stats.some(([label]) => /Truppen|Mannstärke|Waffenknechte|Stadtwache|Flotte/i.test(label)), id);
    const prose = strings([content.sections, content.biographySummary, content.figures, content.trivia,
      biography.description, biography.house.biographyText, biography.house.historyText, biography.house.extraSections]).join('\n');
    assert.doesNotMatch(prose, militaryAmount, id);
    assert.doesNotMatch(prose, /(?:Truppenstärke|Gesamtaufgebot|Flottenstärke|Mannstärke)\s*[:=]?\s*\d/iu, id);
  }
});

test('Eisenjungfers bisherige ausführliche Bio bleibt bewusst erhalten', () => {
  const oldBios = fixture.records.filter(record => record.hadBiography);
  assert.deepEqual(oldBios.map(record => record.id), ['haus-eisenjungfer']);
  for (const previous of oldBios) {
    const { content } = sources.get(previous.id);
    assert.equal(content.biographyManagedExternally, true);
    assert.ok(content.biographyPreviousDefaultFingerprints.includes(previous.previousDefaultFingerprint));
    assert.equal(sha(JSON.stringify(protectedBiography(exportedBios.get(previous.id), previous.id))),
      previous.protectedBiographyFingerprint);
  }
});

test('Bio-Upgrades erhalten eigene Personenbearbeitungen, eigene Hausbios und absichtlich entfernte Bios', () => {
  for (const [id, record] of records) {
    const registered = record.family, local = structuredClone(registered), expectedBio = exportedBios.get(id);
    local.extensions.sourceRevision = initial.get(id).sourceRevision;
    delete local.extensions.houseBiographyModule;
    if (local.persons.length) {
      local.persons[0].name = 'Eigene Personenbearbeitung';
      local.persons[0].notes = 'Eigene unveränderte Notiz';
    }
    const expected = normalizeFamily(local);
    const upgraded = resolveRegisteredFamilyUpgrade(registered, local);
    assert.deepEqual(normalizedGraph(upgraded), normalizedGraph(expected), id);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, expectedBio, id);
    const custom = structuredClone(expectedBio);
    custom.description = 'Eigene Hausgeschichte';
    custom.house.biographyText = 'Eigener ausführlicher Text';
    custom.commentSequence = [{ text: 'Eigene Notiz' }];
    for (const own of [null, custom]) {
      local.extensions.houseBiographyModule = own;
      const result = resolveRegisteredFamilyUpgrade(registered, local);
      assert.deepEqual(result.extensions.houseBiographyModule, own, id);
      assert.deepEqual(normalizedGraph(result), normalizedGraph(expected), id);
    }
  }
});

test('die 18 gelieferten Vorlagen bleiben unveränderte Archive ohne genealogischen Import', () => {
  const supplied = fixture.records.filter(record => record.hasSuppliedSource);
  assert.equal(supplied.length, 18);
  for (const previous of supplied) {
    const { url } = sources.get(previous.id);
    const manifest = readJson(new URL('source-manifest.json', url));
    const bytes = readFileSync(new URL('animexx-source-2026-11-03.html', url));
    assert.equal(sha(bytes), manifest.source.sha256, previous.id);
    assert.equal(manifest.genealogy.imported, false, previous.id);
    assert.equal(manifest.genealogy.familyId, previous.id, previous.id);
    assert.equal(manifest.militaryStatistics.imported, false, previous.id);
  }
});
