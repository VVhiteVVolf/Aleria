import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { HOUSE_DRAIG_FAMILY } from '../../Stammbäume/assets/js/data/house-draig-family.js';
import { DRAIG_HOUSEHOLDS, DRAIG_WINGS, CASTELL_NODE_ID, RESIDENTIAL_NODE_ID } from '../modules/castell-draig-rooms/wing-households.mjs';
import { reviewDraigOccupants, planDraigWingExpansion } from '../modules/castell-draig-rooms/wing-layout.mjs';
import { loadDraigWingReview } from '../modules/castell-draig-rooms/wing-source.mjs';
import { isAuthoringArchive } from '../../netlify/build/publication-policy.mjs';

const entry = JSON.parse(await readFile(new URL('../assets/castell-draig/wohnfluegel-2026-11-02/module-before.json', import.meta.url), 'utf8')).entry;
const review = await loadDraigWingReview();
const manifest = { version: 5, moduleSectionNodes: [{ id: CASTELL_NODE_ID, title: 'Castell Draig' }, { id: 'other-node', title: 'Anderer Ort' }],
  customSections: [{ nodeId: CASTELL_NODE_ID, entryIds: ['other-castle-module', entry.id] }, { nodeId: 'other-node', entryIds: ['foreign'] }],
  moduleNodeAssignments: { foreign: 'other-node' }, moduleSectionMoves: { foreign: { nodeId: 'other-node' } },
  hiddenModuleIds: { private: true }, arbitraryFutureField: { keep: [1, 2, 3] } };
const artwork = Object.fromEntries([...DRAIG_HOUSEHOLDS.map(room => room.id), 'familienstube'].map(id => [id, `https://example.test/${id}.png`]));
const plan = () => planDraigWingExpansion({ entry, manifest, review, artwork });

test('32 living Draigs each occur once; Owain and only his descendants are excluded', () => {
  assert.equal(review.livingDraigs, 32);
  assert.equal(new Set(review.people.map(person => person.personId)).size, review.people.length);
  for (const id of ['owain-draig', 'amadia-draig', 'rhygifarch-draig', 'rollo-draig', 'siana-draig', 'iolo-draig']) {
    assert(review.excludedIds.includes(id)); assert(!review.people.some(person => person.personId === id));
  }
  assert(review.people.some(person => person.personId === 'myriad-draig'));
});

test('a death correction stops publication rather than assigning a dead resident', () => {
  const family = structuredClone(HOUSE_DRAIG_FAMILY);
  family.persons.find(person => person.id === 'trahern-draig').status = 'dead';
  assert.throws(() => reviewDraigOccupants(family, review.people), /Unzulässiger Bewohner/);
});

test('six wings are direct children of Wohntrakte and every household owns a module', () => {
  const result = plan();
  assert.equal(result.entries.length, 36);
  assert.equal(result.sections.length, 7);
  const nodes = result.manifest.moduleSectionNodes.filter(node => node.parentId === RESIDENTIAL_NODE_ID);
  assert.equal(nodes.length, DRAIG_WINGS.length);
  assert.equal(result.sections.flatMap(section => section.entryIds).length, new Set(result.entries.map(entry => entry.id)).size);
  for (const section of result.sections) for (const id of section.entryIds) assert.equal(result.manifest.moduleNodeAssignments[id], section.nodeId);
});

test('Gawain keeps the full original scene, date and module identity', () => {
  const gawain = plan().entries.find(module => module.id === entry.id);
  assert.deepEqual(gawain.pages, [entry.pages.find(page => page.commentThreadKey === 'wohntrakte-gawain')]);
  assert.deepEqual(gawain.pages[0].sessionDateAleria, { year: 1740, month: 3, day: 10 });
});

test('all eight existing room scenes and illustrations survive unchanged', () => {
  const result = plan();
  for (const page of entry.pages.filter(page => page.commentThreadKey.startsWith('wohntrakte-'))) {
    const copied = result.entries.flatMap(module => module.pages).find(candidate => candidate.commentThreadKey === page.commentThreadKey);
    assert.deepEqual(copied, page);
  }
  assert.equal(result.movedEmptyThreads.length, 7);
});

test('unrelated manifest data and input objects remain unchanged', () => {
  const before = structuredClone({ entry, manifest, review, artwork });
  const result = plan();
  assert.deepEqual({ entry, manifest, review, artwork }, before);
  for (const key of ['hiddenModuleIds', 'moduleSectionMoves', 'arbitraryFutureField']) assert.deepEqual(result.manifest[key], manifest[key]);
  assert.deepEqual(result.manifest.customSections.find(section => section.nodeId === 'other-node'), manifest.customSections[1]);
  assert.equal(result.manifest.moduleNodeAssignments.foreign, 'other-node');
  assert.deepEqual(result.manifest.customSections[0].entryIds, ['other-castle-module']);
});

test('guest allocation and ambiguous Egon do not overwrite identities or residence', () => {
  assert.equal(review.guestHouseholds.length, 5);
  assert.deepEqual(review.unlinkedCharacterPersons, ['egon-gafyr']);
  assert(!plan().entries.find(entry => entry.id === 'castell-draig-gemach-alicyn-egon').pages[0].sessionCast.includes('wg5NZfmiGgGYxgPdc89u'));
});

test('missing artwork and repeated publication fail before mutation', () => {
  assert.throws(() => planDraigWingExpansion({ entry, manifest, review, artwork: {} }), /Bild.*fehlt/);
  assert.throws(() => planDraigWingExpansion({ entry, manifest: plan().manifest, review, artwork }), /bereits neu gegliedert/);
});

test('source originals and review records are excluded from static delivery', () => {
  assert(isAuthoringArchive('AleriaAlmanach/assets/castell-draig/wohnfluegel-2026-11-02/module-before.json'));
  assert(!isAuthoringArchive('AleriaAlmanach/public/assets/castell-draig/2026-11-02/wohnfluegel/trahern-v1.png'));
});
