import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { buildGwynthorMarketplace, MARKETPLACE_ID, MARKETPLACE_SECTION } from '../modules/gwynthor-marktplatz/marketplace-module.mjs';
import { GWYNTHOR_CITY_PATH, projectGwynthorSections } from '../modules/gwynthor-geography/gwynthor-section-layout.mjs';
import { MARKETPLACE_ART_BRIEFS } from '../modules/gwynthor-marktplatz/marketplace-art.mjs';
import { shouldPublish } from '../../netlify/build/site-publish.mjs';

const root = new URL('../../', import.meta.url);
const entry = buildGwynthorMarketplace();

test('bundled registration stays in the city and retains existing module objects and scene keys', async () => {
  const source = await readFile(new URL('../modules/gwynthor-marktplatz/marketplace-data.js', import.meta.url), 'utf8');
  const saved = { ...structuredClone(entry), title: 'Eigene gespeicherte Fassung' };
  const other = { id: 'unrelated-module', title: 'Unverändert' };
  for (const initial of [[], [{ ...MARKETPLACE_SECTION, entries: [] }], [
    { tab: MARKETPLACE_SECTION.tab, path: ['Eigener alter Abschnitt'], entries: [saved, other] }
  ]]) {
    const context = vm.createContext({ SECTIONS: initial });
    vm.runInContext(source, context);
    vm.runInContext(source, context);
    const projected = projectGwynthorSections(context.SECTIONS);
    const sections = projected.filter(section => section.entries.some(item => item.id === MARKETPLACE_ID));
    assert.equal(sections.length, 1);
    assert.deepEqual([...sections[0].path], GWYNTHOR_CITY_PATH);
    assert.equal(sections[0].entries.filter(item => item.id === MARKETPLACE_ID).length, 1);
    if (initial.some(section => section.entries.includes(other))) {
      assert.equal(sections[0].entries.find(item => item.id === MARKETPLACE_ID), saved);
      assert.equal(initial[0].entries[0], other);
    }
  }
});

test('actual scene routing survives POI reordering and supplies eight independent transition destinations', async () => {
  const context = vm.createContext({
    getValidSections: () => [{ ...MARKETPLACE_SECTION, entries: [entry] }], getRenderableEntry: value => value,
    getPages: value => value.pages
  });
  for (const file of ['comments/comments-routing.js', 'scene-transition/scene-transition-state.js']) {
    vm.runInContext(await readFile(new URL(`../modules/${file}`, import.meta.url), 'utf8'), context);
  }
  const original = context.getSceneTransitionEndpoints();
  assert.equal(original.length, 8);
  assert.equal(new Set(original.map(endpoint => endpoint.threadId)).size, 8);
  const reordered = structuredClone(entry);
  reordered.pages = [reordered.pages[0], ...reordered.pages.slice(1).reverse()];
  context.getValidSections = () => [{ ...MARKETPLACE_SECTION, entries: [reordered] }];
  const after = context.getSceneTransitionEndpoints();
  for (const before of original) {
    assert.equal(after.find(endpoint => endpoint.pageTitle === before.pageTitle).threadId, before.threadId);
    const location = context.parseCommentThreadLocation(before.threadId);
    assert.equal(location.kind, 'session');
    assert.equal(location.baseEntryId, entry.id);
    assert.ok(entry.pages.some(page => page.commentThreadKey === location.pageKey));
  }
});

test('importable package matches the registered module while production serves artwork without generator archives', async () => {
  const exported = JSON.parse(await readFile(new URL('Charakter Archiv Exporte/Module/Gwynthor Marktplatz/gwynthor-marktplatz-2026-11-01.json', root), 'utf8'));
  assert.deepEqual(exported.module.entry, entry);
  assert.deepEqual(exported.module.section.path, GWYNTHOR_CITY_PATH);
  const results = JSON.parse(await readFile(new URL('AleriaAlmanach/assets/gwynthor-marktplatz/image-results.json', root), 'utf8'));
  assert.equal(results.images.length, MARKETPLACE_ART_BRIEFS.length);
  for (const image of MARKETPLACE_ART_BRIEFS) {
    const original = await readFile(new URL(image.original, root));
    const active = await readFile(new URL(image.destination, root));
    const result = results.images.find(item => item.id === image.id);
    assert.equal(original.readUInt32BE(16) * 3, original.readUInt32BE(20) * 2);
    assert.equal(createHash('sha256').update(original).digest('hex'), result.originalSha256);
    assert.equal(createHash('sha256').update(active).digest('hex'), result.sha256);
    assert.equal(shouldPublish(image.destination), true);
    assert.equal(shouldPublish(image.original), false);
  }
  assert.equal(shouldPublish('AleriaAlmanach/assets/gwynthor-marktplatz/image-prompts.json'), false);
});
