import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { ABILITY_ICON_ASSETS } from '../modules/character-archive/character-archive-ability-icons.js';

const root = new URL('../', import.meta.url);
const art = new URL('docs/art/ability-icons/', root);
const manifestUrl = new URL('manifest.json', art);
const receiptUrl = new URL('build-receipt.json', art);
const manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const textHash = async url => hash((await readFile(url, 'utf8')).replace(/\r\n/g, '\n'));
assert.equal(new Set(ABILITY_ICON_ASSETS).size, 11);
assert.deepEqual(new Set(manifest.jobs.map(job => job.asset)), new Set(ABILITY_ICON_ASSETS));
const inputs = {};
for (const name of ['docs/art/ability-icons/manifest.json', 'docs/art/ability-icons/generation-receipts.json', 'scripts/prepare-ability-icons.ps1', 'scripts/check-ability-icons.mjs']) {
  inputs[name] = await textHash(new URL(name, root));
}
const icons = [];
for (const job of manifest.jobs) {
  assert.match(job.asset, /^[a-z0-9-]+$/);
  const source = await readFile(new URL(`sources/${job.asset}.png`, art));
  const output = await readFile(new URL(`public/assets/ability-icons/${job.asset}.png`, root));
  for (const [kind, bytes] of [['source', source], ['output', output]]) {
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${job.asset} ${kind} PNG`);
  }
  assert.equal(output.readUInt32BE(16), 256, `${job.asset} width`);
  assert.equal(output.readUInt32BE(20), 256, `${job.asset} height`);
  assert.equal(output[25], 6, `${job.asset} RGBA`);
  icons.push({ asset: job.asset, sourceSha256: hash(source), outputSha256: hash(output) });
}
const receipt = { version: 1, inputs, icons };
if (process.argv.includes('--write-receipt')) {
  await writeFile(receiptUrl, `${JSON.stringify(receipt, null, 2)}\n`);
} else {
  assert.deepEqual(JSON.parse(await readFile(receiptUrl, 'utf8')), receipt,
    'Ability icon sources, prompts, preparation or active images changed; prepare and review before writing a new receipt.');
}
console.log(`${icons.length} ability icon sources and active RGBA PNGs ${process.argv.includes('--write-receipt') ? 'recorded' : 'verified'}.`);
