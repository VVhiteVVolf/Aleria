import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { shouldPublish } from '../../../netlify/build/site-publish.mjs';
const root = new URL('../../../', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('AleriaAlmanach/assets/gwynthor-formlingssache/asset-manifest.json', root), 'utf8'));
const checked = [];
for (const image of manifest.images) {
  assert.match(image.file, /^(?:AleriaAlmanach\/assets\/gwynthor-formlingssache\/portraits|Anzeigetafeln\/assets\/images\/notices\/lleuwens-anhoerung)\/[^/]+\.png$/);
  const bytes = await readFile(new URL(image.file, root));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), image.sha256, image.file);
  assert.equal(shouldPublish(image.file), true);
  checked.push({ file: image.file, sha256: image.sha256, published: true });
}
await writeFile(new URL('./formling-art.json', import.meta.url), JSON.stringify({ checked }, null, 2) + '\n');
console.log(`${checked.length} originale Formlingssache-Porträts/Aushangbilder mit Manifesthash und Veröffentlichungspfad geprüft.`);
