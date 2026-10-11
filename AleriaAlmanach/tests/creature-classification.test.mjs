import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCreatureGroupTree, getCreatureClassification, inferCreatureGenus } from '../modules/creatures/creature-classification.js';
import { renderCreatureGroups } from '../modules/creatures/creature-library-view.js';
import { sanitizeCreature, createCreatureDuplicate, normalizeCreatureImportPayload, makeCreatureExportPayload } from '../modules/creatures/creature-model.js';

test('groups horses across breeds, dogs, birds and humans with independent register locations', () => {
  for (const species of ['Drake', 'Rhyfel', 'Ceffyl Hengst', 'Hest-Mischling', 'Tirashan']) assert.equal(inferCreatureGenus({ species }), 'Pferde');
  for (const species of ['Ponter', 'Brodgi', 'Bugail-Hund', 'Tryw-Jagdhündin']) assert.equal(inferCreatureGenus({ species }), 'Hunde');
  assert.equal(inferCreatureGenus({ species: 'Gramnir · Nordwolf' }), 'Wölfe');
  const tree = buildCreatureGroupTree([
    { id: 'catalog-draig-knight', name: 'Ritter', species: 'Mensch' },
    { name: 'Knecht', species: 'Mensch', classification: { location: 'Celtigerns Wacht', house: 'Haus Draig' } },
    { id: 'companion-tanor', name: 'Tanor', species: 'Rhyfel', habitat: 'Unterwegs' },
    { name: 'Zweiter Ort', species: 'Drake', classification: { location: 'Baldreska' } }
  ]);
  const humans = tree.find(g => g.label === 'Menschen');
  assert.equal(humans.children[0].label, 'Celtigerns Wacht');
  assert.equal(humans.children[0].children[0].label, 'Haus Draig');
  assert.equal(humans.children[0].children[0].count, 2);
  const horses = tree.find(g => g.label === 'Pferde');
  assert.deepEqual(horses.children.map(g => g.label), ['Baldreska', 'Celtigerns Wacht']);
  assert.equal(horses.children[0].children.length, 0);
  assert.equal(tree.reduce((sum, g) => sum + g.count, 0), 4);
});

test('classification survives editing, duplication and portable exports without replacing habitat', () => {
  const source = sanitizeCreature({ name: 'Pferd', species: 'Ceffyl', habitat: 'Auf Reisen', classification: { genus: 'Pferde', location: 'Celtigerns Wacht', house: '' } });
  for (const result of [source, createCreatureDuplicate(source), ...normalizeCreatureImportPayload(makeCreatureExportPayload(source))]) {
    assert.deepEqual(result.classification, source.classification);
    assert.equal(result.habitat, 'Auf Reisen');
  }
  assert.equal(getCreatureClassification({ species: 'Hund' }).location, 'Ohne Ortszuordnung');
});

test('group rendering escapes labels and preserves closed groups on a rerender', () => {
  const escape = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  const html = renderCreatureGroups([{ name: 'Tier', classification: { genus: '<script>', location: 'Ort' } }], { renderCard: c => c.name, escape, openPaths: new Set() });
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes(' open>'));
  assert.match(html, /&lt;script>/);
});
