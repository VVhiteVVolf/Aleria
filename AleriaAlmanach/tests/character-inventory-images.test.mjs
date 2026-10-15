import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const context = vm.createContext({ window: { location: { href: 'https://aleria.example/' } }, document: { addEventListener() {} }, URL });
for (const file of ['core/content-safety.js', 'module-editor/module-editor-character-inventory.js', 'character-inventory/character-inventory-renderer.js']) {
  vm.runInContext(await readFile(new URL('../modules/' + file, import.meta.url), 'utf8'), context);
}

test('inventory images preserve download-token query parameters when rendered into HTML', () => {
  context.source = 'https://firebasestorage.googleapis.com/v0/b/example/o/horse.png?alt=media&token=test-token';
  const html = vm.runInContext("buildCharacterInventoryImage(source, 'Eurwen', 'ci-companion-image')", context);
  assert.ok(html.includes('src="' + context.source.replace('&', '&amp;') + '"'));
  assert.ok(!html.includes('&amp;amp;'));
});

test('inventory images still reject unsafe schemes and escape attribute delimiters', () => {
  const unsafe = vm.runInContext("buildCharacterInventoryImage('javascript:alert(1)', 'Test', 'ci-companion-image')", context);
  assert.ok(unsafe.includes('ci-placeholder'));
  assert.ok(!unsafe.includes('<img'));
  context.source = 'https://example.com/horse.png?caption=" onerror="alert(1)';
  const html = vm.runInContext("buildCharacterInventoryImage(source, 'Eurwen', 'ci-companion-image')", context);
  assert.ok(html.includes('caption=&quot; onerror=&quot;alert(1)'));
  assert.ok(!html.includes('&amp;quot;'));
  assert.ok(!html.includes(' onerror="'));
});
