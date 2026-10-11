import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import test from 'node:test';
import vm from 'node:vm';
import { buildTenebrium, NATURAL_RESOURCES_TAB, NATURAL_RESOURCES_ICON } from '../modules/natural-resources/natural-resources-model.mjs';
import { renderArchiveSectionRegistration } from '../modules/archive/archive-section-registration.mjs';

const source = readFileSync(new URL('../modules/natural-resources/natural-resources-data.js', import.meta.url), 'utf8');
const entry = buildTenebrium();

test('registration retains all four branches, including empty ones, without duplicating or replacing edits', () => {
  const old = { id: 'other-ore', title: 'Eigenes Erz' };
  const ore = { tab: NATURAL_RESOURCES_TAB, path: ['Erz'], entries: [old] };
  const context = vm.createContext({ SECTIONS: [ore] });
  vm.runInContext(source, context);
  const registered = ore.entries.find(item => item.id === entry.id);
  registered.pages[0].description = 'Eigene Bearbeitung';
  vm.runInContext(source, context);
  assert.equal(context.SECTIONS.length, 5);
  assert.deepEqual(context.SECTIONS.flatMap(section => Array.from(section.path)).sort(), ['Edelsteine', 'Erz', 'Holz', 'Mineralien']);
  assert.equal(ore.entries.length, 2);
  assert.equal(ore.entries[0], old);
  assert.equal(ore.entries[1], registered);
  assert.equal(registered.pages[0].description, 'Eigene Bearbeitung');
  const root = context.SECTIONS.find(section => !section.path.length);
  assert.equal(root.iconUrl, NATURAL_RESOURCES_ICON);
  assert.equal(root.entries.length, 0);
  assert.equal(context.SECTIONS.filter(section => section.path[0] !== 'Erz').every(section => section.entries.length === 0), true);
});

test('missing referenced entries do not create ghost sections; section-only definitions must be explicit', () => {
  assert.throws(() => renderArchiveSectionRegistration('registerTest', [{ tab: 'Empty' }], 'test'));
  assert.throws(() => renderArchiveSectionRegistration('registerTest', [{ tab: 'Empty', sectionOnly: true, entry }], 'test'));
  const context = vm.createContext({ SECTIONS: [] });
  vm.runInContext(renderArchiveSectionRegistration('registerTest', [{ tab: 'Missing', entryId: 'absent' }], 'test'), context);
  assert.equal(context.SECTIONS.length, 0);
});

test('eight chapters use four story pages and four editable material dossiers', () => {
  assert.equal(entry.pages.length, 8);
  assert.equal(entry.appendCommentsPage, false);
  assert.equal(entry.enablePageComments, true);
  assert.deepEqual(entry.pages.map(page => !!page.artifactPage), [false, false, true, true, true, true, false, false]);
  for (const page of entry.pages.filter(page => page.artifactPage)) {
    assert.equal(page.artifact.archiveLabel, 'Natürliche Rohstoffe · Werkstoffakte');
    assert.equal(page.artifact.discovery, '');
    assert.equal(page.artifact.keeper, '');
    assert(page.artifact.properties.length);
    assert(page.artifact.risks.length);
  }
});

test('lore keeps county deposits distinct from unknown world totals and treats the origin as myth', () => {
  const trade = entry.pages[7].description;
  assert.match(trade, /Allein hier sind acht Tenebrium-Fundorte bekannt/);
  assert.match(trade, /Morgorn und Galadorn/);
  assert.match(trade, /weltweit insgesamt gibt, ist unbekannt/);
  assert.match(trade, /Markt der Fortuna und die Klingende Münze/);
  assert.match(entry.pages[1].description, /negiert Magie nicht vollständig/);
  assert.match(entry.pages[6].description, /Die Geschichte bleibt eine mythische Deutung/);
  assert.match(entry.pages[4].stats[0][1], /Tenebron oder Tenebrit-Stahl/);
  assert.match(entry.pages[5].stats[0][1], /Tenebron oder Tenebrit-Stahl/);
});

test('each chapter has a distinct 2:3 illustration and generation record, with one square parchment icon', () => {
  const base = new URL('../AleriaAlmanach.html', import.meta.url);
  const manifest = JSON.parse(readFileSync(new URL('../modules/natural-resources/image-prompts.json', import.meta.url), 'utf8'));
  assert.equal(manifest.mode, 'built-in image_gen');
  assert.equal(manifest.images.length, 9);
  const hashes = new Set();
  for (const page of entry.pages) {
    const png = readFileSync(new URL(page.image, base));
    assert.equal(png.toString('hex', 0, 8), '89504e470d0a1a0a');
    assert.equal(png.readUInt32BE(16) * 3, png.readUInt32BE(20) * 2);
    hashes.add(createHash('sha256').update(png).digest('hex'));
    const record = manifest.images.find(image => image.file === page.image);
    assert(record.generatedPath);
    assert.match(record.prompt, /Tales of Xillia\/Frieren/);
  }
  assert.equal(hashes.size, 8);
  const icon = readFileSync(new URL(NATURAL_RESOURCES_ICON, base));
  assert.equal(icon.readUInt32BE(16), icon.readUInt32BE(20));
});

test('dossier metadata can omit optional origin and condition while older missing fields retain defaults', () => {
  const editor = readFileSync(new URL('../modules/module-editor/module-editor-data.js', import.meta.url), 'utf8');
  const fn = editor.slice(editor.indexOf('function sanitizeArtifactData('), editor.indexOf('function sanitizeRecipeIconRows('));
  const context = vm.createContext({});
  vm.runInContext(fn, context);
  assert.equal(context.sanitizeArtifactData({}).origin, 'Herkunft unbekannt');
  assert.equal(context.sanitizeArtifactData({}).condition, 'Zustand ungeprüft');
  const data = context.sanitizeArtifactData(entry.pages[2].artifact);
  assert.equal(data.origin, '');
  assert.equal(data.condition, '');
});
