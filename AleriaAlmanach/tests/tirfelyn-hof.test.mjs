import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';
import { HOF_STAFF, HOF_HOUSING } from '../../shared/tirfelyn-hof/hof-residents.mjs';
import { HOF_POIS, HOF_MAPPED_POIS } from '../../shared/tirfelyn-hof/hof-pois.mjs';
import { HOF_ANIMALS } from '../../shared/tirfelyn-hof/hof-animals.mjs';
import { HOF_AREAS, HOF_SCENE_RELOCATIONS, hofAreaFor } from '../../shared/tirfelyn-hof/hof-areas.mjs';
import { buildLandfamilienEntries } from '../modules/gwynthor-landfamilien/landfamilien-module.mjs';
import { buildHofCharacterExports } from '../modules/tirfelyn-hof/hof-characters.mjs';
import { getBuiltinCreatureTemplates } from '../modules/creatures/creature-catalog.js';
import { projectBuiltinTradeModule } from '../scripts/scene-trade/scene-trade-builtin-projection.mjs';

const root = new URL('../../', import.meta.url);
const readJson = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));

test('every farm place is an independently addressable scene and the two original threads survive', () => {
  const [entry, helfaen, marchwern] = buildLandfamilienEntries();
  const farmEntries = buildLandfamilienEntries().filter(entry => entry.id.startsWith('tirfelyn-hof'));
  assert.equal(farmEntries.length, 7);
  assert.equal(entry.pages.length, 15);
  assert.equal(farmEntries.flatMap(entry => entry.pages.filter(page => page.sessionPage)).length, 37);
  assert.deepEqual(entry.pages.slice(4, 6).map(page => page.commentThreadKey), ['tirfelyn-szene-aussen', 'tirfelyn-szene-wohnstube']);
  assert.equal(new Set(farmEntries.flatMap(entry => entry.pages.map(page => page.commentThreadKey))).size, 49);
  assert.deepEqual(HOF_AREAS.flatMap(area => area.poiKeys).sort(), HOF_POIS.map(poi => poi.key).sort());
  assert.deepEqual(farmEntries.map(entry => entry.pages.length), [15, 4, 3, 3, 5, 10, 9]);
  for (const poi of HOF_POIS) {
    const owner = farmEntries.find(entry => entry.id === hofAreaFor(poi).id);
    const page = owner.pages.find(page => page.commentThreadKey === `tirfelyn-hof-poi-${poi.key}`);
    assert.equal(page.sessionPage, true, poi.title);
    assert.equal(page.image, poi.image);
    assert.match(page.sessionIntro, /karte.html\?map=/);
    assert.equal(page.sessionIntro.includes('&amp;pin='), HOF_MAPPED_POIS.includes(poi));
    assert.deepEqual(page.sessionDateAleria, { year: null, month: null, day: null });
  }
  for (const neighbour of [helfaen, marchwern]) {
    assert.equal(neighbour.pages.length, 6);
    assert.equal(neighbour.pages.filter(page => page.sessionPage).length, 2);
  }
});

test('the hierarchy includes every family member, all twelve new residents and exactly three dogs', () => {
  const entry = buildLandfamilienEntries()[0];
  const nodes = entry.pages[1].hierarchy.trees.flatMap(tree => tree.levels.flatMap(level => level.nodes));
  assert.equal(nodes.length, 31);
  assert.equal(new Set(nodes.map(node => node.title)).size, 31);
  for (const person of [...HOF_STAFF, ...HOF_ANIMALS]) {
    const node = nodes.find(node => node.title === person.name);
    assert.equal(node.portrait, person.portrait);
    assert.ok(node.text.includes(person.bio));
    assert.ok(entry.sessionCast.includes(person.id));
  }
  assert.ok(!nodes.some(node => node.title === 'Ceridwen Tirfelyn'));
  assert.equal(entry.sessionCast.length, 31);
  assert.equal(new Set(entry.sessionCast).size, 31);
});

test('six cottages and two woodcutters houses assign every new resident exactly once', () => {
  assert.equal(HOF_HOUSING.filter(home => home.id.startsWith('bedienstetenhuette-')).length, 6);
  assert.equal(HOF_HOUSING.length, 9);
  for (const person of HOF_STAFF) {
    const homes = HOF_HOUSING.filter(home => Array.isArray(home.residents) && home.residents.includes(person.key));
    assert.equal(homes.length, 1, person.name);
    assert.equal(homes[0].id, person.residenceId);
    assert.ok(HOF_POIS.some(poi => poi.key === homes[0].id));
    assert.ok(!/\s/.test(person.name), person.name);
  }
  assert.deepEqual(HOF_HOUSING.find(home => home.id === 'bedienstetenhuette-04').residents, ['meirig', 'gwenneth', 'iorfin', 'eifor']);
});

test('the actual database contains the twelve new identities with a portrait, short bio and Gwynthor placement', async () => {
  const snapshot = await readJson('CharakterDatenbank/generated/characters.snapshot.json');
  const exports = buildHofCharacterExports();
  for (const person of HOF_STAFF) {
    const character = snapshot.characters.find(character => character.id === person.id);
    assert.ok(character, person.name);
    assert.equal(character.name, person.name);
    assert.equal(character.portrait, person.portrait);
    assert.ok(character.bio.includes(person.bio));
    assert.ok(JSON.stringify(character.biography).includes(person.bio));
    assert.equal(character.localRecord.authoredFeature, 'tirfelyn-hof-20261115');
    assert.equal(exports.find(entry => entry.character.id === person.id).assignedTab, 'Gwynthor');
  }
});

test('the native creature register has one Ponter and two Bugail with real breed links and collective ownership', () => {
  const animals = getBuiltinCreatureTemplates().filter(creature => HOF_ANIMALS.some(animal => animal.id === creature.id));
  assert.equal(animals.length, 3);
  assert.deepEqual(animals.map(animal => animal.species), ['Ponter', 'Bugail', 'Bugail']);
  for (const animal of animals) {
    assert.equal(animal.bestiaryReference.id, `tiere/vieh/haustiere/hunde/${animal.species.toLowerCase()}`);
    assert.equal(animal.classification.location, 'Gwynthor');
    assert.equal(animal.classification.house, 'Familie Tirfelyn');
    assert.equal(animal.itemOrigin, null);
    assert.ok(animal.biography.facts.some(fact => fact.label === 'Besitz' && fact.value === 'Familie Tirfelyn'));
  }
});

test('every selected scene, dog and staff portrait has an actual separate 2:3 PNG', async () => {
  const images = [...HOF_POIS.map(poi => poi.image), ...HOF_ANIMALS.map(animal => animal.portrait), ...HOF_STAFF.map(person => person.portrait)];
  assert.equal(images.length, 50);
  assert.equal(new Set(images).size, 50);
  for (const path of images) {
    const bytes = await readFile(new URL(path.slice(1), root));
    assert.equal(bytes.subarray(1, 4).toString(), 'PNG', path);
    assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2, path);
  }
});

test('real thread routing makes each map scene link resolve to its intended page', async () => {
  const context = vm.createContext({});
  vm.runInContext(await readFile(new URL('../modules/comments/comments-routing.js', import.meta.url), 'utf8'), context);
  for (const entry of buildLandfamilienEntries()) for (const page of entry.pages.filter(page => page.sessionPage)) {
    const thread = context.getSessionThreadId(entry.id, context.getPageCommentThreadKey(page, entry.pages.indexOf(page)));
    assert.equal(context.parseCommentThreadLocation(thread).pageKey, page.commentThreadKey);
  }
});

test('old scene links resolve only to their unique relocated page and current pages take precedence', async () => {
  const entries = buildLandfamilienEntries(), sections = [{ entries }];
  const context = vm.createContext({ getPages: entry => entry.pages });
  vm.runInContext(await readFile(new URL('../modules/comments/comments-routing.js', import.meta.url), 'utf8'), context);
  assert.equal(HOF_SCENE_RELOCATIONS.length, 28);
  for (const relocation of HOF_SCENE_RELOCATIONS) {
    const target = context.findCommentThreadDestination(relocation.oldThreadId, sections);
    assert.equal(target.entry.id, relocation.entryId);
    assert.equal(target.threadId, relocation.threadId);
    assert.equal(context.getCommentThreadForPage(target.entry.pages[target.pageIndex], target.entry, target.pageIndex).threadId, relocation.threadId);
  }
  const oldId = HOF_SCENE_RELOCATIONS[0].oldThreadId;
  const duplicate = structuredClone(entries.find(entry => entry.id === HOF_SCENE_RELOCATIONS[0].entryId));
  duplicate.id = 'unrelated-copy';
  assert.equal(context.findCommentThreadDestination(oldId, [...sections, { entries: [duplicate] }]).entry.id, HOF_SCENE_RELOCATIONS[0].entryId,
    'Cloning a module cannot claim the original destination aliases');
  duplicate.commentThreadAliases = duplicate.commentThreadAliases.map(alias => ({ ...alias, to: alias.to.replace(HOF_SCENE_RELOCATIONS[0].entryId, duplicate.id) }));
  assert.equal(context.findCommentThreadDestination(oldId, [...sections, { entries: [duplicate] }]), null);
  const legacy = { id: 'tirfelyn-hof', pages: [{ sessionPage: true, commentThreadKey: 'tirfelyn-hof-poi-holzfaellerlager' }] };
  assert.equal(context.findCommentThreadDestination(oldId, [...sections, { entries: [legacy] }]).entry, legacy);
  assert.equal(context.findCommentThreadDestination('unrelated::session:tirfelyn-hof-poi-holzfaellerlager', sections), null);
});

test('the existing server projection retains every expanded scene without manufacturing merchant offers', () => {
  for (const entry of buildLandfamilienEntries()) {
  const projection = projectBuiltinTradeModule(entry, { tab: 'Völker & Kulturen', path: ['Tirfelyn-Hof'] });
  assert.deepEqual(projection.entry.pages.filter(page => page.sessionPage).map(page => page.commentThreadKey),
    entry.pages.filter(page => page.sessionPage).map(page => page.commentThreadKey));
  assert.ok(!projection.entry.pages.some(page => page.tradeCatalogPage || page.goodsTablePage));
  }
});
