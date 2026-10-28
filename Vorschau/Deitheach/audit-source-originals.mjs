import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// The complete local source archive includes two intentionally private maps.
// Hosted builds validate the eight published originals without requiring it.
const workspace = new URL('../../', import.meta.url);
const entries = JSON.parse(await readFile(new URL('assets.source.json', import.meta.url), 'utf8'));
assert.equal(entries.length, 10);
for (const entry of entries) {
  const bytes = await readFile(new URL(entry.original, workspace));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.sha256, entry.sourceFile);
}
console.log(`Deitheach: alle ${entries.length} lokalen Originalquellen einschließlich der privaten Karten bytegenau geprüft.`);
