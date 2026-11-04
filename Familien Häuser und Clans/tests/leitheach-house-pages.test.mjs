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
import { reviewedBiographyFingerprint, reviewedBiographySourceRevision, reviewedContentVersion,
  reviewedGraphFingerprint } from './house-lore-reviewed-expectations.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const tree = new URL('Stammbäume/', root);
const json = url => JSON.parse(readFileSync(url, 'utf8'));
const fixture = json(new URL('fixtures/leitheach-initial-review.json', import.meta.url));
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
const prose = content => strings([content.sections, content.biographySummary, content.figures, content.trivia]).join('\n');

function generatedPage(url) {
  const target = vm.createContext({ window: {} });
  vm.runInContext(readFileSync(new URL('haus.data.js', url), 'utf8'), target);
  return plain(target.window.HAEUSER_DATA);
}

test('alle 29 öffentlichen Leitheach-Familien besitzen registrierte Hausseiten und gemeinsame Hausbios', () => {
  assert.equal(fixture.publicOnly, true);
  assert.equal(ids.length, 29);
  assert.deepEqual(FAMILY_REGISTRY.filter(record => record.listing === 'listed' && record.status === 'active'
    && record.folderPath?.[0] === 'Leitheach').map(record => record.id).sort(), ids);
  for (const [id, { content, url }] of sources) {
    const record = records.get(id), page = registeredPages.find(entry => entry.id === id);
    assert.equal(content.id, id);
    assert.equal(content.name, record.title, id);
    assert.equal(content.registerPage, true, id);
    assert.equal(content.page, 'haus.html', id);
    assert.equal(page?.status, 'active', id);
    assert.equal(new URL(page.data, feature).pathname, new URL('haus.data.js', url).pathname, id);
    assert.equal(content.contentVersion, reviewedContentVersion(id, '20261103-leitheach-v1'), id);
    assert.equal(content.biographySourceRevision, reviewedBiographySourceRevision(id, initial.get(id).sourceRevision + 1), id);
    assert.deepEqual(generatedPage(url), plain(createHousePageData(content)), id);
    assert.deepEqual(biographies.get(id), createHouseBiography(content), id);
    assert.deepEqual(record.family.extensions.houseBiographyModule, biographies.get(id), id);
    assert.deepEqual(HOUSE_BIOGRAPHY_DEFAULTS[id]?.biography, biographies.get(id), id);
  }
});

test('alle Graphen, Personen, Profile, Ränge, Titel und Ortszuordnungen bleiben gegenüber der Baseline erhalten', () => {
  for (const [id, previous] of initial) {
    const record = records.get(id), family = record.family;
    assert.equal(sha(JSON.stringify(graph(family))), reviewedGraphFingerprint(id, previous.graphFingerprint), id);
    assert.deepEqual(record.houseProfile, previous.profile, id);
    assert.deepEqual(family.document.houseProfile, previous.profile, id);
    assert.deepEqual(record.folderPath, previous.folderPath, id);
    assert.equal(record.title, previous.title, id);
    assert.equal(family.document.title, previous.documentTitle, id);
    assert.equal(family.document.motto || '', previous.motto, id);
    assert.equal(family.extensions.historicalStatus || '', previous.historicalMetadata.historicalStatus, id);
    assert.deepEqual(family.extensions.extinctionEvent || null, previous.historicalMetadata.extinctionEvent, id);
  }
  for (const previous of fixture.relatedRecords) {
    const record = records.get(previous.id);
    assert.equal(sha(JSON.stringify(graph(record.family))), reviewedGraphFingerprint(previous.id, previous.graphFingerprint), previous.id);
    assert.deepEqual(record.houseProfile, previous.profile, previous.id);
    assert.deepEqual(record.folderPath, previous.folderPath, previous.id);
    assert.equal(sha(JSON.stringify(record.family.extensions.houseBiographyModule || null)),
      reviewedBiographyFingerprint(previous.id, previous.biographyFingerprint), previous.id);
  }
});

test('Leitheach nutzt seine tatsächlichen Territorialziele und albischen Hierarchien; ähnliche IDs bleiben getrennt', () => {
  for (const [id, { content }] of sources) {
    const expected = initial.get(id).territory;
    assert.equal(content.territoryId, expected.territoryId, id);
    assert.ok(existsSync(new URL(content.territoryHref, feature)), id);
    assert.equal(new URL(content.territoryHref, feature).pathname, new URL(expected.href.slice(1), root).pathname, id);
    assert.equal(content.county, initial.get(id).profile.county, id);
    for (const row of expected.hierarchy.filter(entry => !['Sammlung', 'Kontinent'].includes(entry.type))) {
      assert.ok(content.hierarchy.some(entry => entry.type === row.type && entry.name === row.name), `${id}: ${row.type} ${row.name}`);
    }
    assert.ok(!content.hierarchy.some(entry => /Jarltum|Grafschaft|Königreich/.test(entry.type)), id);
    const frame = new URL(createHousePageData(content).familyTreeEmbed.src, feature);
    assert.equal(frame.searchParams.get('family'), id);
    assert.equal(frame.searchParams.get('mode'), 'view');
    assert.ok(biographies.get(id).house.documents.some(document => String(document.link || '').includes(`haus=${id}`)), id);
  }
  assert.equal(records.get('haus-nic-blar-leitheach').folderPath[0], 'Leitheach');
  assert.equal(records.get('haus-nic-blar').folderPath[0], 'Ceitheach');
  assert.equal(records.get('haus-cleir').folderPath[0], 'Leitheach');
  assert.equal(records.get('haus-cleirigh').folderPath[0], 'Blaithneach');
  assert.equal(ids.includes('haus-nic-blar'), false);
  assert.equal(ids.includes('haus-cleirigh'), false);
  assert.equal(initial.get('haus-amrhan').inputSlug, 'ua-amhran');
  assert.equal(initial.get('haus-dal-t-saor').inputSlug, 'dal-t-saoir');
  assert.equal(registeredPages.some(page => page.id === 'haus-ua-amhran'), false);
  assert.equal(registeredPages.some(page => page.id === 'haus-dal-t-saoir'), false);
});

test('drei historische Hausverwaltungen behalten Rang und letzten Sitz; die belegten Überlebenden bleiben sichtbar', () => {
  assert.deepEqual([...sources].filter(([, { content }]) => content.extinct).map(([id]) => id).sort(), fixture.historicalIds);
  assert.deepEqual(fixture.historicalIds, ['haus-dal-t-saor', 'haus-iomrach', 'haus-suileach']);
  for (const [id, rank, seat] of [
    ['haus-suileach', 'Mor Tiarna', 'Lochansail'],
    ['haus-iomrach', 'Laird', 'Broch an Clais'],
    ['haus-dal-t-saor', 'Laird', 'Sruthlann']
  ]) {
    const content = sources.get(id).content;
    assert.equal(content.currentHead, '', id);
    assert.equal(content.profile.highestTitle, rank, id);
    assert.equal(content.profile.seat, seat, id);
    assert.ok(biographies.get(id).stats.some(([label]) => label === 'Status'), id);
  }
  for (const [id, year, survivors] of [
    ['haus-iomrach', '1733', ['ybhna-iomrach', 'conan-iomrach']],
    ['haus-dal-t-saor', '1735', ['quona-tsaoir', 'junaid-tsaoir']]
  ]) {
    const content = sources.get(id).content, text = prose(content);
    assert.match(text, new RegExp(year), id);
    assert.match(text, /Hauslinie|Hauptlinie|Verwaltung|Herrschaft|Burg/i, id);
    assert.match(text, /überleb|auswärt|außerhalb|fern von/i, id);
    assert.doesNotMatch(text, /keine Überlebenden|sämtliche Angehörigen (?:starben|getötet)|alle Familienmitglieder (?:tot|starben)/i, id);
    for (const personId of survivors) {
      const person = records.get(id).family.persons.find(entry => entry.id === personId);
      assert.equal(person.status, 'alive', `${id}: ${personId}`);
      assert.equal(person.death, '', `${id}: ${personId}`);
      assert.ok(text.includes(person.name.split(' ')[0]), `${id}: ${person.name} in der Überlieferung`);
    }
  }
  const conan = records.get('haus-iomrach').family.persons.find(person => person.id === 'conan-iomrach');
  assert.match(conan.title, /Erbe.*Mündel/);
  assert.equal(sources.get('haus-somhairle').content.extinct, false);
  assert.equal(sources.get('haus-somhairle').content.profile.highestTitle, 'Laird');
});

test('heutige Ämter, Gründer und geordnete Erbfolgen folgen vorhandenen Identitäten', () => {
  for (const previous of fixture.records.filter(record => record.currentHeadId)) {
    const person = records.get(previous.id).family.persons.find(entry => entry.id === previous.currentHeadId);
    assert.equal(sources.get(previous.id).content.currentHead, person.name, previous.id);
  }
  for (const previous of fixture.records.filter(record => record.heirIds.length)) {
    const content = sources.get(previous.id).content;
    assert.deepEqual(content.heirs.map(person => person.id), previous.heirIds, previous.id);
    assert.equal(content.firstHeir, records.get(previous.id).family.persons.find(person => person.id === previous.heirIds[0]).name, previous.id);
  }
  assert.equal(sources.get('haus-fiachrach').content.firstHeir, 'Séamus Fiachrach');
  for (const [id, personId] of [['haus-fiachrach', 'seamair-fiachrach'], ['haus-ruin-ua-laoch', 'senan-ancient-cumhail']]) {
    assert.equal(sources.get(id).content.founder.id, personId, id);
    assert.equal(sources.get(id).content.founder.name, records.get(id).family.persons.find(person => person.id === personId).name, id);
  }
  const sept = sources.get('haus-gruenhand').content;
  assert.equal(records.get('haus-gruenhand').houseProfile.rankId, 'sept-head');
  assert.match(sept.profile.highestTitle, /Sept|Bürger|Familie/);
  assert.doesNotMatch(sept.profile.highestTitle, /Laird|Tiarna|Ritter/);
  assert.equal(sept.profile.seat, 'Broch an Coill');
  assert.equal(sept.liege, 'Clan Na’Mhuir');
  for (const [id, seat] of [['haus-cleir', 'Cairn Fàire'], ['haus-ua-eirce', 'Senanbail'], ['haus-fiachrach', 'Mârbail']]) {
    assert.equal(sources.get(id).content.profile.seat, seat, id);
  }
});

test('Angehörigenkarten verweisen ausschließlich auf reale vorhandene Personen und ihre kanonischen Portraits', () => {
  for (const [id, { content }] of sources) for (const member of members(content)) {
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
});

test('26 Originalbilder bleiben bytegleich, drei Bildlücken sind ergänzt und alle 29 Familien in der Galerie verbunden', () => {
  assert.equal(fixture.originalAssets.length, 26);
  assert.equal(new Set(fixture.originalAssets.map(asset => asset.id)).size, 26);
  assert.deepEqual(fixture.generatedImageIds, ['haus-dal-t-saor', 'haus-gruenhand', 'haus-suileach']);
  assert.deepEqual([...fixture.originalAssets.map(asset => asset.id), ...fixture.generatedImageIds].sort(), ids);
  for (const original of fixture.originalAssets) {
    assert.equal(sha(readFileSync(new URL(original.path, root))), original.sha256, original.id);
    assert.equal(sha(readFileSync(new URL(sources.get(original.id).content.images.scene, feature))), original.sha256, original.id);
  }
  for (const [id, { content }] of sources) {
    const scene = readFileSync(new URL(content.images.scene, feature)), sceneHash = sha(scene);
    assert.equal(scene.subarray(1, 4).toString('ascii'), 'PNG', id);
    const illustration = gallery.illustrations.find(entry => entry.sha256 === sceneHash && entry.houseIds.includes(id));
    assert.ok(illustration, id);
    assert.ok(gallery.houses.find(entry => entry.id === id)?.illustrationIds.includes(illustration.id), id);
    assert.equal(sha(readFileSync(new URL(illustration.image, root))), sceneHash, id);
    for (const image of Object.values(createHousePageData(content).images)) {
      if (!image.src) continue;
      assert.doesNotMatch(image.src, /^(?:https?:|data:|file:)/i, id);
      assert.ok(existsSync(new URL(image.src, feature)), `${id}: ${image.src}`);
    }
    assert.equal(sha(readFileSync(new URL(biographies.get(id).image, tree))), sceneHash, id);
  }
});

test('Militärstatistiken und unbearbeitete Vorlagenplatzhalter fehlen in Profil und Bio', () => {
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|vierzig|fünfzig|hundert|tausend)';
  const amount = new RegExp(`\\b${quantity}\\s+(?:Mann|Tiarnan|Ceithern|Kerns|Soldat(?:en)?|Clankriegern?|Kriegern?|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  for (const [id, { content }] of sources) {
    const page = createHousePageData(content), biography = biographies.get(id);
    assert.deepEqual(page.hiddenProfileGroups, ['military'], id);
    for (const field of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(page.profile[field], '', id);
    assert.ok(!biography.stats.some(([label]) => /Truppen|Mannstärke|Waffenknechte|Stadtwache|Flotte/i.test(label)), id);
    assert.doesNotMatch(prose(content), amount, id);
    assert.doesNotMatch(prose(content), /Titel hier einfügen|Dialog von Figur|Beschreibung \.\.\.|unter undefined/i, id);
  }
});

test('Standardbio-Upgrades erhalten eigene Texte, bewusste Löschungen und eigene Graphbearbeitungen', () => {
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

test('28 unveränderte Quellarchive bleiben erhalten; die Genealogie wird nur über bestehende Familienakten eingebunden', () => {
  assert.ok(fixture.records.every(record => !record.hadBiography));
  assert.equal(fixture.records.filter(record => record.sourceArchiveSha256).length, 28);
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
