import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import { ALBIC_CLAN_PAGES } from '../modules/albische-clans/albic-clans-content.mjs';
import { ALBIC_CLAN_EXAMPLES } from '../modules/albische-clans/clan-examples.mjs';
import { buildAlbicClans } from '../modules/albische-clans/albic-clans-model.mjs';

const entry = buildAlbicClans();
const root = new URL('../', import.meta.url);
const read = file => readFileSync(new URL(file, root), 'utf8');

test('all 21 requested prefix groups have one page, a sourced example and explicit hypothetical labels', () => {
  const requested = ['Mac','Ó / Ua','Nic','Ui','Na','An','Tir An','Dál','Fir / Fir An','Ri','Ard','Fáill','Breac','Tair','Ord','Sidhe / Sid','Droch / Dro','Mallacht / Mall','Ruin / Ru','Toir','Díth'];
  assert.deepEqual(ALBIC_CLAN_PAGES.slice(1).map(page => page.prefix), requested);
  assert.equal(entry.pages.length, 22);
  const hypothetical = ['ri','breac','tair','ord','droch','toir','dith'];
  assert.deepEqual(ALBIC_CLAN_PAGES.filter(page => page.example.kind === 'hypothetical').map(page => page.key), hypothetical);
  const regions = new Set();
  ALBIC_CLAN_PAGES.forEach((page,index) => {
    const source = ALBIC_CLAN_EXAMPLES[page.example.familyId];
    assert(source?.description);
    regions.add(source.region);
    for (const id of page.example.people) assert(source.people.some(person => person.id === id && person.worldPersonId));
    assert(entry.pages[index].description.includes(`family=${source.id}`));
    assert.equal(entry.pages[index].description.includes('Gedankenbeispiel — keine bestehende Clan-Geschichte'), hypothetical.includes(page.key));
    if (hypothetical.includes(page.key)) assert(page.example.thought.length > 150);
  });
  assert.deepEqual([...regions].sort(), ['Aislearneach','Blaithneach','Ceitheach','Dunfal','Leitheach']);
});

test('registration adds the module to the existing customs tab and preserves edits on repeat', () => {
  const context = vm.createContext({ SECTIONS: [] });
  vm.runInContext(read('modules/albische-gastfreundschaft/albic-hospitality-data.js'), context);
  const source = read('modules/albische-clans/albic-clans-data.js');
  vm.runInContext(source, context);
  assert.equal(context.SECTIONS.length, 1);
  const section = context.SECTIONS[0];
  assert.equal(section.tab, 'Sitte & Etiquette');
  assert.equal(section.entries.length, 2);
  assert(section.iconUrl.endsWith('/sitte-etiquette.png'));
  const added = section.entries.find(item => item.id === entry.id);
  added.pages[0].description = 'Eigene spätere Bearbeitung';
  vm.runInContext(source, context);
  assert.equal(section.entries.length, 2);
  assert.equal(added.pages[0].description, 'Eigene spätere Bearbeitung');
  assert.equal(section.entries[0].id, 'albische-gastfreundschaft');
});

test('each page has its own generated 2:3 image with preserved prompt provenance', () => {
  const manifest = JSON.parse(read('modules/albische-clans/image-prompts.json'));
  assert.equal(manifest.mode, 'built-in image_gen');
  assert.equal(manifest.images.length, 22);
  const hashes = new Set();
  for (const page of entry.pages) {
    const bytes = readFileSync(new URL(page.image, root));
    assert.equal(bytes.toString('hex',0,8),'89504e470d0a1a0a');
    assert.equal(bytes.readUInt32BE(16)*3,bytes.readUInt32BE(20)*2);
    hashes.add(createHash('sha256').update(bytes).digest('hex'));
    assert(manifest.images.some(art => art.file === page.image && art.prompt && art.generatedPath && art.references.length));
  }
  assert.equal(hashes.size, 22);
});
