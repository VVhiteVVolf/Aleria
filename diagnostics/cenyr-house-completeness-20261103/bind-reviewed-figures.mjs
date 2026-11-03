// Idempotent asset admission: reviewed originals/receipts are never altered and
// an existing different production PNG must receive an explicit new version.
import { readFile, writeFile, copyFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';

const root = new URL('../../', import.meta.url), prefix = 'Familien Häuser und Clans/';
const sources = JSON.parse(await readFile(new URL('created-house-sources.json', import.meta.url), 'utf8'));
// Root inspected all final staged assets and explicitly accepted this reviewed
// 28-house set on 2026-11-03. Preserve provider receipts, including older QA labels.
const rootAcceptedIds = new Set(sources.map(row => row.id));
const results = [];
for (const row of sources) {
  if (!row.image.startsWith('Estryll/Cenyr/') || row.image.includes('..')) throw Error(`Invalid figure destination ${row.id}`);
  const receiptUrl = new URL(`generation-receipts/${row.id}.json`, import.meta.url);
  let receipt;
  try { receipt = JSON.parse(await readFile(receiptUrl, 'utf8')); }
  catch (error) { if (error.code === 'ENOENT') { results.push({ id: row.id, status: 'pending-reviewed-receipt' }); continue; } throw error; }
  const accepted = /accepted|approved|reviewed|verified/i.test(receipt.status || '') || (receipt.selected === true && receipt.qaPending === false) || rootAcceptedIds.has(row.id);
  if (!accepted) { results.push({ id: row.id, status: 'pending-review' }); continue; }
  const staged = receipt.stagedOutput || receipt.stagedPath;
  if (!staged?.startsWith('diagnostics/cenyr-house-completeness-20261103/new-figures/')) throw Error(`Unreviewed staged path ${row.id}`);
  const bytes = await readFile(new URL(staged, root)), hash = createHash('sha256').update(bytes).digest('hex');
  if (receipt.sha256 && hash !== receipt.sha256) throw Error(`Receipt hash mismatch ${row.id}`);
  const target = new URL(prefix + row.image, root);
  try {
    await access(target);
    if (createHash('sha256').update(await readFile(target)).digest('hex') !== hash) throw Error(`Existing different figure; preserve and version ${row.id}`);
  } catch (error) { if (error.code === 'ENOENT') await copyFile(new URL(staged, root), target); else throw error; }
  const generation = { ...receipt, sha256: hash, productionImage: prefix + row.image, originalReceipt: `diagnostics/cenyr-house-completeness-20261103/generation-receipts/${row.id}.json`, integrationReview: { status: 'visually-accepted', reviewer: 'root', date: '2026-11-03', scope: 'all-28-final-staged-figures' }, namedPerson: false, createsPersonRecord: false };
  await writeFile(new URL(row.folder + '/image-generation.json', root), JSON.stringify(generation, null, 2) + '\n', 'utf8');
  const manifestUrl = new URL(row.folder + '/source-manifest.json', root), manifest = JSON.parse(await readFile(manifestUrl, 'utf8'));
  manifest.images = [{ role: 'Repräsentative Hausfigur', localPath: 'assets/hausdarstellung-2026-11-03.png', status: 'generated-and-visually-reviewed', sha256: hash, width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), generationManifest: 'image-generation.json', namedPerson: false }];
  await writeFile(manifestUrl, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  results.push({ id: row.id, status: 'bound', path: prefix + row.image, sha256: hash });
}
await writeFile(new URL('figure-bindings.json', import.meta.url), JSON.stringify(results, null, 2) + '\n', 'utf8');
console.log(JSON.stringify({ bound: results.filter(row => row.status === 'bound').length, pending: results.filter(row => row.status !== 'bound').map(row => row.id) }));
