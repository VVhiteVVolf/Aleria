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
import { reviewedBiographySourceRevision, reviewedContentVersion,
  reviewedGraphFingerprint } from './house-lore-reviewed-expectations.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const tree = new URL('Stammbäume/', root);
const json = url => JSON.parse(readFileSync(url, 'utf8'));
const fixture = json(new URL('fixtures/kraehenmoor-initial-review.json', import.meta.url));
const initial = new Map(fixture.records.map(record => [record.id, record]));
const ids = [...initial.keys()].sort();
const records = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const sources = new Map(await Promise.all(fixture.records.map(async record => {
  const url = new URL(record.contentPath, root);
  const { HOUSE_CONTENT: content } = await import(url);
  return [record.id, { content, url }];
})));
const biographies = new Map(await Promise.all([...sources].map(async ([id, { url }]) => {
  const { HOUSE_BIOGRAPHY: biography } = await import(new URL('haus.biography.mjs', url));
  return [id, biography];
})));
const context = vm.createContext({ window: {} });
vm.runInContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), context);
const registeredPages = JSON.parse(JSON.stringify(context.window.HAEUSER_REGISTRY));
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

function generatedPage(url) {
  const target = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(new URL('haus.data.js', url), 'utf8'), target);
  return plain(target.window.HAEUSER_DATA);
}

test('alle 26 öffentlichen Krähenmoor-Familien besitzen registrierte Hausseiten und Hausbios', () => {
  assert.equal(fixture.publicOnly, true);
  assert.equal(ids.length, 26);
  const scoped = FAMILY_REGISTRY.filter(record => record.listing === 'listed' && record.status === 'active'
    && record.folderPath?.[0] === 'Aldrimar' && record.folderPath?.[1] === 'Krähenmoor')
    .map(record => record.id).sort();
  assert.deepEqual(scoped, ids);
  for (const [id, { content, url }] of sources) {
    const record = records.get(id), page = registeredPages.find(entry => entry.id === id);
    assert.equal(content.id, id);
    assert.equal(content.name, record.title, id);
    assert.equal(content.registerPage, true, id);
    assert.equal(content.page, 'haus.html', id);
    assert.equal(page?.status, 'active', id);
    assert.equal(new URL(page.data, feature).pathname, new URL('haus.data.js', url).pathname, id);
    assert.equal(content.contentVersion, reviewedContentVersion(id, '20261103-kraehenmoor-v1'), id);
    assert.equal(content.biographySourceRevision, reviewedBiographySourceRevision(id, initial.get(id).sourceRevision + 1), id);
    assert.deepEqual(generatedPage(url), plain(createHousePageData(content)), id);
    assert.deepEqual(biographies.get(id), createHouseBiography(content), id);
    assert.deepEqual(record.family.extensions.houseBiographyModule, biographies.get(id), id);
    assert.deepEqual(HOUSE_BIOGRAPHY_DEFAULTS[id]?.biography, biographies.get(id), id);
  }
});

test('sämtliche Graphen, Personen, Ränge, Hausprofile, Titel und Ortsordner bleiben unverändert', () => {
  for (const [id, previous] of initial) {
    const record = records.get(id), family = record.family;
    assert.equal(sha(JSON.stringify(graph(family))), reviewedGraphFingerprint(id, previous.graphFingerprint), id);
    assert.deepEqual(record.houseProfile, previous.profile, id);
    assert.deepEqual(family.document.houseProfile, previous.profile, id);
    assert.deepEqual(record.folderPath, previous.folderPath, id);
    assert.equal(record.title, previous.title, id);
    assert.equal(family.document.title, previous.documentTitle, id);
    assert.equal(family.document.motto || '', previous.motto, id);
  }
});

test('Krähenmoor und die kanonischen Alias-IDs führen auf die vorhandenen Familienakten', () => {
  for (const [id, { content }] of sources) {
    assert.equal(content.county, 'Krähenmoor', id);
    assert.equal(content.countyLabel, 'Jarltum', id);
    assert.equal(content.territoryId, 'jarltum-kraehenmoor', id);
    assert.ok(existsSync(new URL(content.territoryHref, feature)), id);
    assert.match(decodeURIComponent(content.territoryHref), /Jarltum Krähenmoor\/Jarltum Krähenmoor\.html$/, id);
    assert.ok(content.hierarchy.some(entry => entry.type === 'Jarltum' && /Krähenmoor/.test(entry.name)), id);
    const frame = new URL(createHousePageData(content).familyTreeEmbed.src, feature);
    assert.equal(frame.searchParams.get('family'), id);
    assert.equal(frame.searchParams.get('mode'), 'view');
    assert.ok(biographies.get(id).house.documents.some(document => String(document.link || '').includes(`haus=${id}`)), id);
  }
  assert.equal(records.get('haus-varangr').houseProfile.seat, 'Moortal');
  assert.equal(initial.get('haus-jaernblod').inputSlug, 'jarnblod');
  assert.equal(initial.get('haus-mac-morfhia').inputSlug, 'morfhia');
  assert.equal(initial.get('haus-mac-corcaigh').inputSlug, 'corcaigh');
  for (const alias of ['haus-jarnblod', 'haus-morfhia', 'haus-corcaigh']) {
    assert.equal(ids.includes(alias), false);
    assert.equal(registeredPages.some(page => page.id === alias), false);
  }
  assert.equal(ids.includes('haus-kummerherz'), false);
  assert.equal(records.get('haus-kummerherz').folderPath[1], 'Schwarzfenn');
});

test('alle fünf historischen Clans bleiben erloschen; Hjerte und Järnblod behalten ihren Thane-Rang', () => {
  const extinctIds = [...sources].filter(([, { content }]) => content.extinct).map(([id]) => id).sort();
  assert.deepEqual(extinctIds, fixture.extinctIds);
  assert.deepEqual(extinctIds, ['haus-hjerte', 'haus-jaernblod', 'haus-kaldhrafn', 'haus-mac-corcaigh', 'haus-mac-morfhia']);
  const category = /Norrnaigh|Glaennath|Ausgestorbene Clans/i;
  for (const id of extinctIds) {
    const content = sources.get(id).content;
    assert.equal(content.currentHead, '', id);
    assert.equal(content.firstHeir, '', id);
    assert.deepEqual(content.heirs, [], id);
    assert.doesNotMatch(content.profile.seat, category, id);
    assert.ok(!content.hierarchy.some(entry => entry.type === 'Sitz' && category.test(entry.name)), id);
    assert.ok(content.hierarchy.some(entry => entry.type === 'Kultur' && /Norrnaigh|Glaennath/.test(entry.name)), id);
    assert.ok(biographies.get(id).stats.some(([label, value]) => label === 'Status' && /ausgestorben/i.test(value)), id);
  }
  for (const id of ['haus-hjerte', 'haus-jaernblod']) assert.equal(sources.get(id).content.profile.highestTitle, 'Thane', id);
  for (const id of ['haus-kaldhrafn', 'haus-mac-morfhia', 'haus-mac-corcaigh']) {
    assert.equal(sources.get(id).content.profile.highestTitle, 'Offen', id);
  }
  assert.equal(sources.get('haus-jaernblod').content.profile.seat, 'Silberquell');
  assert.equal(sources.get('haus-mac-morfhia').content.profile.seat, 'Silberquell');
  assert.equal(sources.get('haus-mac-corcaigh').content.profile.seat, 'Moortal');
});

test('Erbfolge folgt den belegten Rangtiteln; Sindre und Platzhalter werden keine Clanoberhäupter', () => {
  for (const [id, ordered] of [
    ['haus-schattenherz', ['isbrand-schattenherz', 'thjald-schattenherz']],
    ['haus-kaltherz', ['njvar-kaltherz', 'hjalmar-kaltherz', 'fjori-kaltherz']],
    ['haus-feuerherz', ['rolfur-feuerherz', 'kjalmar-feuerherz', 'frodi-feuerherz']],
    ['haus-schwarzblut', ['svanur-schwarzblut']]
  ]) {
    const content = sources.get(id).content;
    assert.deepEqual(content.heirs.map(person => person.id), ordered, id);
    assert.equal(content.firstHeir, records.get(id).family.persons.find(person => person.id === ordered[0]).name, id);
    assert.match(records.get(id).family.persons.find(person => person.id === ordered[0]).title, /Erster Erbe/, id);
  }
  for (const previous of fixture.records.filter(record => !record.inputSlug)) {
    const content = sources.get(previous.id).content;
    assert.equal(content.currentHead, '', previous.id);
    assert.equal(content.firstHeir, '', previous.id);
    assert.deepEqual(content.heirs, [], previous.id);
  }
  const schwarzstolz = sources.get('haus-schwarzstolz').content;
  assert.equal(records.get('haus-schwarzstolz').houseProfile.rankId, 'huskarl');
  assert.equal(records.get('haus-schwarzstolz').family.persons.length, 1);
  assert.equal(records.get('haus-schwarzstolz').family.persons[0].id, 'sindre-brandstolz');
  assert.match(records.get('haus-schwarzstolz').family.persons[0].title, /Bootsmann/);
  assert.ok(!schwarzstolz.heads.some(person => person.id === 'sindre-brandstolz'));
  const goldzunge = sources.get('haus-goldzunge').content;
  assert.equal(records.get('haus-goldzunge').houseProfile.rankId, 'commoner');
  assert.equal(goldzunge.profile.highestTitle, 'Bürgerlich');
  assert.equal(goldzunge.liege, '');
  assert.equal(goldzunge.profile.liege, '');
  const goldglanz = sources.get('haus-goldglanz').content;
  assert.equal(records.get('haus-goldglanz').houseProfile.liegeHouseId, 'house-blutstahl');
  for (const display of [goldglanz.liege, goldglanz.profile.liege,
    biographies.get('haus-goldglanz').stats.find(([label]) => label === 'Lehnsherr')?.[1]]) {
    assert.match(display, /Clan Blutstahl/);
    assert.match(display, /Clan Silberblut/);
  }
});

test('Angehörigenkarten verweisen auf echte Namen und ihre vorhandenen Personenportraits', () => {
  for (const [id, { content }] of sources) {
    for (const member of members(content)) {
      if (!member.id) continue;
      const canonical = records.get(member.familyId)?.family.persons.find(person => person.id === member.id);
      assert.ok(canonical, `${id}: ${member.familyId}/${member.id}`);
      assert.equal(member.name, canonical.name, `${id}: ${member.id}`);
      assert.doesNotMatch(member.name, /\?\?\?|Platzhalter|^Unbekannt/i, `${id}: ${member.id}`);
      if (member.image) {
        assert.ok(canonical.portrait, `${id}: ${member.id}`);
        assert.equal(new URL(member.image, feature).href, new URL(canonical.portrait, tree).href, `${id}: ${member.id}`);
      }
    }
  }
});

test('13 Originale bleiben bytegleich und alle 26 Clans erhalten lokale Galerieabbildungen', () => {
  assert.equal(fixture.originalAssets.length, 13);
  assert.equal(fixture.generatedImageIds.length, 13);
  assert.equal(fixture.originalAssets.some(asset => asset.id === 'haus-jaernblod'), false);
  assert.ok(fixture.generatedImageIds.includes('haus-jaernblod'));
  assert.deepEqual([...fixture.originalAssets.map(asset => asset.id), ...fixture.generatedImageIds].sort(), ids);
  for (const original of fixture.originalAssets) {
    assert.equal(sha(readFileSync(new URL(original.path, root))), original.sha256, original.id);
    assert.equal(sha(readFileSync(new URL(sources.get(original.id).content.images.scene, feature))), original.sha256, original.id);
  }
  for (const [id, { content }] of sources) {
    const scene = readFileSync(new URL(content.images.scene, feature));
    assert.equal(scene.subarray(1, 4).toString('ascii'), 'PNG', id);
    const sceneHash = sha(scene), house = gallery.houses.find(entry => entry.id === id);
    const illustration = gallery.illustrations.find(entry => entry.sha256 === sceneHash && entry.houseIds.includes(id));
    assert.ok(illustration, id);
    assert.ok(house?.illustrationIds.includes(illustration.id), id);
    assert.equal(sha(readFileSync(new URL(illustration.image, root))), sceneHash, id);
    for (const image of Object.values(createHousePageData(content).images)) {
      if (!image.src) continue;
      assert.doesNotMatch(image.src, /^(?:https?:|data:|file:)/i, id);
      assert.ok(existsSync(new URL(image.src, feature)), `${id}: ${image.src}`);
    }
    assert.ok(existsSync(new URL(biographies.get(id).image, tree)), id);
    assert.equal(sha(readFileSync(new URL(biographies.get(id).image, tree))), sceneHash, id);
  }
});

test('Militärstatistiken und unbearbeitete Vorlagenplatzhalter fehlen in Profil und Bio', () => {
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|vierzig|fünfzig|hundert|tausend)';
  const amount = new RegExp(`\\b${quantity}\\s+(?:Mann|Huskarle?n?|Hirdmännern?|Walküren|(?:Waffen)?knecht(?:e|en)?|Stadtwach(?:e|en)|Soldat(?:en)?|Kriegern?|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  for (const [id, { content }] of sources) {
    const page = createHousePageData(content), biography = biographies.get(id);
    assert.deepEqual(page.hiddenProfileGroups, ['military'], id);
    for (const field of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(page.profile[field], '', id);
    assert.ok(!biography.stats.some(([label]) => /Truppen|Mannstärke|Waffenknechte|Stadtwache|Flotte/i.test(label)), id);
    const prose = strings([content.sections, content.biographySummary, content.figures, content.trivia,
      biography.description, biography.house.biographyText, biography.house.historyText, biography.house.extraSections]).join('\n');
    assert.doesNotMatch(prose, amount, id);
    assert.doesNotMatch(prose, /Titel hier einfügen|Dialog von Figur|Beschreibung \.\.\.|unter undefined/i, id);
  }
});

test('Bio-Upgrades erhalten eigene Texte, bewusste Löschungen und Graphbearbeitungen wiederholungsfest', () => {
  for (const [id] of sources) {
    const registered = records.get(id).family, local = structuredClone(registered), biography = biographies.get(id);
    local.extensions.sourceRevision = initial.get(id).sourceRevision;
    delete local.extensions.houseBiographyModule;
    if (local.persons.length) {
      local.persons[0].name = 'Eigene Personenbearbeitung';
      local.persons[0].notes = 'Eigene unveränderte Notiz';
    }
    const expected = normalizedGraph(normalizeFamily(local));
    const upgraded = resolveRegisteredFamilyUpgrade(registered, local);
    assert.deepEqual(normalizedGraph(upgraded), expected, id);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, biography, id);
    assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, upgraded), upgraded, id);
    const custom = structuredClone(biography);
    custom.description = 'Eigene Hausgeschichte';
    custom.house.biographyText = 'Eigener ausführlicher Text';
    custom.commentSequence = [{ text: 'Eigene Notiz' }];
    for (const own of [null, custom]) {
      local.extensions.houseBiographyModule = own;
      const result = resolveRegisteredFamilyUpgrade(registered, local);
      assert.deepEqual(result.extensions.houseBiographyModule, own, id);
      assert.deepEqual(normalizedGraph(result), expected, id);
      assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, result), result, id);
    }
  }
});

test('14 Quellarchive bleiben unverändert; Stammbäume werden allein über kanonische Iframes eingebunden', () => {
  assert.ok(fixture.records.every(record => !record.hadBiography));
  assert.equal(fixture.records.filter(record => record.sourceArchiveSha256).length, 14);
  for (const previous of fixture.records) {
    const { url, content } = sources.get(previous.id);
    if (previous.sourceArchiveSha256) {
      const archive = ['animexx-source-2026-11-03.html', 'animexx-original.html']
        .map(file => new URL(file, url)).find(file => existsSync(file));
      assert.ok(archive, previous.id);
      assert.equal(sha(readFileSync(archive)), previous.sourceArchiveSha256, previous.id);
    }
    for (const key of graphKeys) assert.equal(Object.hasOwn(content, key), false, `${previous.id}: keine eingebetteten Graphdaten`);
    assert.doesNotMatch(content.sections.familyTree || '', /<img|https?:\/\/|data:image/i, previous.id);
  }
});
