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
const fixture = json(new URL('fixtures/schwarzfenn-initial-review.json', import.meta.url));
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

test('alle elf vorhandenen Schwarzfenn-Familien besitzen vollständige Hausseiten und Hausbios', () => {
  assert.equal(fixture.publicOnly, true);
  assert.equal(ids.length, 11);
  const scoped = FAMILY_REGISTRY.filter(record => record.folderPath?.[0] === 'Aldrimar'
    && record.folderPath?.[1] === 'Schwarzfenn').map(record => record.id).sort();
  assert.deepEqual(scoped, ids);
  for (const [id, { content, url }] of sources) {
    const record = records.get(id), page = registeredPages.find(entry => entry.id === id);
    assert.equal(content.id, id);
    assert.equal(content.name, record.title, id);
    assert.equal(content.registerPage, true, id);
    assert.equal(content.page, 'haus.html', id);
    assert.equal(page?.status, 'active', id);
    assert.equal(new URL(page.data, feature).pathname, new URL('haus.data.js', url).pathname, id);
    assert.equal(content.contentVersion, reviewedContentVersion(id, '20261103-schwarzfenn-v1'), id);
    assert.equal(content.biographySourceRevision, reviewedBiographySourceRevision(id, initial.get(id).sourceRevision + 1), id);
    assert.deepEqual(generatedPage(url), plain(createHousePageData(content)), id);
    assert.deepEqual(biographies.get(id), createHouseBiography(content), id);
    assert.deepEqual(record.family.extensions.houseBiographyModule, biographies.get(id), id);
    assert.deepEqual(HOUSE_BIOGRAPHY_DEFAULTS[id]?.biography, biographies.get(id), id);
  }
});

test('sämtliche Graphen, Personen, Ränge, Profile, Titel und Ortsordner bleiben unverändert', () => {
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

test('Jarltum Schwarzfenn, Hauptsitz Wolfsklamm und der kanonische Graumähne-Slug bleiben getrennt', () => {
  for (const [id, { content }] of sources) {
    assert.equal(content.county, 'Schwarzfenn', id);
    assert.equal(content.countyLabel, 'Jarltum', id);
    assert.equal(content.territoryId, 'jarltum-schwarzfenn', id);
    assert.ok(existsSync(new URL(content.territoryHref, feature)), id);
    assert.match(decodeURIComponent(content.territoryHref), /Jarltum Schwarzfenn\/Jarltum Schwarzfenn\.html$/, id);
    assert.ok(content.hierarchy.some(entry => entry.type === 'Jarltum' && /Schwarzfenn/.test(entry.name)), id);
    assert.ok(!content.hierarchy.some(entry => entry.type === 'Jarltum' && /Wolfsklamm/.test(entry.name)), id);
    const frame = new URL(createHousePageData(content).familyTreeEmbed.src, feature);
    assert.equal(frame.searchParams.get('family'), id);
    assert.equal(frame.searchParams.get('mode'), 'view');
    assert.ok(biographies.get(id).house.documents.some(document => String(document.link || '').includes(`haus=${id}`)), id);
  }
  assert.equal(records.get('haus-ragnulf').family.document.houseProfile.seat, 'Wolfsklamm');
  assert.equal(sources.get('haus-ragnulf').content.firstHeir, 'Bjölf Ragnulf');
  assert.deepEqual(sources.get('haus-ragnulf').content.heirs.map(person => person.id), ['bjolf-ragnulf', 'gulvar-ragnulf']);
  assert.match(records.get('haus-ragnulf').family.persons.find(person => person.id === 'gulvar-ragnulf').title, /Zweiter Erbe/);
  assert.equal(sources.get('haus-helgr').content.firstHeir, '');
  assert.ok(records.get('haus-helgr').family.persons.find(person => person.id === 'magnus-helgr').death);
  assert.equal(initial.get('haus-graumahne').inputSlug, 'graumaehne');
  assert.equal(sources.get('haus-graumahne').content.name, 'Clan Graumähne');
  assert.equal(records.has('haus-graumaehne'), false);
  assert.equal(registeredPages.some(page => page.id === 'haus-graumaehne'), false);
  assert.equal(ids.includes('haus-hrafnvald'), false);
  assert.equal(records.get('haus-hrafn').folderPath[1], 'Schwarzfenn');
  assert.equal(records.get('haus-hjerte').folderPath[1], 'Krähenmoor');
});

test('drei historische Clans bleiben erloschen; Arnvild behält den Hesirenrang und Crannath die Kriegskunst', () => {
  const extinctIds = [...sources].filter(([, { content }]) => content.extinct).map(([id]) => id).sort();
  assert.deepEqual(extinctIds, fixture.extinctIds);
  assert.deepEqual(extinctIds, ['haus-arnvild', 'haus-mac-bronaigh', 'haus-svartholmr']);
  const category = /Norrnaigh|Aldrimarer|Antike Crannath Clans|jüngst ausradiert/i;
  for (const id of extinctIds) {
    const content = sources.get(id).content;
    assert.equal(content.currentHead, '', id);
    assert.deepEqual(content.heirs, [], id);
    assert.doesNotMatch(content.profile.seat, category, id);
    assert.ok(!content.hierarchy.some(entry => entry.type === 'Sitz' && category.test(entry.name)), id);
    assert.ok(biographies.get(id).stats.some(([label, value]) => label === 'Status' && /ausgestorben/i.test(value)), id);
  }
  assert.equal(sources.get('haus-arnvild').content.profile.highestTitle, 'Hesire');
  for (const id of ['haus-mac-bronaigh', 'haus-svartholmr']) {
    assert.equal(sources.get(id).content.profile.highestTitle, 'Offen', id);
  }
  const ancient = sources.get('haus-mac-bronaigh').content;
  assert.equal(ancient.hierarchy.find(entry => entry.name === 'Antike Crannath Clans')?.type, 'Kultur');
  assert.match(createHousePageData(ancient).sectionTitles.knighthood, /Kriegskunst$/);
  assert.equal(sources.get('haus-hrafn').content.extinct, false);
});

test('Eisbrand bleibt ohne anerkannte Adelsherrschaft und ohne neue Lehensbindung', () => {
  const id = 'haus-eisbrand', content = sources.get(id).content;
  assert.equal(records.get(id).family.document.houseProfile.rankId, 'commoner');
  assert.equal(content.profile.highestTitle, 'Bürgerlich');
  assert.equal(content.liege, '');
  assert.equal(content.profile.liege, '');
  assert.ok(!biographies.get(id).stats.some(([label]) => label === 'Lehnsherr'));
  assert.match(strings([content.type, content.profile.houseType, content.sections.overview]).join(' '),
    /nicht anerkannt|Banditenhaus/i);
});

test('Angehörigenkarten verwenden ausschließlich reale vorhandene Personen und Portraits', () => {
  for (const [id, { content }] of sources) {
    for (const member of members(content)) {
      if (!member.id) continue;
      const canonical = records.get(member.familyId)?.family.persons.find(person => person.id === member.id);
      assert.ok(canonical, `${id}: ${member.familyId}/${member.id}`);
      assert.equal(member.name, canonical.name, `${id}: ${member.id}`);
      if (member.image) {
        assert.ok(canonical.portrait, `${id}: ${member.id}`);
        assert.equal(new URL(member.image, feature).href, new URL(canonical.portrait, tree).href,
          `${id}: ${member.id}`);
      }
    }
  }
});

test('alle elf Originalbilder bleiben bytegleich, lokal und dem richtigen Haus in der Galerie zugeordnet', () => {
  assert.equal(fixture.originalAssets.length, 11);
  assert.equal(new Set(fixture.originalAssets.map(asset => asset.id)).size, 11);
  for (const asset of fixture.originalAssets) {
    const source = sources.get(asset.id).content;
    assert.equal(sha(readFileSync(new URL(asset.path, root))), asset.sha256, asset.id);
    assert.equal(sha(readFileSync(new URL(source.images.scene, feature))), asset.sha256, asset.id);
    const illustration = gallery.illustrations.find(entry => entry.sha256 === asset.sha256 && entry.houseIds.includes(asset.id));
    const house = gallery.houses.find(entry => entry.id === asset.id);
    assert.ok(illustration, asset.id);
    assert.ok(house?.illustrationIds.includes(illustration.id), asset.id);
    assert.equal(sha(readFileSync(new URL(illustration.image, root))), asset.sha256, asset.id);
  }
  for (const [id, { content }] of sources) {
    for (const image of Object.values(createHousePageData(content).images)) {
      if (!image.src) continue;
      assert.doesNotMatch(image.src, /^(?:https?:|data:|file:)/i, id);
      assert.ok(existsSync(new URL(image.src, feature)), `${id}: ${image.src}`);
    }
    assert.ok(existsSync(new URL(biographies.get(id).image, tree)), id);
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

test('alle elf Quellarchive bleiben unverändert; Genealogie wird nur über das bestehende Iframe eingebunden', () => {
  assert.ok(fixture.records.every(record => !record.hadBiography));
  for (const previous of fixture.records) {
    const { url, content } = sources.get(previous.id);
    const archive = ['animexx-source-2026-11-03.html', 'animexx-original.html']
      .map(file => new URL(file, url)).find(file => existsSync(file));
    assert.ok(archive, previous.id);
    assert.equal(sha(readFileSync(archive)), previous.sourceArchiveSha256, previous.id);
    for (const key of ['persons', 'partnerships', 'parentages', 'timeJumps']) {
      assert.equal(Object.hasOwn(content, key), false, `${previous.id}: keine eingebetteten Graphdaten`);
    }
    assert.doesNotMatch(content.sections.familyTree || '', /<img|https?:\/\/|data:image/i, previous.id);
  }
});
