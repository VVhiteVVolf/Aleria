import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { houseRankLabel } from '../../Kontinente/modules/territory-directory/house-rank.mjs';
import { HOUSE_RANKS } from '../modules/house-content/house-ranks.generated.mjs';
import { createHouseBiography, createHousePageData } from '../modules/house-content/house-content-outputs.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';
import { collectHouses } from '../../Gallerien/krieger/scripts/house-catalog.mjs';
import { collectIllustrations } from '../../Gallerien/krieger/scripts/illustration-catalog.mjs';
import { mergeScopedCatalog } from '../../Gallerien/krieger/scripts/scoped-catalog.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const treeRoot = new URL('Stammbäume/', root);
const diagnosticRoot = new URL('diagnostics/klaueninsel-house-pages-20261103/', root);
const readJson = url => JSON.parse(readFileSync(url, 'utf8'));
// Registered public baselines taken before this batch; no private fixtures.
const before = readJson(new URL('before.json', diagnosticRoot));
const originBefore = readJson(new URL('origin-before.json', diagnosticRoot));
const baselineById = new Map(before.map(record => [record.id, record]));
const expectedIds = before.map(record => record.id).sort();
const originalImageIds = new Set(['haus-arth', 'haus-pawen', 'haus-crafanc', 'haus-unigol',
  'haus-morthwyll', 'haus-eirth', 'haus-selwyn', 'haus-diafol-talgarth', 'haus-dianc-aberdail',
  'haus-arfordir-aberdail', 'haus-dyfrgi-caer-cryftlawd', 'haus-walwrs-caer-deheuol',
  'haus-cwningod', 'haus-ard-follmhar', 'haus-blodyn-talgarth', 'haus-blodyn-aberdail']);
const lowerIds = expectedIds.filter(id => !originalImageIds.has(id));
const unresolvedRankIds = ['haus-gwyllt', 'haus-bevan', 'haus-arian', 'haus-hirschhorn', 'haus-parry'];
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
  return entry.isDirectory() ? walk(url) : [url];
});
const sourceModules = walk(new URL('Estryll/Cenyr/Klaueninsel/', feature))
  .filter(url => url.pathname.endsWith('/haus.content.mjs'));
const sources = new Map(await Promise.all(sourceModules.map(async url => {
  const { HOUSE_CONTENT: content } = await import(url);
  return [content.id, { content, url }];
})));
const allRecords = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const records = new Map(FAMILY_REGISTRY.filter(record => record.folderPath?.[0] === 'Cenyr'
  && record.folderPath?.[1] === 'Klaueninsel').map(record => [record.id, record]));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const graph = family => Object.fromEntries(graphKeys.map(key => [key, family[key]]));
const normalizedGraph = family => Object.fromEntries(graphKeys.map(key => [key,
  family[key].map(entry => ({ ...entry, extensions: entry.extensions || {} }))]));
const courtEntries = content => [content.founder, ...(content.heads || []), ...(content.heirs || []),
  ...(content.offices || []), ...(content.figures || [])].filter(Boolean);
const prose = content => JSON.stringify([content.sections, content.biographySummary,
  content.currentHead, content.firstHeir, content.trivia, courtEntries(content)]);
const registryContext = { window: {} };
vm.runInNewContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
const registry = registryContext.window.HaeuserRegistry;
const relativeSitePath = url => decodeURIComponent(url.pathname).slice(decodeURIComponent(root.pathname).length);

test('Cwingods genaue alte Standardbio wird ersetzt, ihre bearbeitete Fassung bleibt erhalten', () => {
  const registered = records.get('haus-cwningod').family;
  const previous = readJson(new URL('cwningod-previous-default.json', diagnosticRoot));
  const local = structuredClone(registered);
  local.extensions.sourceRevision = baselineById.get('haus-cwningod').sourceRevision;
  local.extensions.houseBiographyModule = previous;
  const upgraded = resolveRegisteredFamilyUpgrade(registered, local);
  assert.deepEqual(upgraded.extensions.houseBiographyModule, createHouseBiography(sources.get('haus-cwningod').content));
  const edited = structuredClone(previous);
  edited.description = 'Eigene überarbeitete Hausgeschichte';
  edited.house.biographyText = 'Eigene ausführliche Hausgeschichte';
  edited.commentSequence = [{ text: 'Eigene Notiz bleibt erhalten' }];
  local.extensions.houseBiographyModule = edited;
  assert.deepEqual(resolveRegisteredFamilyUpgrade(registered, local).extensions.houseBiographyModule, edited);
  assert.ok(!registered.extensions.registryManagedExtensionFields.includes('houseBiographyModule'));
});

test('37 bestehende Klaueninsel-Akten erhalten Hausseiten, eigene Iframes und genau eine Bio-Revision', () => {
  assert.equal(before.length, 37);
  assert.equal(sourceModules.length, 37);
  assert.deepEqual([...records.keys()].sort(), expectedIds, 'keine zusätzlichen Familienakten');
  assert.deepEqual([...sources.keys()].sort(), expectedIds);
  for (const { content, url } of sources.values()) {
    const record = records.get(content.id), baseline = baselineById.get(content.id);
    assert.ok(record, content.id);
    assert.equal(content.registerPage, true, content.id);
    assert.equal(registry.byId(content.id)?.status, 'active', content.id);
    assert.equal(content.biographySourceRevision, baseline.sourceRevision + 1, content.id);
    const page = createHousePageData(content), biography = createHouseBiography(content);
    const frame = new URL(page.familyTreeEmbed.src, feature);
    assert.equal(frame.pathname, new URL('Stammbaum.html', treeRoot).pathname, content.id);
    assert.equal(frame.searchParams.get('family'), content.id);
    assert.equal(frame.searchParams.get('mode'), 'view');
    assert.doesNotMatch(String(content.sections.familyTree), /<table|<iframe|https?:\/\//i, content.id);
    const generated = { window: {} };
    vm.runInNewContext(readFileSync(new URL('haus.data.js', url), 'utf8'), generated);
    assert.deepEqual(JSON.parse(JSON.stringify(generated.window.HAEUSER_DATA)), page, content.id);
    assert.deepEqual(record.family.extensions.houseBiographyModule, biography, content.id);
    const backlink = new URL(biography.house.documents[0].link, treeRoot);
    assert.equal(backlink.searchParams.get('haus'), content.id);
    assert.ok(existsSync(new URL(backlink.pathname, backlink)), content.id);
  }
  assert.ok(sources.has('haus-morthwyll'));
  assert.ok(sources.has('haus-cwningod'));
  assert.equal(sources.has('haus-morthwyl'), false);
  assert.equal(sources.has('haus-cwingod'), false);
});

test('alle 37 Klaueninsel-Familiengraphen bleiben bytegleich zum registrierten Ausgangsstand', () => {
  for (const baseline of before) {
    const record = records.get(baseline.id);
    assert.ok(record, baseline.id);
    assert.equal(sha256(JSON.stringify(graph(record.family))), baseline.graphFingerprint, baseline.id);
    assert.equal(record.family.persons.length, baseline.people.length, baseline.id);
  }
});

test('auch die sechs ursprünglichen Familienakten der Exilhäuser bleiben unverändert', () => {
  assert.deepEqual(originBefore.map(record => record.id).sort(),
    ['haus-diafol', 'haus-dianc', 'haus-arfordir', 'haus-dyfrgi', 'haus-walwrs', 'haus-blodyn'].sort());
  for (const baseline of originBefore) {
    const record = allRecords.get(baseline.id);
    assert.ok(record, baseline.id);
    assert.equal(record.title, baseline.title, baseline.id);
    assert.deepEqual(record.folderPath, baseline.folderPath, baseline.id);
    assert.equal(sha256(JSON.stringify(graph(record.family))), baseline.graphFingerprint, baseline.id);
  }
});

test('aktuelle Sitze, Hierarchien und Ränge haben Vorrang; offene Ränge und Ddraenens Bürgerstand bleiben erhalten', () => {
  for (const { content } of sources.values()) {
    const baseline = baselineById.get(content.id), profile = records.get(content.id).houseProfile;
    assert.equal(profile.rankId, baseline.profile.rankId, content.id);
    assert.equal(profile.seat, baseline.profile.seat, content.id);
    assert.deepEqual(records.get(content.id).folderPath, baseline.folderPath, content.id);
    assert.equal(content.profile.seat, profile.seat, content.id);
    assert.equal(content.county, 'Klaueninsel', content.id);
    for (const name of baseline.folderPath) {
      assert.ok(content.hierarchy.some(entry => entry.name === name), `${content.id}: ${name}`);
    }
    assert.ok(existsSync(new URL(content.territoryHref, feature)), content.id);
  }
  for (const id of [...unresolvedRankIds, 'haus-ard-follmhar']) {
    const content = sources.get(id).content;
    assert.equal(records.get(id).houseProfile.rankId, 'unknown', id);
    assert.equal(content.profile.rank, 'Offen', id);
    assert.equal(HOUSE_RANKS[id], 'Offen', id);
  }
  const ddraenen = sources.get('haus-ddraenen').content;
  assert.equal(records.get(ddraenen.id).houseProfile.rankId, 'commoner');
  assert.equal(ddraenen.profile.rank, 'Bürgerlich');
  assert.match(prose(ddraenen), /persönliche Ritterwürde/);
  assert.equal(houseRankLabel(sources.get('haus-arth').content.profile.highestTitle), 'Grafenhaus');
  const ard = sources.get('haus-ard-follmhar').content;
  assert.equal(ard.extinct, false, 'Stadtzerstörung ist kein pauschaler Clanerloschensbeleg');
  assert.equal(ard.founder, null);
  assert.deepEqual(ard.heads, []);
});

test('Llafnfors Dyfrgi-Bindung und örtliche Karten bleiben ohne erfundenen Familiensitz erhalten', async () => {
  const llafnfor = sources.get('haus-llafnfor').content;
  assert.equal(records.get(llafnfor.id).houseProfile.liegeHouseId, 'haus-dyfrgi-caer-cryftlawd');
  assert.equal(llafnfor.profile.seat, '');
  assert.match(llafnfor.liege, /Dyfrgi/);
  assert.equal(records.get(llafnfor.id).family.persons.length, 3, 'unbekanntes Gründerpaar und Cynfarch');
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('Kontinente/assets/js/herrschaft-data.js', root), 'utf8'), context);
  const previousData = globalThis.ALERIA_HERRSCHAFT_DATA;
  let pages;
  try {
    globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
    pages = await Promise.all(walk(new URL('Kontinente/Estryll/Königreich Cenyr/Grafschaft Klaueninsel/', root))
      .filter(url => url.pathname.endsWith('.data.mjs')).map(async url => (await import(url)).default));
  } finally {
    if (previousData === undefined) delete globalThis.ALERIA_HERRSCHAFT_DATA;
    else globalThis.ALERIA_HERRSCHAFT_DATA = previousData;
  }
  const expected = readJson(new URL('territory-placement.json', diagnosticRoot));
  const placements = new Map(expectedIds.map(id => [id, []]));
  for (const page of pages) {
    for (const card of page.view.familySections.flatMap(section => section.cards)) {
      if (!placements.has(card.id)) continue;
      placements.get(card.id).push(page.meta.id);
      const href = new URL(card.href, 'https://aleria.example/');
      assert.equal(href.searchParams.get('haus'), card.id, card.id);
      assert.match(decodeURIComponent(href.pathname), /^\/Familien Häuser und Clans\/(?:haus|kleinehaeuser)\.html$/, card.id);
    }
  }
  for (const id of expectedIds) assert.deepEqual(placements.get(id).sort(), [...expected[id]].sort(), id);
  assert.deepEqual(placements.get(llafnfor.id), ['herrschaft-krallenspitze']);
});

test('belegte Lore der 21 kleineren Häuser bleibt sichtbar; Morlan und Morglan bleiben verschiedene Familien', () => {
  assert.equal(lowerIds.length, 21);
  for (const id of lowerIds) {
    const content = sources.get(id).content;
    const namedPeople = baselineById.get(id).people.filter(person => person.name && !/^\?+$/.test(person.name));
    if (namedPeople.length) {
      assert.ok(namedPeople.some(person => prose(content).includes(person.name)), `${id}: belegte Angehörige nicht pauschal ausblenden`);
    }
    assert.doesNotMatch(prose(content), /(?:alle|sämtliche) (?:Personen|Angehörigen) (?:sind |bleiben )?unbekannt/i, id);
  }
  assert.match(prose(sources.get('haus-beryn').content), /Owain Beryn/);
  assert.match(prose(sources.get('haus-beryn').content), /Wachmeister|Knappendienst/);
  assert.match(prose(sources.get('haus-dyger').content), /Rhy Dyger/);
  const morlan = sources.get('haus-morlan').content, morglan = sources.get('haus-morglan').content;
  assert.notEqual(records.get(morlan.id).family.document.id, records.get(morglan.id).family.document.id);
  assert.notEqual(morlan.images.crest, morglan.images.crest);
  assert.notEqual(morlan.images.scene, morglan.images.scene);
  assert.match(prose(morlan), /Morlan/);
  assert.match(prose(morglan), /Morglan/);
});

test('Personenkarten verlinken nur bestehende Identitäten mit ihren kanonischen Portraits', () => {
  for (const { content } of sources.values()) {
    for (const member of courtEntries(content)) {
      if (!member.id) continue;
      const canonical = allRecords.get(member.familyId)?.family.persons.find(person => person.id === member.id);
      assert.ok(canonical, `${content.id}: ${member.familyId}/${member.id}`);
      assert.equal(member.name, canonical.name, `${content.id}: ${member.id}`);
      if (member.image && canonical.portrait) {
        assert.equal(new URL(member.image, feature).href, new URL(canonical.portrait, treeRoot).href,
          `${content.id}: ${member.id}`);
      }
    }
    assert.doesNotMatch(prose(content), /〈Platzhalter|Titel hier einfügen|Dialog von Figur|Beschreibung \.\.\.|tumblr_otwjgn/i, content.id);
  }
});

test('Militärstatistiken fehlen in Hausprofilen, Bios und redaktionellen Texten', () => {
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|hundert|tausend)';
  const militaryAmount = new RegExp(`\\b${quantity}\\s+(?:Mann|Rittern?|(?:Waffen)?knecht(?:e|en)?|Stadtwach(?:e|en)|Soldat(?:en)?|Kriegern?|Galeer(?:e|en)|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  for (const { content } of sources.values()) {
    const page = createHousePageData(content), biography = createHouseBiography(content);
    assert.deepEqual(page.hiddenProfileGroups, ['military'], content.id);
    for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(page.profile[key], '', `${content.id}: ${key}`);
    assert.ok(!biography.stats.some(([label]) => /Truppen|Mannstärke|Waffenknechte|Stadtwache|Flotte/i.test(label)), content.id);
    assert.doesNotMatch(prose(content), militaryAmount, content.id);
    assert.doesNotMatch(prose(content), /(?:Truppenstärke|Gesamtaufgebot|Flottenstärke|Mannstärke)\s*[:=]?\s*\d/iu, content.id);
  }
});

test('Bio-Upgrades erhalten eigene Graphbearbeitungen, eigene Hausbios und bewusst entfernte Hausbios', () => {
  for (const { content } of sources.values()) {
    const registered = records.get(content.id).family, local = structuredClone(registered);
    local.extensions.sourceRevision = baselineById.get(content.id).sourceRevision;
    delete local.extensions.houseBiographyModule;
    const hasPerson = local.persons.length > 0;
    if (hasPerson) {
      local.persons[0].name = 'Eigene Personenbearbeitung';
      local.persons[0].notes = 'Eigene unveränderte Notiz';
    }
    const expected = normalizeFamily(local);
    const upgraded = resolveRegisteredFamilyUpgrade(registered, local);
    assert.deepEqual(normalizedGraph(upgraded), normalizedGraph(expected), content.id);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, createHouseBiography(content), content.id);
    const custom = structuredClone(createHouseBiography(content));
    custom.description = 'Eigene Hausgeschichte';
    custom.house.biographyText = 'Eigener ausführlicher Text';
    custom.commentSequence = [{ text: 'Eigene Notiz' }];
    for (const own of [null, custom]) {
      local.extensions.houseBiographyModule = own;
      const result = resolveRegisteredFamilyUpgrade(registered, local);
      assert.deepEqual(result.extensions.houseBiographyModule, own, content.id);
      assert.deepEqual(normalizedGraph(result), normalizedGraph(expected), content.id);
      if (hasPerson) {
        assert.equal(result.persons[0].name, 'Eigene Personenbearbeitung', content.id);
        assert.equal(result.persons[0].notes, 'Eigene unveränderte Notiz', content.id);
      } else {
        assert.deepEqual(result.persons, [], `${content.id}: leere Akte bleibt leer`);
      }
    }
  }
});

test('16 Originalzuordnungen und 21 neue Motive sind lokal und richtig in der Galerie; Blodyn teilt nur das Original', () => {
  const catalog = readJson(new URL('Gallerien/krieger/data/catalog.json', root));
  const originalHashes = new Set(), newHashes = new Set(), digestById = new Map();
  for (const { content } of sources.values()) {
    const page = createHousePageData(content), biography = createHouseBiography(content);
    for (const image of Object.values(page.images)) {
      if (!image.src) continue;
      assert.doesNotMatch(image.src, /^(?:https?:|data:|file:)/i, content.id);
      assert.ok(existsSync(new URL(image.src, feature)), `${content.id}: ${image.src}`);
    }
    assert.ok(existsSync(new URL(biography.image, treeRoot)), content.id);
    const digest = sha256(readFileSync(new URL(content.images.scene, feature)));
    digestById.set(content.id, digest);
    (originalImageIds.has(content.id) ? originalHashes : newHashes).add(digest);
    assert.match(content.images.scene, originalImageIds.has(content.id)
      ? /hausdarstellung-original\.png$/ : /hausdarstellung-2026-11-03\.png$/, content.id);
    const illustration = catalog.illustrations.find(entry => entry.sha256 === digest);
    assert.ok(illustration?.houseIds.includes(content.id), content.id);
    assert.ok(catalog.houses.find(house => house.id === content.id)?.illustrationIds.includes(illustration.id), content.id);
  }
  assert.equal(originalImageIds.size, 16);
  assert.equal(originalHashes.size, 15);
  assert.equal(newHashes.size, 21);
  assert.equal(new Set(digestById.values()).size, 36);
  assert.equal(digestById.get('haus-blodyn-talgarth'), digestById.get('haus-blodyn-aberdail'));
  const frames = ['haus-blodyn-talgarth', 'haus-blodyn-aberdail'].map(id =>
    new URL(createHousePageData(sources.get(id).content).familyTreeEmbed.src, feature).searchParams.get('family'));
  assert.deepEqual(frames, ['haus-blodyn-talgarth', 'haus-blodyn-aberdail']);
});

test('der reale begrenzte Galerieabgleich erhält aktuelle fremde Häuser, Bilddaten und gemeinsame Motive', async () => {
  // Deliberately compare the current release, not a stale foreign baseline: other
  // authorized work may have updated unrelated houses since this batch began.
  const current = readJson(new URL('Gallerien/krieger/data/catalog.json', root));
  const houseIds = [...expectedIds], scope = new Set(houseIds);
  const collected = collectHouses(root, { houseIds });
  assert.deepEqual(collected.houses.map(house => house.id).sort(), expectedIds);
  const selection = readJson(new URL('Gallerien/krieger/data/selection.json', root));
  const illustrations = await collectIllustrations(root, collected, selection, { houseIds });
  const rebuiltHashes = new Set(illustrations.map(image => image.sha256));
  const updated = mergeScopedCatalog(current, { houses: collected.houses, illustrations }, houseIds);
  for (const [key, value] of Object.entries(current)) {
    if (!['houses', 'illustrations'].includes(key)) assert.deepEqual(updated[key], value, key);
  }
  for (const house of current.houses.filter(house => !scope.has(house.id))) {
    assert.deepEqual(updated.houses.find(entry => entry.id === house.id), house, house.id);
  }
  for (const image of current.illustrations) {
    const foreignIds = image.houseIds.filter(id => !scope.has(id));
    if (!foreignIds.length && image.houseIds.length) continue;
    const merged = updated.illustrations.find(entry => entry.id === image.id);
    assert.ok(merged, image.id);
    assert.deepEqual(merged.houseIds.filter(id => !scope.has(id)), foreignIds, image.id);
    if (!rebuiltHashes.has(image.sha256) && !image.houseIds.some(id => scope.has(id))) {
      assert.deepEqual(merged, image, image.id);
    } else {
      for (const [key, value] of Object.entries(image)) {
        if (!['houseIds', 'copies', 'sources'].includes(key)) assert.deepEqual(merged[key], value, `${image.id}: ${key}`);
      }
      for (const copy of image.copies || []) assert.ok(merged.copies.includes(copy), image.id);
      for (const source of image.sources || []) assert.ok(merged.sources.some(entry => JSON.stringify(entry) === JSON.stringify(source)), image.id);
    }
  }
});

test('Originalarchive sind hashprüfbar; Quellen und Diagnosen bleiben außerhalb der statischen Auslieferung', () => {
  const archivePattern = /^(?:animexx-(?:original|source)(?:-\d{4}-\d{2}-\d{2})?\.html|quellen\.json|sources\.json|source-manifest\.json|image-generation(?:-v\d+)?\.json|REDAKTION\.md|SOURCE_DECISIONS\.md)$/;
  for (const { content, url } of sources.values()) {
    const directory = new URL('./', url);
    if (originalImageIds.has(content.id)) {
      const manifestName = ['source-manifest.json', 'quellen.json', 'sources.json']
        .find(name => existsSync(new URL(name, directory)));
      assert.ok(manifestName, content.id);
      const manifest = readJson(new URL(manifestName, directory));
      const source = manifest.source || manifest.original;
      assert.ok(source?.file && source?.sha256, content.id);
      assert.equal(sha256(readFileSync(new URL(source.file, directory))), source.sha256, content.id);
      for (const image of manifest.images || []) {
        if (!image.sha256) continue;
        assert.equal(sha256(readFileSync(new URL(image.file || image.localPath, directory))), image.sha256, content.id);
      }
    }
    for (const file of walk(directory).filter(file => archivePattern.test(file.pathname.split('/').at(-1)))) {
      assert.equal(shouldPublish(relativeSitePath(file)), false, relativeSitePath(file));
    }
    assert.equal(shouldPublish(relativeSitePath(new URL(content.images.scene, feature))), true, content.id);
    for (const name of ['haus.data.js', 'haus.biography.mjs']) {
      const generated = new URL(name, directory);
      assert.ok(existsSync(generated), `${content.id}: ${name}`);
      assert.equal(shouldPublish(relativeSitePath(generated)), true, content.id);
    }
  }
  for (const file of walk(diagnosticRoot)) assert.equal(shouldPublish(relativeSitePath(file)), false, relativeSitePath(file));
});
