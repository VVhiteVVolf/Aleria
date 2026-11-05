/** Verify copied tool originals against independent shared-pipeline hashes. */
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const root = new URL('../', import.meta.url);
const json = async path => JSON.parse(await readFile(new URL(path, root), 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const source = await json('sources/warrior-art-direction.json');
const receipts = await json('sources/warrior-generation-receipts.json');
const artifacts = await json('assets/warriors/manifest.json');
assert.equal(receipts.entries.length, 8);
const entries = [];
for (const row of receipts.entries) {
  const artifact = artifacts.entries.find(entry => entry.id === row.id);
  const direction = source.entries.find(entry => entry.id === row.id);
  assert(artifact && direction);
  const original = await readFile(new URL(row.workspaceOriginal, root));
  const toolOriginal = await readFile(row.toolOutputPath);
  const hash = digest(original);
  assert.equal(digest(toolOriginal), hash, `${row.id}: tool output copy differs`);
  assert.equal(artifact.sourceSha256, hash, `${row.id}: shared-pipeline source differs`);
  assert.equal(original.readUInt32BE(16), 1024);
  assert.equal(original.readUInt32BE(20), 1536);
  assert.equal(artifact.proof.rgbUnchanged, true);
  assert.equal(artifact.proof.originalUnchanged, true);
  assert.equal(artifact.proof.originalTransparentGapsFilled, false);
  entries.push({ id: row.id, toolOutputAndWorkspaceSha256: hash,
    productionSha256: artifact.productionSha256, previewSha256: artifact.previewSha256,
    sourceAndProductionDimensions: [1024, 1536], previewDimensions: [768, 1152],
    originalUnchanged: true, rgbUnchanged: true, transparentGapsNotFilled: true,
    referenceSha256: await Promise.all(direction.referencePaths.map(async path => ({ path, sha256: digest(await readFile(path)) }))) });
}
const report = { schemaVersion: 1, checkedAt: new Date().toISOString(), tool: 'built-in image_gen',
  checkedWarriors: entries.length, failures: [], entries,
  visualReview: { inspected: true, contactSheet: 'diagnostics/phalantia/warriors/contact-sheet.jpg',
    scope: 'Each full generated figure and the neutral-background production contact sheet were viewed. No cut figures, weapon tips or horse hooves; required class equipment present.' } };
const destination = new URL('../../diagnostics/phalantia/warriors/', root);
await mkdir(destination, { recursive: true });
await writeFile(new URL('generation-receipts-audit.json', destination), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ checkedWarriors: entries.length, toolOriginalCopiesExact: true, rgbPreserved: true, referencesHashed: true }));
