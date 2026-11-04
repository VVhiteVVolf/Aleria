import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { normalizeFamily, validateFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { SONNENKUESTE_HOUSE_PROFILES } from '../../Stammbäume/assets/js/data/sonnenkueste-house-profiles.js';
import { HOUSE_CAERWEN_FAMILY, HOUSE_NERWYNN_FAMILY } from '../../Stammbäume/assets/js/data/jungferntal-knight-houses.js';
import { houseRankLabel } from '../../Kontinente/modules/territory-directory/house-rank.mjs';
import { HOUSE_RANKS } from '../modules/house-content/house-ranks.generated.mjs';
import { createHouseBiography, createHousePageData } from '../modules/house-content/house-content-outputs.mjs';
import { reviewedGraphFingerprint } from './house-lore-reviewed-expectations.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';
import { collectHouses } from '../../Gallerien/krieger/scripts/house-catalog.mjs';
import { collectIllustrations } from '../../Gallerien/krieger/scripts/illustration-catalog.mjs';
import { mergeScopedCatalog } from '../../Gallerien/krieger/scripts/scoped-catalog.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const treeRoot = new URL('Stammbäume/', root);
const houseRoot = new URL('Estryll/Cenyr/Sonnenkueste/', feature);
const readJson = url => JSON.parse(readFileSync(url, 'utf8'));
// This public regional baseline contains no private dossiers or private fixtures.
const before = readJson(new URL('diagnostics/sonnenkueste-house-pages-20261103/before.json', root));
const baselineById = new Map(before.map(record => [record.id, record]));
const retainedLineIds = new Set(['haus-morforwyn-linie-elimue', 'haus-morforwyn-linie-marmue']);
const newIds = ['haus-caerwen', 'haus-nerwynn'];
const expectedIds = [...before.map(record => record.id).filter(id => !retainedLineIds.has(id)), ...newIds].sort();
const jungferntalKnights = ['haus-rhelian', 'haus-aelryn', ...newIds];
const originalImageIds = new Set(['haus-illewod', 'haus-teyrngarch', 'haus-blach', 'haus-llwynog',
  'haus-illwath', 'haus-morforwyn', 'haus-nic-riordain', 'haus-grianlaoch']);
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
  return entry.isDirectory() ? walk(url) : [url];
});
const sourceModules = walk(houseRoot).filter(url => url.pathname.endsWith('/haus.content.mjs'));
const sources = new Map(await Promise.all(sourceModules.map(async url => {
  const { HOUSE_CONTENT: content } = await import(url);
  return [content.id, { content, url }];
})));
const records = new Map(FAMILY_REGISTRY.filter(record => record.folderPath?.[0] === 'Cenyr'
  && record.folderPath?.[1] === 'Sonnenküste').map(record => [record.id, record]));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const graph = family => Object.fromEntries(graphKeys.map(key => [key, family[key]]));
const normalizedGraph = family => Object.fromEntries(graphKeys.map(key => [key,
  family[key].map(entry => ({ ...entry, extensions: entry.extensions || {} }))]));
const courtEntries = content => [content.founder, ...content.heads, ...content.heirs,
  ...content.offices, ...content.figures].filter(Boolean);
const registryContext = { window: {} };
vm.runInNewContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
const registry = registryContext.window.HaeuserRegistry;
const relativeSitePath = url => decodeURIComponent(url.pathname).slice(decodeURIComponent(root.pathname).length);

test('28 Sonnenküsten-Hausseiten verwenden die bestehenden IDs und ihre eigenen Stammbaum-Iframes', () => {
  assert.equal(before.length, 28, '26 Häuser und die beiden erhaltenen Morforwyn-Nebenlinien');
  assert.equal(expectedIds.length, 28);
  assert.equal(sourceModules.length, 28);
  assert.deepEqual([...sources.keys()].sort(), expectedIds);
  for (const { content, url } of sources.values()) {
    const record = records.get(content.id);
    assert.ok(record, content.id);
    assert.equal(content.registerPage, true, content.id);
    assert.equal(registry.byId(content.id)?.status, 'active', content.id);
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
    const oldRevision = baselineById.get(content.id)?.sourceRevision
      ?? (content.id === 'haus-caerwen' ? HOUSE_CAERWEN_FAMILY : HOUSE_NERWYNN_FAMILY).extensions.sourceRevision;
    assert.ok(content.biographySourceRevision >= oldRevision + 1, `${content.id}: spätere belegte Revisionen bleiben möglich`);
  }
  for (const id of retainedLineIds) {
    assert.ok(records.has(id), `${id}: Nebenakte bleibt erhalten`);
    assert.equal(sources.has(id), false, `${id}: keine doppelte große Hausseite`);
  }
});

test('alle 28 gesicherten Familiengraphen einschließlich beider Nebenlinien bleiben bytegleich', () => {
  for (const baseline of before) {
    const record = records.get(baseline.id);
    assert.ok(record, baseline.id);
    assert.equal(sha256(JSON.stringify(graph(record.family))),
      reviewedGraphFingerprint(baseline.id, baseline.graphFingerprint), baseline.id);
  }
  for (const id of ['haus-rhelian', 'haus-aelryn']) {
    assert.equal(records.get(id).title, baselineById.get(id).title, `${id}: vorhandenen Namen erhalten`);
    assert.equal(records.get(id).id, id);
  }
});

test('die beiden neu beauftragten Jungferntal-Häuser bilden gültige benannte Familien über drei Generationen', () => {
  for (const authored of [HOUSE_CAERWEN_FAMILY, HOUSE_NERWYNN_FAMILY]) {
    const id = authored.document.id, registered = records.get(id)?.family;
    assert.ok(registered, id);
    assert.equal(baselineById.has(id), false, `${id}: eigenständige neue Akte`);
    assert.deepEqual(graph(registered), graph(authored), id);
    assert.deepEqual(validateFamily(registered).diagnostics.filter(entry => entry.severity === 'error'), [], id);
    assert.equal(new Set(registered.persons.map(person => person.worldPersonId)).size, registered.persons.length, id);
    assert.ok(registered.persons.every(person => person.name && !/unbekannt|platzhalter/i.test(person.name)), id);
    assert.ok(registered.parentages.some(edge => registered.parentages.some(parentEdge => edge.parentIds.includes(parentEdge.childId))),
      `${id}: Großeltern, Eltern und Kinder`);
    assert.equal(registered.document.houseProfile.liegeHouseId, 'haus-morforwyn', id);
    assert.equal(registered.lineage.crestFrame, 'silver', id);
  }
});

test('Jungferntals vier Ritterhäuser dienen Morforwyn und erscheinen ausschließlich auf der Jungferntal-Seite', async () => {
  for (const id of jungferntalKnights) {
    const profile = records.get(id)?.houseProfile;
    assert.equal(profile?.rankId, 'knight', id);
    assert.equal(profile?.liegeHouseId, 'haus-morforwyn', id);
    assert.equal(profile?.barony, 'Jungferntal', id);
    assert.equal(profile?.seat, 'Carngol', id);
    const content = sources.get(id)?.content;
    assert.ok(content, id);
    assert.match(content.liege, /Morforwyn/, id);
    assert.match(decodeURIComponent(content.territoryHref), /Baronie Jungferntal\/Baronie Jungferntal\.html$/, id);
  }
  const context = { window: {} };
  vm.runInNewContext(readFileSync(new URL('Kontinente/assets/js/herrschaft-data.js', root), 'utf8'), context);
  const previousData = globalThis.ALERIA_HERRSCHAFT_DATA;
  const urls = walk(new URL('Kontinente/Estryll/Königreich Cenyr/Grafschaft Sonnenküste/', root))
    .filter(url => url.pathname.endsWith('.data.mjs'));
  let pages;
  try {
    globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
    pages = await Promise.all(urls.map(async url => ({ url, page: (await import(url)).default })));
  } finally {
    if (previousData === undefined) delete globalThis.ALERIA_HERRSCHAFT_DATA;
    else globalThis.ALERIA_HERRSCHAFT_DATA = previousData;
  }
  const placements = new Map(jungferntalKnights.map(id => [id, []]));
  for (const { url, page } of pages) {
    const cards = page.view.familySections.flatMap(section => section.cards);
    for (const card of cards.filter(card => placements.has(card.id))) {
      placements.get(card.id).push(decodeURIComponent(url.pathname));
      const href = new URL(card.href, 'https://aleria.example/');
      assert.equal(href.searchParams.get('haus'), card.id, card.id);
      assert.match(decodeURIComponent(href.pathname), /^\/Familien Häuser und Clans\/(?:haus|kleinehaeuser)\.html$/, card.id);
    }
  }
  for (const [id, paths] of placements) {
    assert.equal(paths.length, 1, `${id}: genau eine örtliche Hauskarte`);
    assert.match(paths[0], /Baronie Jungferntal\/baronie\.data\.mjs$/, id);
  }
});

test('aktuelle Ränge, Sitze und Hierarchien haben Vorrang vor kopierten alten Infotabellen', () => {
  for (const { content } of sources.values()) {
    const profile = SONNENKUESTE_HOUSE_PROFILES[content.id.slice(5)];
    assert.ok(profile, content.id);
    assert.equal(content.profile.seat, profile.seat, content.id);
    assert.equal(content.county, profile.county, content.id);
    for (const name of [profile.kingdom, profile.county, profile.barony, profile.seat].filter(Boolean)) {
      assert.ok(content.hierarchy.some(entry => entry.name === name), `${content.id}: ${name}`);
    }
    assert.ok(existsSync(new URL(content.territoryHref, feature)), content.id);
  }
  const nic = sources.get('haus-nic-riordain').content;
  assert.equal(SONNENKUESTE_HOUSE_PROFILES['nic-riordain'].rankId, 'dun-tiarna');
  assert.match(nic.profile.rank || nic.profile.highestTitle, /D[uú]n[ -]Tiarna/i);
  assert.match(HOUSE_RANKS['haus-nic-riordain'], /D[uú]n[ -]Tiarna/i);
  assert.equal(houseRankLabel(sources.get('haus-morforwyn').content.profile.rank), 'Baronenhaus');
  assert.equal(houseRankLabel(sources.get('haus-illewod').content.profile.highestTitle), 'Grafenhaus');
});

test('Personenkarten verwenden echte Identitäten und kanonische Portraits; Ulfrik bleibt ohne erfundenen Link', () => {
  for (const { content } of sources.values()) {
    for (const member of courtEntries(content)) {
      if (!member.id) continue;
      const canonical = FAMILY_REGISTRY.find(record => record.id === member.familyId)?.family.persons
        .find(person => person.id === member.id);
      assert.ok(canonical, `${content.id}: ${member.familyId}/${member.id}`);
      assert.equal(member.name, canonical.name, `${content.id}: ${member.id}`);
      if (member.image && canonical.portrait) {
        assert.equal(new URL(member.image, feature).href, new URL(canonical.portrait, treeRoot).href,
          `${content.id}: ${member.id}`);
      }
    }
    assert.doesNotMatch(JSON.stringify([content.sections, content.figures]),
      /〈Platzhalter|Titel hier einfügen|Dialog von Figur|Beschreibung \.\.\.|tumblr_otwjgn/i, content.id);
  }
  const ulfrik = sources.get('haus-illewod').content.offices.find(member => member.name === 'Ulfrik');
  assert.equal(ulfrik?.role, 'Kommandant der Garde');
  assert.equal(Boolean(ulfrik.id), false);
  assert.equal(Boolean(ulfrik.familyId), false);
});

test('Militärstatistiken fehlen in Hausprofil, Bio und sämtlichen redaktionellen Texten', () => {
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|hundert|tausend)';
  const militaryAmount = new RegExp(`\\b${quantity}\\s+(?:Mann|Rittern?|(?:Waffen)?knecht(?:e|en)?|Stadtwach(?:e|en)|Soldat(?:en)?|Kriegern?|Galeer(?:e|en)|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  for (const { content } of sources.values()) {
    const page = createHousePageData(content), biography = createHouseBiography(content);
    assert.deepEqual(page.hiddenProfileGroups, ['military'], content.id);
    for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(page.profile[key], '', `${content.id}: ${key}`);
    assert.ok(!biography.stats.some(([label]) => /Truppen|Mannstärke|Waffenknechte|Stadtwache|Flotte/i.test(label)), content.id);
    const prose = [...Object.values(page.sections), ...Object.values(content.biographySummary),
      ...content.trivia, ...courtEntries(content).map(member => member.description || '')].join('\n');
    assert.doesNotMatch(prose, militaryAmount, content.id);
    assert.doesNotMatch(prose, /(?:Truppenstärke|Gesamtaufgebot|Flottenstärke|Mannstärke)\s*[:=]?\s*\d/iu, content.id);
  }
});

test('Bio-Upgrades erhalten eigene Graphbearbeitungen, eigene Hausbios und bewusst entfernte Hausbios', () => {
  for (const { content } of sources.values()) {
    const registered = records.get(content.id).family, local = structuredClone(registered);
    local.extensions.sourceRevision = baselineById.get(content.id)?.sourceRevision ?? 1;
    delete local.extensions.houseBiographyModule;
    local.persons[0].name = 'Eigene Personenbearbeitung';
    local.persons[0].notes = 'Eigene unveränderte Notiz';
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
      assert.equal(result.persons[0].name, 'Eigene Personenbearbeitung', content.id);
      assert.equal(result.persons[0].notes, 'Eigene unveränderte Notiz', content.id);
    }
  }
});

test('acht Originalbilder und 20 aktive neue Hausbilder sind lokal, eigenständig und in der Galerie richtig zugeordnet', () => {
  const catalog = readJson(new URL('Gallerien/krieger/data/catalog.json', root));
  const originals = [], generated = [], hashes = new Set();
  for (const { content } of sources.values()) {
    const page = createHousePageData(content), biography = createHouseBiography(content);
    for (const image of Object.values(page.images)) {
      if (!image.src) continue;
      assert.doesNotMatch(image.src, /^(?:https?:|data:|file:)/i, content.id);
      assert.ok(existsSync(new URL(image.src, feature)), `${content.id}: ${image.src}`);
    }
    assert.ok(existsSync(new URL(biography.image, treeRoot)), content.id);
    const digest = sha256(readFileSync(new URL(content.images.scene, feature)));
    hashes.add(digest);
    (originalImageIds.has(content.id) ? originals : generated).push(content.id);
    if (originalImageIds.has(content.id)) assert.match(content.images.scene, /hausdarstellung-original\.png$/, content.id);
    const illustration = catalog.illustrations.find(entry => entry.sha256 === digest);
    assert.ok(illustration?.houseIds.includes(content.id), content.id);
    assert.ok(catalog.houses.find(house => house.id === content.id)?.illustrationIds.includes(illustration.id), content.id);
  }
  assert.equal(originals.length, 8);
  assert.equal(generated.length, 20);
  assert.equal(hashes.size, 28, 'kein gemeinsames Ersatzbild für verschiedene Häuser');
});

test('der reale begrenzte Galerieabgleich erhält sämtliche fremden Häuser und Bilder', async () => {
  const current = readJson(new URL('Gallerien/krieger/data/catalog.json', root));
  const scope = new Set(expectedIds);
  const houseIds = [...scope];
  const collected = collectHouses(root, { houseIds });
  const selection = readJson(new URL('Gallerien/krieger/data/selection.json', root));
  const illustrations = await collectIllustrations(root, collected, selection, { houseIds });
  const updated = mergeScopedCatalog(current, { houses: collected.houses, illustrations }, houseIds);
  for (const house of current.houses.filter(house => !scope.has(house.id))) {
    assert.deepEqual(updated.houses.find(entry => entry.id === house.id), house, house.id);
  }
  for (const image of current.illustrations.filter(image => !image.houseIds.some(id => scope.has(id)))) {
    assert.deepEqual(updated.illustrations.find(entry => entry.id === image.id), image, image.id);
  }
});

test('Originalarchive sind hashprüfbar und bleiben mit Diagnosematerial außerhalb der statischen Auslieferung', () => {
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
  for (const file of ['before.json', 'gallery-before.json']) {
    assert.equal(shouldPublish(`diagnostics/sonnenkueste-house-pages-20261103/${file}`), false);
  }
});
