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

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const before = JSON.parse(readFileSync(new URL('diagnostics/silberinsel-house-pages-20261103/before.json', root), 'utf8'));
const walk = directory => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const url = new URL(`${entry.name}${entry.isDirectory() ? '/' : ''}`, directory);
  return entry.isDirectory() ? walk(url) : [url];
});
const modules = walk(new URL('Estryll/Cenyr/Silberinsel/', feature))
  .filter(url => url.pathname.endsWith('/haus.content.mjs'));
const sources = new Map(await Promise.all(modules.map(async url => {
  const { HOUSE_CONTENT: content } = await import(url);
  return [content.id, { content, url }];
})));
const records = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const baselineById = new Map(before.map(entry => [entry.id, entry]));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const graph = family => Object.fromEntries(graphKeys.map(key => [key, family[key]]));
// Normalization supplies empty entry extensions without changing the graph.
const normalizedGraph = family => Object.fromEntries(graphKeys.map(key => [key,
  family[key].map(entry => ({ ...entry, extensions: entry.extensions || {} }))]));
const registryContext = vm.createContext({ window: {} });
vm.runInContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);

test('Alle 18 Silberinsel-Häuser haben aktive Hausseite, Hausbio und das eigene kanonische Iframe', () => {
  assert.equal(sources.size, 18);
  assert.deepEqual([...sources.keys()].sort(), [...baselineById.keys()].sort());
  for (const { content, url } of sources.values()) {
    const record = records.get(content.id);
    const page = createHousePageData(content);
    const bio = createHouseBiography(content);
    const registered = registryContext.window.HaeuserRegistry.byId(content.id);
    assert.equal(registered?.status, 'active', content.id);
    assert.equal(content.registerPage, true, content.id);
    assert.equal(content.biographySourceRevision, baselineById.get(content.id).sourceRevision + 1, content.id);
    const tree = new URL(page.familyTreeEmbed.src, feature);
    assert.equal(tree.pathname, new URL('Stammbäume/Stammbaum.html', root).pathname, content.id);
    assert.equal(tree.searchParams.get('family'), content.id);
    assert.equal(tree.searchParams.get('mode'), 'view');
    const generated = { window: {} };
    vm.runInNewContext(readFileSync(new URL('haus.data.js', url), 'utf8'), generated);
    assert.deepEqual(JSON.parse(JSON.stringify(generated.window.HAEUSER_DATA)), page, content.id);
    assert.deepEqual(record?.family.extensions.houseBiographyModule, bio, content.id);
    const backLink = new URL(bio.house.documents[0].link, new URL('Stammbäume/', root));
    assert.equal(backLink.searchParams.get('haus'), content.id);
  }
});

test('Alle 18 bestehenden Stammbäume bleiben gegenüber dem gesicherten Graphbestand unverändert', () => {
  assert.equal(before.length, 18);
  for (const baseline of before) {
    const record = records.get(baseline.id);
    assert.ok(record, baseline.id);
    assert.equal(sha256(JSON.stringify(graph(record.family))), baseline.graphFingerprint, baseline.id);
  }
});

test('Das Bio-Upgrade erhält eigene Personenbearbeitungen, eigene Hausbios und bewusst gelöschte Bios', () => {
  for (const { content } of sources.values()) {
    const record = records.get(content.id);
    const local = structuredClone(record.family);
    local.extensions.sourceRevision = baselineById.get(record.id).sourceRevision;
    delete local.extensions.houseBiographyModule;
    local.persons[0].name = 'Eigene Personenbearbeitung';
    local.persons[0].notes = 'Eigene unveränderte Personennotiz';
    const expected = normalizeFamily(local);
    const upgraded = resolveRegisteredFamilyUpgrade(record.family, local);
    assert.equal(sha256(JSON.stringify(normalizedGraph(upgraded))),
      sha256(JSON.stringify(normalizedGraph(expected))), record.id);
    assert.equal(upgraded.extensions.houseBiographyModule.pageTitle, content.name);
    const customBio = structuredClone(record.family.extensions.houseBiographyModule);
    customBio.description = 'Eigene Hausgeschichte';
    customBio.house.biographyText = 'Eigener ausführlicher Text';
    customBio.commentSequence = [{ text: 'Eigene Notiz' }];
    for (const custom of [null, customBio]) {
      local.extensions.houseBiographyModule = custom;
      const result = resolveRegisteredFamilyUpgrade(record.family, local);
      assert.deepEqual(result.extensions.houseBiographyModule, custom, record.id);
      assert.equal(result.persons[0].name, 'Eigene Personenbearbeitung', record.id);
      assert.equal(result.persons[0].notes, 'Eigene unveränderte Personennotiz', record.id);
    }
  }
});

test('Sämtliche Bilder und Gebietsrücklinks sind lokal; Personenlinks verwenden vorhandene Identitäten', () => {
  for (const { content } of sources.values()) {
    const page = createHousePageData(content);
    for (const image of Object.values(page.images)) {
      if (!image.src) continue;
      assert.doesNotMatch(image.src, /^(?:https?:)?\/\//, content.id);
      assert.ok(existsSync(new URL(image.src, feature)), `${content.id}: ${image.src}`);
    }
    assert.ok(existsSync(new URL(content.territoryHref, feature)), `${content.id}: ${content.territoryHref}`);
    for (const member of [content.founder, ...content.heads, ...content.heirs,
      ...content.offices, ...content.figures].filter(Boolean)) {
      if (!member.id) continue;
      assert.ok(records.get(member.familyId)?.family.persons.some(person => person.id === member.id),
        `${content.id}: ${member.familyId}/${member.id}`);
    }
    assert.doesNotMatch(JSON.stringify(page), /Gelieferte Stammbaumgrafik|〈Platzhalter|Titel hier einfügen|Dialog von Figur/);
  }
});

test('Die Hausseiten enthalten weder Militärprofile noch übernommene militärische Mengenangaben', () => {
  const quantity = '(?:\\d[\\d.,\\u00a0]*(?:\\s+\\d+)*|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwanzig|hundert|tausend)';
  const militaryAmount = new RegExp(`\\b${quantity}\\s+(?:Mann|Rittern?|(?:Waffen)?knecht(?:e|en)?|Stadtwach(?:e|en)|Soldat(?:en)?|Kriegern?|Galeer(?:e|en)|Kriegsschiff(?:e|en)?)\\b`, 'iu');
  for (const { content } of sources.values()) {
    const page = createHousePageData(content);
    assert.deepEqual(page.hiddenProfileGroups, ['military'], content.id);
    for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) {
      assert.equal(page.profile[key], '', `${content.id}: ${key}`);
    }
    const prose = [...Object.values(page.sections), ...Object.values(content.biographySummary)].join('\n');
    assert.doesNotMatch(prose, militaryAmount, content.id);
    assert.doesNotMatch(prose, /(?:Truppenstärke|Gesamtaufgebot|Flottenstärke|Mannstärke)\s*[:=]?\s*\d/iu, content.id);
  }
});

test('Canwyll und Tiwna behalten ihre kanonischen Hausränge; Tir An Muirghin wird nicht für ausgestorben erklärt', () => {
  for (const [id, expected] of [['haus-canwyll', 'Ritterfürstenhaus'], ['haus-tiwna', 'Baronenhaus']]) {
    const { content } = sources.get(id);
    assert.equal(houseRankLabel(content.profile.rank || content.profile.highestTitle), expected, id);
    assert.equal(houseRankLabel(HOUSE_RANKS[id]), expected, id);
  }
  const tir = sources.get('haus-tir-an-muirghin').content;
  assert.equal(tir.extinct, false);
  assert.ok(!createHouseBiography(tir).stats.some(([label, value]) => label === 'Status' && /ausgestorben/i.test(value)));
});

test('Die Galerie ordnet alle 18 aktiven Hauptbilder ihren bestehenden Silberinsel-Häusern zu', () => {
  const catalog = JSON.parse(readFileSync(new URL('Gallerien/krieger/data/catalog.json', root), 'utf8'));
  for (const { content } of sources.values()) {
    const hash = sha256(readFileSync(new URL(content.images.scene, feature)));
    const illustration = catalog.illustrations.find(image => image.sha256 === hash);
    assert.ok(illustration?.houseIds.includes(content.id), content.id);
    assert.ok(catalog.houses.find(house => house.id === content.id)?.illustrationIds.includes(illustration.id), content.id);
  }
});

test('Quellenarchive bleiben außerhalb der statischen Auslieferung; aktive PNGs und erzeugte Ausgaben bleiben verfügbar', () => {
  for (const { content, url } of sources.values()) {
    const directory = decodeURIComponent(url.pathname).split('/Familien Häuser und Clans/')[1]
      .replace(/haus\.content\.mjs$/, '');
    const original = `Familien Häuser und Clans/${directory}animexx-original.html`;
    assert.equal(shouldPublish(original), false, original);
    const archiveNames = /^(?:animexx-original\.html|quellen\.json|sources\.json|source-manifest\.json|image-generation(?:-v\d+)?\.json|REDAKTION\.md|SOURCE_DECISIONS\.md)$/;
    for (const file of walk(new URL('./', url)).filter(file => archiveNames.test(file.pathname.split('/').at(-1)))) {
      const relative = decodeURIComponent(file.pathname).split('/Familien Häuser und Clans/')[1];
      assert.equal(shouldPublish(`Familien Häuser und Clans/${relative}`), false, relative);
    }
    const scene = `Familien Häuser und Clans/${content.images.scene}`;
    assert.match(scene, /\.png$/i, content.id);
    assert.equal(shouldPublish(scene), true, scene);
    for (const filename of ['haus.data.js', 'haus.biography.mjs']) {
      const generated = `Familien Häuser und Clans/${directory}${filename}`;
      assert.ok(existsSync(new URL(filename, url)), generated);
      assert.equal(shouldPublish(generated), true, generated);
    }
  }
});
