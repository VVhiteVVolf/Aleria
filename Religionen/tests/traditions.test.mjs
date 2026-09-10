import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { RELIGION_ROOT, readReligionCatalog, validateCatalog, entrySearchText, entryPagePath } from '../modules/content/content-repository.mjs';
import { renderReligionEntry } from '../modules/content/page-template.mjs';
import { rootCatalogEntries } from '../modules/catalog/catalog-register-template.mjs';
import { filterEntries } from '../modules/catalog/catalog-model.mjs';

const catalog = readReligionCatalog();
const traditions = catalog.entries.filter(entry => entry.tradition);
const readJson = file => JSON.parse(readFileSync(resolve(RELIGION_ROOT, file), 'utf8'));
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const blockText = block => block.type === 'list' ? block.items.join(' ') : block.text;
const members = entry => entry.tradition.groups.flatMap(group => group.entries);

test('eight supplied religions retain all 105 figures and 79 distinct local ranks', () => {
  assert.deepEqual(traditions.map(entry => [entry.id, members(entry).length, entry.tradition.hierarchy?.entries.length || 0]), [
    ['nordischer-pantheon', 14, 11], ['alter-pantheon', 19, 12], ['celestische-synode', 15, 11],
    ['hohe-drei', 17, 11], ['harmonie-von-mond-und-sonne', 2, 10], ['zirkel-des-ewigen-waldes', 14, 12],
    ['phalantischer-bund', 22, 0], ['schwarze-sonne', 2, 12]
  ]);
  assert(traditions.every(entry => !entry.pending));
  const phalantian = traditions.find(entry => entry.id === 'phalantischer-bund');
  assert.equal(phalantian.tradition.hierarchy, undefined);
  assert(phalantian.tradition.quotation.text.length > 50);
  const black = traditions.find(entry => entry.id === 'schwarze-sonne');
  assert.equal(black.tradition.hierarchy.entries.filter(rank => rank.blocks.length).length, 1);
  const three = traditions.find(entry => entry.id === 'hohe-drei');
  assert(three.tradition.hierarchy.entries.every(rank => rank.military.length));
});

test('full imported prose, lists and nested hierarchy descriptions match the source audit', () => {
  const audit = readJson('docs/religionen-import.json').sources;
  assert.equal(audit.length, 8);
  for (const source of audit) {
    const entry = traditions.find(entry => entry.id === source.id);
    const blocks = entry.sections.flatMap(section => section.blocks);
    blocks.push(...(entry.tradition.hierarchy?.entries || []).flatMap(rank => [...rank.blocks, ...(rank.military || [])]));
    const texts = blocks.map(blockText);
    if (entry.tradition.quotation) texts.push(entry.tradition.quotation.text);
    const text = texts.join(' ');
    assert.equal(sha256(text), source.contentSha256, entry.id);
    assert.equal([...text].length, source.characters, entry.id);
    assert.equal(entry.source.sha256, source.sourceSha256);
    assert.equal(entry.source.attachment, source.attachment);
    assert.deepEqual(source.missingImages, []);
  }
});

test('90 active originals and 15 generated images retain their documented provenance', () => {
  const prompts = readJson('docs/religionen-bildprompts.json').generatedImages;
  const assets = traditions.flatMap(entry => readJson(`religionen/${entry.id}/assets/sources.json`).images);
  assert.equal(assets.filter(asset => asset.authorship === 'user-supplied').length, 90);
  assert.equal(prompts.length, 15);
  assert.equal(new Set(prompts.map(prompt => prompt.id)).size, 15);
  const legacy = readJson('religionen/zirkel-des-ewigen-waldes/assets/sources.json').legacyImages;
  assert.equal(legacy.length, 5);
  for (const source of legacy) {
    assert.equal(sha256(readFileSync(resolve(RELIGION_ROOT, source.src))), source.sha256);
    assert(!assets.some(asset => asset.src === source.src));
  }
  for (const entry of traditions) {
    for (const member of members(entry)) {
      const source = assets.find(asset => asset.src === member.image.src);
      assert(source, member.image.src);
      const bytes = readFileSync(resolve(RELIGION_ROOT, source.src));
      assert.equal(sha256(bytes), source.sha256, source.src);
      assert.equal(bytes.readUInt32BE(16), member.image.width);
      assert.equal(bytes.readUInt32BE(20), member.image.height);
      if (source.authorship === 'user-supplied') continue;
      const prompt = prompts.find(prompt => prompt.id === source.promptId);
      assert.equal(prompt.asset, source.src);
      assert.equal(prompt.tool, 'built-in image_gen');
      assert(prompt.prompt.length > 200);
      assert.deepEqual(prompt.references, source.references);
      for (const reference of prompt.references) {
        assert(reference.startsWith(`religionen/${entry.id}/assets/`));
        assert.equal(assets.find(asset => asset.src === reference)?.authorship, 'user-supplied');
      }
      if (['celestische-synode', 'zirkel-des-ewigen-waldes'].includes(entry.id)) assert.equal(bytes[25], 6, 'Transparent sibling illustrations retain RGBA');
    }
  }
});

test('regional names discover the correct religion without merging their aspect assignments', () => {
  const searchable = rootCatalogEntries(catalog).map(entry => ({ ...entry, searchText: entrySearchText(entry) }));
  for (const [query, id] of [['Wodin', 'nordischer-pantheon'], ['Krathos', 'phalantischer-bund'], ['Ordeus', 'celestische-synode'], ['Shindar', 'harmonie-von-mond-und-sonne'], ['Al-Malak', 'schwarze-sonne']]) {
    assert(filterEntries(searchable, { query }).some(entry => entry.id === id), query);
  }
  const phalantian = traditions.find(entry => entry.id === 'phalantischer-bund');
  assert.deepEqual(members(phalantian).find(member => member.id === 'krathos').relatedIds, ['ordan', 'baldran', 'grimnar']);
  const old = traditions.find(entry => entry.id === 'alter-pantheon');
  assert.deepEqual(members(old).find(member => member.id === 'herion').relatedIds, ['selarion']);
  assert.deepEqual(members(old).find(member => member.id === 'jovellia').relatedIds, ['jovena']);
});

test('figures, full-size images and record-only comparisons have unique valid local targets', () => {
  for (const entry of traditions) {
    const html = renderReligionEntry(catalog, entry);
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, entry.id);
    assert.equal((html.match(/class="tradition-card"/g) || []).length, members(entry).length);
    assert.equal((html.match(/data-religion-image-link/g) || []).length, members(entry).length);
    for (const [, href] of html.matchAll(/href="([^"?]+#[^"]+)"/g)) {
      const [file, fragment] = href.split('#');
      const target = resolve(RELIGION_ROOT, '..', dirname(entryPagePath(entry)), file);
      assert(existsSync(target), href);
      assert(readFileSync(target, 'utf8').includes(`id="${fragment}"`), href);
    }
    for (const [, fragment] of html.matchAll(/href="#([^"]+)"/g)) assert(ids.includes(fragment), fragment);
  }
  const black = renderReligionEntry(catalog, traditions.find(entry => entry.id === 'schwarze-sonne'));
  assert.match(black, /infernus\/index\.html#entry-narath/);
});

test('tradition validation rejects duplicate figures, unknown comparisons and unsafe image paths', () => {
  const mutations = [
    [entry => entry.tradition.groups[0].entries.push(entry.tradition.groups[0].entries[0]), /Glaubensgestalt/],
    [entry => entry.tradition.groups[0].entries[0].relatedIds.push('nonexistent'), /Glaubenszuordnung/],
    [entry => entry.tradition.groups[0].entries[0].image.src = '../outside.png', /Pfad/],
    [entry => entry.tradition.groups[0].entries[0].image.width = 0, /Glaubensbildmaße/],
    [entry => entry.sections[0].id = 'goetterkreis', /Abschnitt/],
    [entry => entry.tradition.hierarchy.entries.push(entry.tradition.hierarchy.entries[0]), /Glaubensrang/]
  ];
  for (const [mutate, pattern] of mutations) {
    const copy = structuredClone(catalog);
    mutate(copy.entries.find(entry => entry.id === 'alter-pantheon'));
    assert.throws(() => validateCatalog(copy), pattern);
  }
});

test('tradition text and hierarchy captions are safely escaped in static HTML', () => {
  const entry = structuredClone(traditions.find(entry => entry.id === 'alter-pantheon'));
  const hostile = '<script>alert("test")</script>';
  entry.tradition.groups[0].entries[0].name = hostile;
  entry.tradition.hierarchy.entries[0].title = hostile;
  entry.tradition.notes = [hostile];
  const html = renderReligionEntry(catalog, entry);
  assert(!html.includes(hostile));
  assert(html.includes('&lt;script&gt;'));
});
