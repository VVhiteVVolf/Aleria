import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { WEIDEBUCHT_HOUSE_PROFILES } from '../../Stammbäume/assets/js/data/weidebucht-house-profiles.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { createHousePageData, createHouseBiography } from '../modules/house-content/house-content-outputs.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const genealogy = new URL('Stammbäume/', root);
const readJson = url => JSON.parse(readFileSync(url, 'utf8'));
const fixture = readJson(new URL('fixtures/weidebucht-house-pages-initial-review.json', import.meta.url));
const reviewById = new Map(fixture.records.map(record => [record.id, record]));
const familyById = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const definitions = [
  ['wylan', 'Melwas_Au/Haus_Wylan'], ['dinefwr', 'Melwas_Au/Haus_Dinefwr'],
  ['mochdaer', 'Melwas_Au/Haus_Mochdaer'], ['tir-addawol', 'Hochweide/Haus_Tir_Addawol'],
  ['hwyaden', 'Borkenstein/Haus_Hwyaden'], ['creyr', 'Dunstholm/Haus_Creyr'],
  ['tannau', 'Melwas_Au/Haus_Tannau'], ['asyn', 'Melwas_Au/Haus_Asyn'],
  ['fhaire', 'Antike_Haeuser/Clan_Ua_Fhaire'], ['trisceil', 'Antike_Haeuser/Clan_Ui_Trisceil'],
].map(([slug, folder]) => ({ id: `haus-${slug}`, slug,
  directory: new URL(`Estryll/Cenyr/Weidebucht/${folder}/`, feature) }));
const loaded = await Promise.all(definitions.map(async row => {
  const url = new URL('haus.content.mjs', row.directory);
  return existsSync(url) ? { ...row, content: (await import(url)).HOUSE_CONTENT } : row;
}));
const rows = loaded.filter(row => row.content);
const sha256 = value => createHash('sha256').update(value).digest('hex');
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const graph = family => Object.fromEntries(graphKeys.map(key => [key, family[key]]));
const normalizedGraph = family => Object.fromEntries(graphKeys.map(key => [key,
  family[key].map(entry => ({ ...entry, extensions: entry.extensions || {} }))]));
const registry = { window: {} };
vm.runInNewContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registry);
const members = content => [content.founder, ...(content.heads || []), ...(content.heirs || []),
  ...(content.offices || []), ...(content.figures || [])].filter(Boolean);
const localPath = (src, base) => new URL(src.startsWith('/') ? `.${src}` : src, src.startsWith('/') ? root : base);
const checkImage = (src, base, label) => {
  assert.ok(src, `${label}: missing image`);
  assert.doesNotMatch(src, /^(?:https?:|data:|file:)/, `${label}: external image`);
  assert.ok(existsSync(localPath(src, base)), `${label}: ${src}`);
};

test('all ten Weidebucht pages use existing IDs, registered templates and matching generated biographies', () => {
  assert.equal(rows.length, 10, `Missing modules: ${loaded.filter(row => !row.content).map(row => row.id).join(', ')}`);
  assert.deepEqual(new Set(rows.map(row => row.content.id)), new Set(definitions.map(row => row.id)));
  assert.deepEqual(new Set(reviewById.keys()), new Set(definitions.map(row => row.id)));
  for (const { id, directory, content } of rows) {
    assert.equal(content.id, id);
    assert.ok(familyById.has(id), id);
    const entry = registry.window.HaeuserRegistry.byId(id);
    assert.equal(entry?.status, 'active', id);
    assert.equal(entry.page, content.page || 'haus.html', id);
    const generated = { window: {} };
    vm.runInNewContext(readFileSync(new URL('haus.data.js', directory), 'utf8'), generated);
    assert.deepEqual(JSON.parse(JSON.stringify(generated.window.HAEUSER_DATA)), createHousePageData(content), id);
    const bio = createHouseBiography(content);
    assert.deepEqual(familyById.get(id).family.extensions.houseBiographyModule, bio, id);
    const document = new URL(bio.house.documents[0].link, genealogy);
    assert.equal(document.searchParams.get('haus'), id);
    assert.ok(existsSync(new URL(document.pathname, document)), id);
  }
});

test('existing genealogies stay untouched and are embedded through mode=view instead of copied source tables', () => {
  for (const { id, directory, content } of rows) {
    const family = familyById.get(id).family, before = structuredClone(graph(family));
    const page = createHousePageData(content);
    createHouseBiography(content);
    assert.deepEqual(graph(family), before, id);
    const frame = new URL(page.familyTreeEmbed.src, feature);
    assert.equal(frame.pathname, new URL('Stammbaum.html', genealogy).pathname, id);
    assert.equal(frame.searchParams.get('family'), id);
    assert.equal(frame.searchParams.get('mode'), 'view');
    const manifest = readJson(new URL('source-manifest.json', directory));
    assert.equal(manifest.genealogy.imported, false, id);
    assert.equal(manifest.genealogy.familyId, id);
    assert.equal(manifest.genealogy.existingGraphUnchanged, true, id);
    for (const name of ['Hierarchie', 'Stammbaum']) assert.ok(manifest.genealogy.ignoredSourceSections.includes(name), `${id}: ${name}`);
    assert.doesNotMatch(String(content.sections.familyTree || ''), /<table|<iframe|tumblr_otwjgn/i, id);
  }
});

test('military profiles and copied troop or fleet numbers are excluded', () => {
  for (const { id, content } of rows) {
    const page = createHousePageData(content), bio = createHouseBiography(content);
    assert.equal(content.omitMilitaryProfile, true, id);
    assert.deepEqual(page.hiddenProfileGroups, ['military']);
    for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(page.profile[key], '', `${id}: ${key}`);
    assert.ok(!bio.stats.some(([label]) => /Truppen|Mannstärke|Waffenknechte|Stadtwache|Flotte/i.test(label)), id);
    const prose = JSON.stringify([content.sections, content.biographySummary, content.trivia]);
    assert.doesNotMatch(prose, /\b(?:[1-9]\d{2,}|\d{1,3}(?:\.\d{3})+)\s*(?:Mann\b|Krieger|Waffenknechte|Stadtwachen|Kriegsschiffe|Ritter\b)/i, id);
    assert.doesNotMatch(prose, /\b\d+\s+Kriegsschiffe\b/i, id);
  }
});

test('canonical Weidebucht ranks, seats and territorial hierarchy outrank obsolete infotables', () => {
  const titles = { county: /Graf/, barony: /Baron/, 'knight-prince': /Ritterfürst/, commoner: /Bürger/,
    laird: /Laird/i, 'mor-tiarna': /Mor\s+Tiarna/i };
  for (const { id, slug, content } of rows) {
    const profile = WEIDEBUCHT_HOUSE_PROFILES[slug];
    assert.equal(content.profile.seat, profile.seat || '', id);
    assert.equal(content.county, profile.county, id);
    const hierarchy = content.hierarchy.map(entry => entry.name);
    for (const name of [profile.kingdom, profile.county, profile.barony, profile.seat].filter(Boolean)) assert.ok(hierarchy.includes(name), `${id}: ${name}`);
    if (profile.liegeHouseId) assert.equal(content.parentHouseId, profile.liegeHouseId, id);
    assert.match(content.profile.highestTitle, titles[profile.rankId], id);
    if (content.territoryHref) assert.ok(existsSync(localPath(content.territoryHref, feature)), `${id}: territory`);
    if (id === 'haus-mochdaer') {
      assert.equal(content.name, "Haus Mochdaer O'Cerrigarth");
      assert.equal(content.profile.seat, 'Cerrigarth');
    }
    if (id === 'haus-tannau') assert.equal(content.type, 'Bürgerliches Haus');
    if (['haus-fhaire', 'haus-trisceil'].includes(id)) assert.equal(content.type, 'Clan');
  }
});

test('person cards and founder roles come from existing canonical people rather than empty examples or incidental titles', () => {
  for (const { id, content } of rows) {
    for (const member of members(content)) {
      const family = familyById.get(member.familyId)?.family;
      assert.ok(member.id && family?.persons.some(person => person.id === member.id), `${id}: ${member.id}`);
      assert.doesNotMatch(member.name || '', /^(?:Name|Figur|Gründer|Gründerin|Nicht benannt)\s*$/i, id);
    }
    for (const member of createHousePageData(content).court.groups.flatMap(group => group.entries)) {
      const link = new URL(member.href, feature);
      assert.equal(link.searchParams.get('mode'), 'view', id);
      const family = familyById.get(link.searchParams.get('family'))?.family;
      assert.ok(family?.persons.some(person => person.id === link.searchParams.get('person')), `${id}: ${member.href}`);
    }
    assert.doesNotMatch(JSON.stringify([content.sections, content.figures]), /Titel hier einfügen|Beschreibung \.\.\.|Dialog von Figur|tumblr_otwjgn/i, id);
  }
  const byId = new Map(rows.map(row => [row.id, row.content]));
  if (!byId.size) return;
  assert.equal(byId.get('haus-dinefwr').founder.id, 'beynon-tarw-dinefwr');
  assert.equal(byId.get('haus-tir-addawol').founder.id, 'eynon-tarw-dinefwr');
  const trisceil = byId.get('haus-trisceil');
  assert.notEqual(trisceil.founder?.id, 'melwas-wylan');
  assert.ok(!trisceil.figures.some(person => person.id === 'melwas-wylan' && /Gründer/.test(person.role || '')));
  const asyn = byId.get('haus-asyn');
  assert.doesNotMatch(String(asyn.currentHead || ''), /Tudwal/i);
  const currentHead = createHouseBiography(asyn).stats.find(([label]) => label === 'Oberhaupt')?.[1] || '';
  assert.doesNotMatch(currentHead, /Tudwal/i, 'The last historical head is not a current ruler');
});

test('all active images resolve locally and the nine supplied warrior originals retain their exact bytes', () => {
  assert.equal(fixture.records.filter(record => record.originalSceneSha256).length, 9);
  for (const { id, content } of rows) {
    const page = createHousePageData(content), bio = createHouseBiography(content);
    for (const image of Object.values(page.images)) if (image.src) checkImage(image.src, feature, id);
    checkImage(content.images.scene, feature, `${id}: main illustration`);
    for (const entry of content.warriorGallery?.entries || []) {
      for (const src of [entry.src, entry.image, entry.imageSrc].filter(value => typeof value === 'string')) checkImage(src, feature, `${id}: gallery`);
    }
    for (const src of [bio.image, bio.house.crestImage, ...bio.house.connections.map(entry => entry.image)].filter(Boolean)) checkImage(src, genealogy, `${id}: biography`);
    const originalHash = reviewById.get(id).originalSceneSha256;
    if (originalHash) assert.equal(sha256(readFileSync(localPath(content.images.scene, feature))), originalHash, `${id}: original artwork replaced`);
    assert.ok(shouldPublish(`Familien Häuser und Clans/${content.images.scene}`), id);
  }
});

test('the ten exact source archives and provenance manifests stay outside static delivery', () => {
  for (const { id, directory } of rows) {
    const manifest = readJson(new URL('source-manifest.json', directory));
    const expected = reviewById.get(id).source;
    assert.equal(manifest.source.attachmentId, expected.attachmentId, id);
    assert.equal(manifest.source.file, 'animexx-source-2026-11-03.html', id);
    assert.equal(manifest.source.sha256, expected.sha256, id);
    assert.equal(sha256(readFileSync(new URL(manifest.source.file, directory))), expected.sha256, id);
    const prefix = decodeURIComponent(directory.pathname).split('/Familien Häuser und Clans/')[1];
    for (const name of [manifest.source.file, 'source-manifest.json']) assert.equal(shouldPublish(`Familien Häuser und Clans/${prefix}${name}`), false, `${id}: ${name}`);
    for (const name of ['haus.data.js', 'haus.biography.mjs']) assert.equal(shouldPublish(`Familien Häuser und Clans/${prefix}${name}`), true, `${id}: ${name}`);
  }
});

test('real biography upgrades preserve later genealogy edits, authored biography text and explicit deletion', () => {
  // Historical graph fingerprints are only for the initial import audit.
  // Future canonical genealogy editing is verified through the actual upgrader.
  for (const { id, content } of rows) {
    const registered = familyById.get(id).family, edited = structuredClone(registered);
    edited.extensions.sourceRevision = Math.max(0, Number(registered.extensions.sourceRevision || 1) - 1);
    delete edited.extensions.houseBiographyModule;
    if (edited.persons.length) edited.persons[0].name = 'Eigene Personenbearbeitung';
    const normalized = normalizeFamily(edited), upgraded = resolveRegisteredFamilyUpgrade(registered, edited);
    assert.deepEqual(normalizedGraph(upgraded), normalizedGraph(normalized), id);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, createHouseBiography(content), id);
    for (const own of [null, { ...structuredClone(createHouseBiography(content)), description: 'Eigene Hausgeschichte', commentSequence: [{ text: 'Eigene Notiz' }] }]) {
      edited.extensions.houseBiographyModule = own;
      const result = resolveRegisteredFamilyUpgrade(registered, edited);
      assert.deepEqual(result.extensions.houseBiographyModule, own, id);
      if (edited.persons.length) assert.equal(result.persons[0].name, 'Eigene Personenbearbeitung', id);
    }
  }
});

test('real Weidebucht territory cards link all ten families directly to their matching registered house pages', async () => {
  const context = { window: {} };
  for (const file of ['kontinente.registry.js', 'assets/js/herrschaft-data.js']) vm.runInNewContext(readFileSync(new URL(`Kontinente/${file}`, root), 'utf8'), context);
  const entries = context.window.KONTINENTE_REGISTRY.filter(entry => entry.page.includes('Grafschaft Weidebucht/'));
  const previousData = globalThis.ALERIA_HERRSCHAFT_DATA;
  let pages;
  try {
    globalThis.ALERIA_HERRSCHAFT_DATA = context.window.ALERIA_HERRSCHAFT_DATA;
    pages = await Promise.all(entries.map(async entry => (await import(new URL(`Kontinente/${entry.data}`, root))).default));
  } finally {
    if (previousData === undefined) delete globalThis.ALERIA_HERRSCHAFT_DATA;
    else globalThis.ALERIA_HERRSCHAFT_DATA = previousData;
  }
  const expectedIds = new Set(definitions.map(row => row.id));
  const cards = pages.flatMap(page => page.view.familySections.flatMap(section => section.cards)).filter(card => expectedIds.has(card.id));
  assert.deepEqual(new Set(cards.map(card => card.id)), expectedIds);
  for (const card of cards) {
    const entry = registry.window.HaeuserRegistry.byId(card.id);
    const link = new URL(card.href, 'https://aleria.example/');
    assert.equal(decodeURIComponent(link.pathname), `/Familien Häuser und Clans/${entry.page}`, card.id);
    assert.equal(link.searchParams.get('haus'), card.id);
    assert.ok(existsSync(localPath(link.pathname, root)), `${card.id}: ${card.href}`);
  }
});
