import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import vm from 'node:vm';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { resolveRegisteredFamilyUpgrade } from '../../Stammbäume/assets/js/services/family-registry-upgrade.js';
import { normalizeFamily } from '../../Stammbäume/assets/js/domain/family-schema.js';
import { createHousePageData, createHouseBiography } from '../modules/house-content/house-content-outputs.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';
import { AEHRENTAL_HOUSE_PROFILES } from '../../Stammbäume/assets/js/data/aehrental-house-profiles.js';

const root = new URL('../../', import.meta.url);
const feature = new URL('../', import.meta.url);
const genealogy = new URL('Stammbäume/', root);
const readJson = url => JSON.parse(readFileSync(url, 'utf8'));
const initialReview = readJson(new URL('fixtures/aehrental-house-pages-initial-review.json', import.meta.url));
const definitions = [
  ['grawn', 'Tristams_Ebene/Haus_Grawn'], ['marchog', 'Tristams_Ebene/Haus_Marchog'],
  ['morcanhuc', 'Tristams_Ebene/Haus_Morcanhuc'], ['baedd', 'Eberkamm/Haus_Baedd'],
  ['ciarog', 'Graue_Bucht/Haus_Ciarog'], ['sgwarnog', 'Flusstal/Haus_Sgwarnog'],
  ['gwythiad', 'Tristams_Ebene/Haus_Gwythiad'], ['aroglyn', 'Tristams_Ebene/Haus_Aroglyn'],
  ['chiffyddlon', 'Ausgestorben/Haus_Chiffyddlon'], ['gwarchod', 'Ausgestorben/Haus_Gwarchod'],
  ['cruithenaech', 'Antike_Crannath_Clans/Clan_Cruithenaech'],
  ['warthog', 'Antike_Crannath_Clans/Clan_Warthog']
].map(([slug, folder]) => ({ id: `haus-${slug}`, slug,
  directory: new URL(`Estryll/Cenyr/Aehrental/${folder}/`, feature) }));
const loaded = await Promise.all(definitions.map(async definition => {
  const url = new URL('haus.content.mjs', definition.directory);
  return existsSync(url) ? { ...definition, content: (await import(url)).HOUSE_CONTENT } : definition;
}));
const rows = loaded.filter(row => row.content);
const familyById = new Map(FAMILY_REGISTRY.map(record => [record.id, record]));
const sha256 = value => createHash('sha256').update(value).digest('hex');
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const graph = family => Object.fromEntries(graphKeys.map(key => [key, family[key]]));
const normalizedGraph = family => Object.fromEntries(graphKeys.map(key => [key,
  family[key].map(entry => ({ ...entry, extensions: entry.extensions || {} }))]));
const registryContext = { window: {} };
vm.runInNewContext(readFileSync(new URL('haeuser.registry.js', feature), 'utf8'), registryContext);
const courtEntries = content => [content.founder, ...(content.heads || []), ...(content.heirs || []),
  ...(content.offices || []), ...(content.figures || [])].filter(Boolean);
const localImage = (src, base, label) => {
  assert.ok(src, `${label}: missing image`);
  assert.doesNotMatch(src, /^(?:https?:|data:|file:)/, `${label}: image must belong to the local site`);
  assert.ok(existsSync(new URL(src, base)), `${label}: ${src}`);
};

test('all twelve Ährental house pages retain the existing family IDs and mode=view iframe contract', () => {
  assert.equal(rows.length, 12, `Missing house content: ${loaded.filter(row => !row.content).map(row => row.id).join(', ')}`);
  assert.equal(new Set(rows.map(row => row.content.id)).size, 12);
  for (const { id, directory, content } of rows) {
    assert.equal(content.id, id);
    assert.ok(familyById.has(id), id);
    const page = createHousePageData(content), bio = createHouseBiography(content);
    const registered = registryContext.window.HaeuserRegistry.byId(id);
    assert.equal(registered?.status, 'active', id);
    const frame = new URL(page.familyTreeEmbed.src, feature);
    assert.equal(frame.pathname, new URL('Stammbaum.html', genealogy).pathname, id);
    assert.equal(frame.searchParams.get('family'), id);
    assert.equal(frame.searchParams.get('mode'), 'view');
    const generated = { window: {} };
    vm.runInNewContext(readFileSync(new URL('haus.data.js', directory), 'utf8'), generated);
    assert.deepEqual(JSON.parse(JSON.stringify(generated.window.HAEUSER_DATA)), page, id);
    assert.deepEqual(familyById.get(id).family.extensions.houseBiographyModule, bio, id);
    const link = new URL(bio.house.documents[0].link, genealogy);
    assert.equal(link.searchParams.get('haus'), id);
    assert.ok(existsSync(new URL(link.pathname, link)));
  }
});

test('source hierarchy and genealogy are never imported over the current family graphs', () => {
  assert.equal(initialReview.records.length, 12);
  assert.deepEqual(new Set(initialReview.records.map(record => record.id)), new Set(definitions.map(record => record.id)));
  // Initial graph hashes are retained only as review provenance. Later valid
  // genealogy edits must not require changing an unrelated house-page test.
  for (const { id, content } of rows) {
    const family = familyById.get(id).family, original = structuredClone(graph(family));
    createHousePageData(content); createHouseBiography(content);
    assert.deepEqual(graph(family), original, id);
  }
  for (const { id, directory, content } of rows) {
    const manifest = readJson(new URL('source-manifest.json', directory));
    assert.equal(manifest.genealogy.imported, false, id);
    assert.equal(manifest.genealogy.familyId, id);
    assert.equal(manifest.genealogy.existingGraphUnchanged, true);
    for (const section of ['Hierarchie', 'Stammbaum']) assert.ok(manifest.genealogy.ignoredSourceSections.includes(section), `${id}: ${section}`);
    assert.doesNotMatch(String(content.sections.familyTree || ''), /<table|<iframe|tumblr_otwjgn/i, id);
  }
});

test('military statistics are omitted from profiles, biography statistics and authored prose', () => {
  for (const { id, content } of rows) {
    const page = createHousePageData(content), bio = createHouseBiography(content);
    assert.equal(content.omitMilitaryProfile, true, id);
    assert.deepEqual(page.hiddenProfileGroups, ['military']);
    for (const key of ['troopStrength', 'tiarna', 'kerns', 'fleet']) assert.equal(page.profile[key], '', `${id}: ${key}`);
    assert.ok(!bio.stats.some(([label]) => /Truppen|Mannstärke|Waffenknechte|Stadtwache|Flotte/i.test(label)), id);
    const prose = JSON.stringify([content.sections, content.biographySummary, content.trivia]);
    assert.doesNotMatch(prose, /\b(?:[1-9]\d{2,}|\d{1,3}(?:\.\d{3})+)\s*(?:Krieger|Waffenknechte|Stadtwachen|Kriegsschiffe|Ritter\b)/i, id);
    assert.doesNotMatch(prose, /\b\d+\s+Kriegsschiffe\b/i, id);
  }
});

test('current seats, territorial hierarchy, ranks and extinct or ancient status outrank copied source tables', () => {
  const titles = { county: 'Graf', barony: 'Baron', 'knight-prince': 'Ritterfürst', knight: 'Ritterherr', commoner: 'Bürger' };
  for (const { id, content } of rows) {
    const profile = AEHRENTAL_HOUSE_PROFILES[id.replace(/^haus-/, '')];
    assert.equal(content.profile.seat, profile.seat || '', id);
    assert.equal(content.county, profile.county, id);
    const hierarchyNames = content.hierarchy.map(entry => entry.name);
    for (const name of [profile.kingdom, profile.county, profile.barony, profile.seat].filter(Boolean)) assert.ok(hierarchyNames.includes(name), `${id}: ${name}`);
    if (profile.liegeHouseId) assert.equal(content.parentHouseId, profile.liegeHouseId, id);
    if (titles[profile.rankId]) assert.match(content.profile.highestTitle, new RegExp(titles[profile.rankId]), id);
    else assert.match(content.profile.highestTitle || 'Offen', /offen|nicht vermerkt|nicht überliefert/i, id);
    if (['haus-chiffyddlon', 'haus-gwarchod'].includes(id)) assert.equal(content.extinct, true, id);
    if (['haus-cruithenaech', 'haus-warthog'].includes(id)) {
      assert.equal(content.type, 'Clan', id);
      assert.equal(profile.rankId, 'unknown', id);
    }
    if (id === 'haus-aroglyn') assert.equal(content.type, 'Bürgerliches Haus');
    if (id === 'haus-ciarog') assert.equal(content.profile.highestTitle, 'Ritterfürst');
    if (content.territoryHref) assert.ok(existsSync(new URL(content.territoryHref, feature)), `${id}: territory page`);
  }
});

test('portraits and court cards only link existing registered people instead of filling empty source examples', () => {
  for (const { id, content } of rows) {
    for (const member of courtEntries(content)) {
      assert.ok(member.id && member.familyId, `${id}: unbound named card ${member.name || member.role}`);
      const family = familyById.get(member.familyId)?.family;
      assert.ok(family?.persons.some(person => person.id === member.id), `${id}: ${member.id}`);
      assert.doesNotMatch(member.name || '', /^(?:Name|Figur|Gründer|Gründerin|Name hier|Nicht benannt)\s*$/i, id);
    }
    assert.doesNotMatch(JSON.stringify([content.sections, content.figures]), /⟨Platzhalter|Titel hier einfügen|Beschreibung \.\.\.|Dialog von Figur|tumblr_otwjgn/i, id);
  }
  const morcanhuc = rows.find(row => row.id === 'haus-morcanhuc').content;
  assert.equal(morcanhuc.founder.id, 'arthos-morcanhuc');
  assert.ok(morcanhuc.figures.some(person => person.id === 'arthos-morcanhuc'));
  assert.doesNotMatch(morcanhuc.founder.detail, /Gründergeneration/);
  assert.ok(!morcanhuc.figures.some(person => person.id === 'charlton-1685-morcanhuc'), 'Father of the founding generation is not the founder');
});

test('active house art, banners, crests and biography art all resolve locally', () => {
  for (const { id, content } of rows) {
    const page = createHousePageData(content), bio = createHouseBiography(content);
    for (const image of Object.values(page.images)) if (image.src) localImage(image.src, feature, id);
    localImage(content.images.scene, feature, `${id}: main illustration`);
    for (const entry of content.warriorGallery?.entries || []) for (const src of [entry.src, entry.image, entry.imageSrc].filter(value => typeof value === 'string')) localImage(src, feature, `${id}: gallery`);
    for (const src of [bio.image, bio.house.crestImage, ...bio.house.connections.map(entry => entry.image)].filter(Boolean)) localImage(src, genealogy, `${id}: biography`);
    assert.ok(shouldPublish(`Familien Häuser und Clans/${content.images.scene}`), id);
  }
});

test('original attachments remain byte-verifiable source archives and are not part of static delivery', () => {
  for (const { id, directory } of rows) {
    const manifest = readJson(new URL('source-manifest.json', directory));
    assert.equal(manifest.source.file, 'animexx-source-2026-11-03.html', id);
    const original = new URL(manifest.source.file, directory);
    assert.equal(sha256(readFileSync(original)), manifest.source.sha256, id);
    const prefix = decodeURIComponent(directory.pathname).split('/Familien Häuser und Clans/')[1];
    for (const name of [manifest.source.file, 'source-manifest.json']) assert.equal(shouldPublish(`Familien Häuser und Clans/${prefix}${name}`), false, `${id}: ${name}`);
    for (const name of ['haus.data.js', 'haus.biography.mjs']) assert.equal(shouldPublish(`Familien Häuser und Clans/${prefix}${name}`), true, `${id}: ${name}`);
  }
});

test('biography refresh preserves local graph edits, custom prose and explicit deletion', () => {
  for (const { id, content } of rows) {
    const registered = familyById.get(id).family, local = structuredClone(registered);
    local.extensions.sourceRevision = Math.max(0, Number(registered.extensions.sourceRevision || 1) - 1);
    delete local.extensions.houseBiographyModule;
    if (local.persons.length) local.persons[0].name = 'Eigene Personenbearbeitung';
    const normalized = normalizeFamily(local), upgraded = resolveRegisteredFamilyUpgrade(registered, local);
    assert.deepEqual(normalizedGraph(upgraded), normalizedGraph(normalized), id);
    assert.deepEqual(upgraded.extensions.houseBiographyModule, createHouseBiography(content), id);
    for (const own of [null, { ...structuredClone(createHouseBiography(content)), description: 'Eigene Hausgeschichte', commentSequence: [{ text: 'Eigene Notiz' }] }]) {
      local.extensions.houseBiographyModule = own;
      const result = resolveRegisteredFamilyUpgrade(registered, local);
      assert.deepEqual(result.extensions.houseBiographyModule, own, id);
      if (local.persons.length) assert.equal(result.persons[0].name, 'Eigene Personenbearbeitung', id);
    }
  }
});

test('territory house cards open each matching registered house page directly', async () => {
  const context = { window: {} };
  for (const file of ['kontinente.registry.js', 'assets/js/herrschaft-data.js']) {
    vm.runInNewContext(readFileSync(new URL(`Kontinente/${file}`, root), 'utf8'), context);
  }
  const entries = context.window.KONTINENTE_REGISTRY.filter(entry => entry.page.includes('Grafschaft Ährental/'));
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
  const cards = pages.flatMap(page => page.view.familySections.flatMap(section => section.cards))
    .filter(card => expectedIds.has(card.id));
  assert.deepEqual(new Set(cards.map(card => card.id)), expectedIds);
  for (const card of cards) {
    const registered = registryContext.window.HaeuserRegistry.byId(card.id);
    const link = new URL(card.href, 'https://aleria.example/');
    assert.equal(decodeURIComponent(link.pathname), `/Familien Häuser und Clans/${registered.page}`, card.id);
    assert.equal(link.searchParams.get('haus'), card.id);
    assert.ok(existsSync(new URL(`.${link.pathname}`, root)), `${card.id}: ${card.href}`);
  }
});
