import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';
import { readReligionCatalog, entrySearchText, RELIGION_ROOT } from '../modules/content/content-repository.mjs';
import { createReligionModule, religionModuleFiles, buildReligionModules } from '../modules/almanach/religion-module-build.mjs';
import { renderReligionEntry } from '../modules/content/page-template.mjs';
import { filterEntries } from '../modules/catalog/catalog-model.mjs';
import { escapeHtml } from '../modules/content/content-html.mjs';

const catalog = readReligionCatalog();
const entry = catalog.entries.find(item => item.id === 'nimuiten');

test('Nimuiten are a searchable cult with public connections and no hidden-power preview', () => {
  assert.equal(entry.chapterId, 'kulte');
  assert.equal(catalog.entries.filter(item => item.chapterId === 'religionen').length, 10);
  const searchText = entrySearchText(entry);
  for (const query of ['Nimuiten', 'Gemeinschaft Heimkehr', 'Avallorn', 'Cenyr', 'Nimue', 'Iorwerth Prys', 'Mathragon']) {
    assert.equal(filterEntries([{ ...entry, searchText }], { query, chapterId: 'kulte' }).length, 1, query);
  }
  assert(!/Thraal|Menschenopfer/i.test(searchText));
  assert.deepEqual(entry.relations, ['alerische-kirche', 'nimue', 'neun-goettliche']);
});

test('the profile separates world truth in a closed native disclosure', () => {
  const html = renderReligionEntry(catalog, entry);
  assert.match(html, /<details class="lore-disclosure"><summary>Spielleitungswissen/);
  assert(!/<details[^>]*\bopen/.test(html));
  const disclosure = html.match(/<details class="lore-disclosure">([\s\S]+?)<\/details>/)[1];
  assert(disclosure.includes('Die Macht, die einen entscheidenden Teil der Opfer'));
  assert(disclosure.includes('Thraal ist weder Nimue'));
  assert(disclosure.includes('tatsächlich von ihr berührt'));
  assert(!html.match(/<meta name="description"[^>]+>/)[0].includes('Thraal'));
  assert(!/Erfinde|Verwechsle|Arbeitsauftrag|Implementierungsauftrag/.test(html));
});

test('eight story pages preserve every canonical paragraph and distinguish offering from groom', async () => {
  const module = createReligionModule(entry);
  assert.equal(module.pages.length, 8);
  assert.equal(module.appendCommentsPage, false);
  assert.match(module.pages.at(-1).pageTitle, /Spielleitungswissen/);
  for (const section of entry.sections) {
    const page = module.pages[entry.almanach.pages.findIndex(item => item.sections.includes(section.id))];
    for (const paragraph of section.paragraphs) assert(page.description.includes(escapeHtml(paragraph)));
  }
  assert(module.pages[1].description.includes('über vierhundert Jahre alt'));
  assert(module.pages[1].description.includes('Mathragon'));
  assert(module.pages[3].description.includes('künftigen Gemahl Nimues'));
  assert(module.pages[2].description.includes('stehen noch aus'));
  assert(module.pages[0].description.includes('Crannath-Alben'));
  for (const page of module.pages) {
    const buffer = readFileSync(resolve(RELIGION_ROOT, page.image.replace('../Religionen/', '')));
    assert.equal(buffer.readUInt32BE(16) * 3, buffer.readUInt32BE(20) * 2, page.image);
    assert.equal(page.imageFit, 'contain');
  }
  await buildReligionModules({ check: true, catalog });
  const [path, source] = religionModuleFiles(catalog)[0];
  assert.equal(readFileSync(resolve(RELIGION_ROOT, '..', path), 'utf8'), source);
  assert.equal(vm.runInNewContext(`${source}\ncreateNimuitenReligionEntry().pages.length`), 8);
});

test('module generation rejects lost, duplicated or missing source sections and unsafe assets', () => {
  const mutate = fn => { const copy = structuredClone(entry); fn(copy); return () => createReligionModule(copy); };
  assert.throws(mutate(copy => copy.almanach.pages.pop()), /Unvollständiges/);
  assert.throws(mutate(copy => copy.almanach.pages[1].sections.push('verlorene-heimat')), /doppelter/);
  assert.throws(mutate(copy => copy.almanach.pages[0].sections[0] = 'unknown'), /Unbekannter/);
  assert.throws(mutate(copy => copy.almanach.pages[0].scene = '../outside.png'), /Ungültiger lokaler Pfad/);
});
