import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';

const window = { TafelZettelRichText: { textPreview: value => value.replace(/<[^>]*>/g, '') } };
for (const name of ['zettel-config', 'notice-search']) {
  vm.runInNewContext(readFileSync(new URL(`../assets/js/notes/${name}.js`, import.meta.url), 'utf8'), { window });
}
const fixtures = [
  { id: 'trade', typ: 'handel', title: 'Schmiedewaren', text: '<p>Ein guter Schild</p>', table: [{ k: 'Ort', v: 'Südtor' }] },
  { id: 'wanted', typ: 'steckbrief', personen: [{ title: 'Éla', table: [{ k: 'Alias', v: 'Nebelkrähe' }] }] },
  { id: 'news', typ: 'zeitung', artikel: [{ titel: 'Hafenfest', text: 'Gesang' }] },
  { id: 'secret', typ: 'handel', title: 'Geheimer Schild', secret: true },
];
const ids = result => Array.from(result, item => item.id);

test('search combines words across body, facts, articles and wanted persons', () => {
  const search = window.TafelNoticeSearch.select;
  assert.deepEqual(ids(search(fixtures, { query: '  SCHILD südtor  ' })), ['trade']);
  assert.deepEqual(ids(search(fixtures, { query: 'Éla Nebelkrähe' })), ['wanted']);
  assert.deepEqual(ids(search(fixtures, { query: 'Hafenfest Gesang' })), ['news']);
  assert.deepEqual(ids(search(fixtures, { query: 'Handel', type: 'steckbrief' })), []);
});

test('hidden notices are excluded unless the editor explicitly requests them; source data is preserved', () => {
  const before = JSON.stringify(fixtures);
  assert.deepEqual(ids(window.TafelNoticeSearch.select(fixtures)), ['trade', 'wanted', 'news']);
  assert.deepEqual(ids(window.TafelNoticeSearch.select(fixtures, { includeSecret: true, type: 'handel' })), ['trade', 'secret']);
  assert.equal(JSON.stringify(fixtures), before);
});
