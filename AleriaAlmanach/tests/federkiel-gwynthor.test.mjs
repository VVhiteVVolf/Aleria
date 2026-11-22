import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';
import { federkielRegistrations } from '../modules/federkiel-gwynthor/federkiel-module.mjs';
import { FEDERKIEL_BANNKREIS_COURIERS } from '../modules/federkiel-gwynthor/federkiel-couriers.mjs';
import { FEDERKIEL_SECTION, FEDERKIEL_GUILD_ID } from '../modules/federkiel-gwynthor/federkiel-section.mjs';
import { projectGwynthorSections } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';

const root = new URL('../../', import.meta.url);
const almanac = new URL('AleriaAlmanach/', root);
const [guild, ...places] = federkielRegistrations().map(({ entry }) => entry);
const entries = [guild, ...places];
const pages = entries.flatMap(entry => entry.pages);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

test('Federkiel is one category inside Gwynthor-Stadt next to the two guild markets', async () => {
  const neighbors = ['Der Markt der Fortuna - Gwynthor', 'Die Klingende Münze - Gwynthor']
    .map(key => ({ tab: FEDERKIEL_SECTION.tab, key, path: ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Gwynthor', key], entries: [] }));
  const context = vm.createContext({ SECTIONS: neighbors.slice() });
  const script = await readFile(new URL('modules/federkiel-gwynthor/federkiel-data.js', almanac), 'utf8');
  vm.runInContext(script, context);
  vm.runInContext(script, context);
  const sections = projectGwynthorSections(context.SECTIONS);
  assert.equal(sections.length, 3);
  assert.deepEqual(sections[2].path, ['Cenyr', 'Celtigerns Wacht', 'Llamreis Ankunft', 'Bannkreis Gwynthor', 'Gwynthor-Stadt', 'Gilde Federkiel - Gwynthor']);
  assert.deepEqual(Array.from(sections[2].entries, entry => entry.id), entries.map(entry => entry.id));
  for (const section of sections.slice(0, 2)) assert.deepEqual(section.path.slice(0, -1), sections[2].path.slice(0, -1));
  assert.equal(sections[2].iconUrl, FEDERKIEL_SECTION.iconUrl);
});

test('the general module has no session and each workplace owns its hierarchy and session', async () => {
  assert.equal(guild.id, FEDERKIEL_GUILD_ID);
  assert.equal(guild.pages.length, 3);
  assert.ok(guild.pages.every(page => !page.sessionPage));
  assert.equal(new Set(pages.map(page => page.commentThreadKey)).size, 13);
  for (const entry of places) {
    assert.deepEqual(entry.pages.map(page => [!!page.hierarchyPage, !!page.sessionPage]), [[true, false], [false, true]]);
    assert.match(guild.pages[0].description, new RegExp(`entry=${entry.id}"`));
    const cast = entry.pages[1].sessionCast || [];
    assert.deepEqual(cast, entry.id.endsWith('-kurierstation') ? FEDERKIEL_BANNKREIS_COURIERS.map(person => person.id) : []);
  }
  const guildLeads = guild.pages.find(page => page.hierarchyPage).hierarchy.trees[0].levels.at(-1).nodes;
  assert.deepEqual(guildLeads.map(lead => lead.title), places.map(place => place.pages[0].hierarchy.trees[0].levels[0].nodes[0].title));
  assert.ok(entries.every(entry => entry.sessionCast.length === 0));

  const questCatalog = await readJson('AleriaAlmanach/modules/quests/quest-catalog.json');
  assert.deepEqual(questCatalog.scenes.filter(row => row.id.startsWith(FEDERKIEL_GUILD_ID) && row.id.includes('::session:')).map(row => row.id),
    places.map(entry => `${entry.id}::session:${entry.pages[1].commentThreadKey}`));
});

test('three supervised four-place rows use exactly the same Postkurier role', () => {
  const station = places.find(entry => entry.id.endsWith('-kurierstation'));
  const [dispatch, stables] = station.pages[0].hierarchy.trees;
  const [lead, ...levels] = dispatch.levels;
  assert.equal(lead.nodes[0].title, 'Leitung der Kurierstation');
  assert.equal(stables.parentTreeId, dispatch.id);
  const crews = levels.filter((_, index) => index % 2 === 1);
  const supervisors = levels.filter((_, index) => index % 2 === 0);
  assert.deepEqual(supervisors.map(level => level.nodes.map(node => node.title)), Array.from({ length: 3 }, () => ['Staffelführung']));
  assert.deepEqual(supervisors.map(level => level.startsGroup), [false, true, true]);
  assert.deepEqual(crews.map(level => [level.columns, level.nodes.length]), [[4, 4], [4, 4], [4, 4]]);
  const couriers = crews.flatMap(level => level.nodes);
  assert.equal(new Set(couriers).size, 12);
  assert.deepEqual(new Set(couriers.map(node => node.title)), new Set(['Postkurier']));
  assert.equal(new Set(couriers.map(node => node.text)).size, 1);
  assert.deepEqual(crews[1].nodes.map(node => node.subtitle), FEDERKIEL_BANNKREIS_COURIERS.map(person => person.name));
  assert.deepEqual(crews[1].nodes.map(node => node.portrait), FEDERKIEL_BANNKREIS_COURIERS.map(person => person.portrait));
  const otherCouriers = [...crews[0].nodes, ...crews[2].nodes];
  assert.ok(otherCouriers.every(node => !node.subtitle && node.portrait.endsWith('/silhouette-postkurier-v1.webp')));
});

test('all pages use distinct illustrations, all display images are cataloged and the originals are retained', async () => {
  const [manifest, portraits] = await Promise.all([
    readJson('AleriaAlmanach/assets/federkiel-gwynthor/manifest.json'),
    readJson('AleriaAlmanach/assets/federkiel-gwynthor/couriers/manifest.json')
  ]);
  const sourceHash = async path => createHash('sha256').update(await readFile(new URL(path, root))).digest('hex');
  const services = guild.pages.find(page => page.guildServicesPage).guildServices.services;
  assert.deepEqual(services.map(service => service.title), ['Einen Brief verschicken', 'Am Schreibplatz selbst schreiben', 'Einen Brief diktieren', 'Post vorlesen lassen', 'Briefe an einer Station abholen', 'Nachrichten über Land schicken']);
  assert.equal(new Set(pages.map(page => page.image)).size, 13);
  const roles = pages.filter(page => page.hierarchyPage).flatMap(page => page.hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes)));
  const assetUrl = path => path.startsWith('/') ? new URL(path.slice(1), root).href : new URL(path, almanac).href;
  const usedImages = new Set([FEDERKIEL_SECTION.iconUrl, ...entries.map(entry => entry.symbol), ...pages.map(page => page.image),
    ...services.map(service => service.icon), ...roles.map(role => role.portrait)].map(assetUrl));
  assert.equal(manifest.images.length, 25);
  assert.equal(portraits.images.length, 4);
  const images = [...manifest.images, ...portraits.images];
  assert.deepEqual(usedImages, new Set(images.map(image => new URL(image.path, root).href)));
  await Promise.all(images.map(async image => {
    assert.equal(await sourceHash(image.path), image.sha256);
    assert.equal(await sourceHash(image.original), image.originalSha256);
    assert.equal(shouldPublish(image.path), true);
    assert.equal(shouldPublish(image.original), false);
  }));
  const factions = await readJson('Fraktionen/data/gilden.json');
  assert.equal(factions.entries.find(entry => entry.id === 'federkiel').symbol, guild.symbol.replace('../Fraktionen/', ''));
});
