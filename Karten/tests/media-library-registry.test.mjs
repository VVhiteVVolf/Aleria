import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/js/media/media-assets.registry.js', import.meta.url), 'utf8');
const context = { window: {} };
vm.runInNewContext(source, context);
const assets = context.window.KARTO_MEDIA_ASSETS;

assert.ok(Array.isArray(assets));
assert.ok(assets.length > 700, 'Die Projektmediathek sollte die vorhandenen Bildordner vollständig erfassen.');
for (const kind of ['marker', 'crest', 'region']) {
  assert.ok(assets.some(asset => asset.kind === kind), `Bildart ${kind} fehlt.`);
}
assert.equal(new Set(assets.map(asset => asset.url)).size, assets.length, 'Bildpfade müssen eindeutig sein.');
assert.ok(assets.every(asset => asset.url.startsWith('/Karten/') || asset.url.startsWith('/Stammbäume/')));

console.log(`Karten-Mediathek: ${assets.length} eindeutige Bilder geprüft.`);
