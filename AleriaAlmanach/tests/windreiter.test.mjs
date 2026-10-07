import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import { buildWindreiter } from '../modules/windreiter/windreiter-model.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';

const root = new URL('../modules/windreiter/', import.meta.url);
const source = JSON.parse(readFileSync(new URL('sources/windreiter.json', root), 'utf8'));
const entries = [buildWindreiter(source)];
const strings = value => typeof value === 'string' ? [value] : value && typeof value === 'object' ? Object.values(value).flatMap(strings) : [];

test('Windreiter retains the source, its original emblems and every substantive text block', () => {
  assert.equal(createHash('sha256').update(readFileSync(new URL('sources/windreiter.html', root))).digest('hex'), source.sha256);
  const content = strings(entries[0]).join('\n');
  for (const block of source.blocks) assert(content.includes(block.html), block.text.slice(0, 80));
  assert.equal(source.images.length, 17);
  for (const item of source.images) {
    const file = new URL(`../../${item.file}`, root);
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), item.sha256);
  }
});

test('requested templates and distinct rank responsibilities are retained', () => {
  const pages = entries[0].pages;
  assert.equal(pages.length, 11);
  assert.equal(pages.filter(page => page.guildPage).length, 1);
  assert.equal(pages.filter(page => page.guildServicesPage).length, 1);
  assert.equal(pages.filter(page => page.hierarchyPage).length, 4);
  const ranks = pages.find(page => page.pageTitle.includes('Klassische')).hierarchy;
  assert.deepEqual(ranks.levels.flatMap(level => level.nodes.map(node => node.title)), ['Veteran', 'Beschützer', 'Windreiter', 'Rekrut']);
  assert.match(ranks.footerNote, /Ergänzender Rangentwurf/);
  assert.match(ranks.levels[1].nodes[0].text, /Wahlrecht/);
  for (const page of pages.filter(page => page.hierarchyPage)) {
    const trees = page.hierarchy.trees;
    assert.equal(new Set(trees.map(tree => tree.id)).size, trees.length);
    assert.equal(trees.filter(tree => !tree.parentTreeId).length, 1);
    for (const tree of trees) {
      const seen = new Set([tree.id]);
      let parent = tree.parentTreeId;
      while (parent) {
        assert(!seen.has(parent)); seen.add(parent);
        const ancestor = trees.find(candidate => candidate.id === parent);
        assert(ancestor); parent = ancestor.parentTreeId;
      }
    }
  }
});

test('builtin categories relocate existing entries without replacing edits or duplicating IDs', () => {
  const old = { id: 'drakenschluck-soeldner', title: 'Edited Drakenschluck', pages: [{ description: 'Existing user content' }] };
  const schwarzfische = { id: 'schwarzfische-windreiter', title: 'Die Schwarzen Fische', pages: [{ description: 'Existing Cynwrig lore', commentThreadKey: 'existing-comments' }] };
  const context = vm.createContext({ SECTIONS: [{ key: 'Söldner', tab: 'Söldner', entries: [old, schwarzfische, { id: 'unrelated' }] }] });
  const retinues = readFileSync(new URL('../modules/house-retinues/house-retinues-data.js', import.meta.url), 'utf8');
  const windreiter = readFileSync(new URL('windreiter-data.js', root), 'utf8');
  for (let repeat = 0; repeat < 2; repeat++) { vm.runInContext(retinues, context); vm.runInContext(windreiter, context); }
  const location = id => context.SECTIONS.find(section => section.entries.some(entry => entry.id === id));
  assert.equal(location(old.id).entries[0], old);
  assert.deepEqual(Array.from(location(old.id).path), ['Drakenschluck Söldner']);
  assert.deepEqual(Array.from(location('windreiter').path), ['Die Windreiter']);
  assert.deepEqual(Array.from(location('schwarzfische-windreiter').path), ['Die Windreiter', 'Estryll Banden', 'Die Schwarzen Fische']);
  assert.equal(location('schwarzfische-windreiter').entries[0], schwarzfische);
  assert.equal(location('unrelated').entries.length, 1);
  const ids = context.SECTIONS.flatMap(section => section.entries.map(entry => entry.id));
  assert.equal(new Set(ids).size, ids.length);
  const futurePath = ['Windreiter', 'Schwarzfische', 'Stollenbrüder', 'Spätere kleine Bande'];
  vm.runInContext(renderArchiveSectionRegistration('registerFutureBand', [{ tab: 'Söldner', path: futurePath, entry: { id: 'future-band' } }], 'test'), context);
  assert.deepEqual(Array.from(location('future-band').path), futurePath);
});

test('service data survives sanitation and ignores malformed or empty rows', () => {
  const context = vm.createContext({});
  vm.runInContext(readFileSync(new URL('../modules/guild-services/guild-services-data.js', import.meta.url), 'utf8'), context);
  context.input = entries[0].pages.find(page => page.guildServicesPage).guildServices;
  const clean = JSON.parse(JSON.stringify(vm.runInContext('sanitizeGuildServicesData(input)', context)));
  assert.deepEqual(clean, context.input);
  assert.equal(clean.services.length, 5);
  context.input = { services: [null, {}, { title: '  Dienst  ' }], title: null };
  const malformed = JSON.parse(JSON.stringify(vm.runInContext('sanitizeGuildServicesData(input)', context)));
  assert.equal(malformed.services.length, 1);
  assert.equal(malformed.services[0].title, 'Dienst');
  assert.equal(malformed.title, '');
});

test('all module image references exist and generated artwork has the requested format', () => {
  const base = new URL('../AleriaAlmanach.html', import.meta.url);
  for (const ref of strings(entries).filter(value => /^\.\.?\//.test(value))) assert(existsSync(new URL(ref, base)), ref);
  const manifest = JSON.parse(readFileSync(new URL('image-prompts.json', root), 'utf8'));
  assert.equal(manifest.mode, 'built-in image_gen');
  assert.equal(manifest.images.length, 8);
  for (const item of manifest.images) {
    const png = readFileSync(new URL(item.file, base));
    const width = png.readUInt32BE(16), height = png.readUInt32BE(20);
    assert.equal(width * (item.id.startsWith('service-') ? 1 : 3), height * (item.id.startsWith('service-') ? 1 : 2));
    if (item.id.startsWith('service-')) assert.equal(png[25], 6, 'Service icon must have PNG alpha');
  }
});
