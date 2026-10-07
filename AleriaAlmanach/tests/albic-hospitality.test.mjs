import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import { buildAlbicHospitality, ALBIC_HOSPITALITY_TAB, ALBIC_HOSPITALITY_ICON } from '../modules/albische-gastfreundschaft/albic-hospitality-model.mjs';

const source = readFileSync(new URL('../modules/albische-gastfreundschaft/albic-hospitality-data.js', import.meta.url), 'utf8');
const entry = buildAlbicHospitality();

test('the new tab keeps its root icon and existing entries when registration repeats', () => {
  const old = { id: 'unrelated', title: 'Vorhandener Brauch', pages: [{ description: 'Eigene Worte' }] };
  const section = { tab: ALBIC_HOSPITALITY_TAB, key: ALBIC_HOSPITALITY_TAB, iconUrl: ALBIC_HOSPITALITY_ICON, entries: [old] };
  const context = vm.createContext({ SECTIONS: [section, { tab: 'Söldner', key: 'Söldner', entries: [{ id: 'windreiter' }] }] });
  vm.runInContext(source, context);
  const added = section.entries.find(item => item.id === entry.id);
  added.pages[0].description = 'Nachträgliche Bearbeitung';
  vm.runInContext(source, context);
  assert.equal(context.SECTIONS.filter(item => item.tab === ALBIC_HOSPITALITY_TAB).length, 1);
  assert.equal(section.entries.length, 2);
  assert.equal(section.entries[0], old);
  assert.equal(section.entries.find(item => item.id === entry.id), added);
  assert.equal(added.pages[0].description, 'Nachträgliche Bearbeitung');
  assert.equal(context.SECTIONS[1].entries[0].id, 'windreiter');
  const empty = vm.createContext({ SECTIONS: [] });
  vm.runInContext(source, empty);
  assert.equal(empty.SECTIONS[0].iconUrl, ALBIC_HOSPITALITY_ICON);
  assert.equal(empty.SECTIONS[0].tab, 'Sitte & Etiquette');
  assert.deepEqual(JSON.parse(JSON.stringify(empty.SECTIONS[0].path)), []);
});

test('every page has its own local portrait and the tab has a square icon', () => {
  const base = new URL('../AleriaAlmanach.html', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('../modules/albische-gastfreundschaft/image-prompts.json', import.meta.url), 'utf8'));
  assert.equal(entry.pages.length, 10);
  assert.equal(manifest.images.length, 11);
  assert.equal(manifest.mode, 'built-in image_gen');
  assert.equal(new Set(entry.pages.map(page => page.image)).size, 10);
  const hashes = new Set();
  for (const page of entry.pages) {
    const png = readFileSync(new URL(page.image, base));
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16) * 3, png.readUInt32BE(20) * 2);
    hashes.add(createHash('sha256').update(png).digest('hex'));
    assert(manifest.images.some(image => image.file === page.image && image.prompt && image.generatedPath));
  }
  assert.equal(hashes.size, 10, 'Separate files must not be copies of one illustration');
  const icon = readFileSync(new URL(ALBIC_HOSPITALITY_ICON, base));
  assert.equal(icon.readUInt32BE(16), icon.readUInt32BE(20));
});
