import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFile } from 'node:fs/promises';

const context = vm.createContext({
  document: { addEventListener() {} },
  escapeHtml: value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;'),
  sanitizeImageSrc: value => String(value || ''), sanitizeContentHtml: value => String(value || '')
});
for (const file of ['module-editor/module-editor-data', 'hierarchy/hierarchy-renderer']) {
  vm.runInContext(await readFile(new URL(`../modules/${file}.js`, import.meta.url), 'utf8'), context);
}
const sanitize = input => JSON.parse(JSON.stringify(context.sanitizeHierarchyData(input)));
const level = count => ({ label: 'Gleicher Rang', nodes: Array.from({ length: count }, (_, index) => ({ title: `Person ${index + 1}` })) });

test('nine peers survive sanitation, JSON round trips and rendering on one level', () => {
  const input = { trees: [{ id: 'council', label: 'Rat', levels: [level(9)] }] };
  const clean = sanitize(input);
  assert.equal(clean.trees[0].levels.length, 1);
  assert.equal(clean.trees[0].levels[0].nodes.length, 9);
  assert.deepEqual(sanitize(JSON.parse(JSON.stringify(clean))), clean);
  const html = context.buildHierarchyLevel(clean.trees[0].levels[0], 0);
  assert.equal((html.match(/class="hierarchy-node-card"/g) || []).length, 9);
  assert.match(html, /Person 9/);
  assert.equal((html.match(/data-hierarchy-level=/g) || []).length, 1);
});

test('both sanitation and rendering honor the same twelve-node bound', () => {
  const clean = sanitize({ levels: [level(13)] });
  assert.equal(clean.levels[0].nodes.length, 12);
  const html = context.buildHierarchyLevel(level(13), 0);
  assert.equal((html.match(/class="hierarchy-node-card"/g) || []).length, 12);
  assert.doesNotMatch(html, /Person 13/);
});
