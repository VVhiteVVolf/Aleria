// Bounded replacement of the already published quartet's shared illustration.
// Dry run by default; no grants, personal records or scene comments are written.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { createContentPublicationClient, createPublicContentReadClient, backupContentPublication } from './content-publication-client.mjs';
import { decodeFirestoreFields, encodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { OWETA_QUARTET_ARTWORK, withOwetaQuartetArtwork } from '../../../AleriaAlmanach/modules/oweta-quartett/oweta-quartett-artwork.mjs';

const modulePath = '/module_store_entries/oweta-quartett';
const accountPath = '/group_quest_accounts/oweta-quartett';
const output = new URL('../../../diagnostics/oweta-quartett-20261103/', import.meta.url);

export async function publishOwetaQuartetArtwork({ apply = false } = {}) {
  const client = apply ? await createContentPublicationClient() : createPublicContentReadClient();
  const bytes = await readFile(new URL(`../../..${OWETA_QUARTET_ARTWORK.path}`, import.meta.url));
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha256, OWETA_QUARTET_ARTWORK.sha256, 'Nur die korrigierte, ausgewählte Variante 1 darf übernommen werden.');
  const assetId = `${OWETA_QUARTET_ARTWORK.assetId}-${sha256.slice(0, 16)}`;
  const storagePath = `family-assets/haus-draig/${assetId}/original.png`;
  const image = `https://firebasestorage.googleapis.com/v0/b/aleriaprojekt.firebasestorage.app/o/${encodeURIComponent(storagePath)}?alt=media`;
  const [moduleBefore, configBefore, accountBefore] = await Promise.all([
    client.request(modulePath), client.request('/char_tabs/config'), client.request(accountPath)
  ]);
  assert(moduleBefore && configBefore && accountBefore, 'Die veröffentlichte Gruppe ist unvollständig.');
  const saved = decodeFirestoreFields(moduleBefore.fields);
  const entry = saved.entryJson ? JSON.parse(saved.entryJson) : saved.entry;
  const next = withOwetaQuartetArtwork(entry, image);
  const summary = { moduleId: entry.id, localImage: OWETA_QUARTET_ARTWORK.path.slice(1), sha256, image,
    imageReferences: 5, alreadyApplied: JSON.stringify(entry) === JSON.stringify(next), dryRun: !apply };
  await mkdir(output, { recursive: true });
  await writeFile(new URL('selected-artwork-plan.json', output), JSON.stringify(summary, null, 2) + '\n');
  if (!apply || summary.alreadyApplied) return summary;

  const now = new Date().toISOString();
  const config = decodeFirestoreFields(configBefore.fields);
  const revision = Math.max(Date.parse(now), Number(config.moduleStoreUpdatedAtClient || 0) + 1,
    Number(config.moduleStoreManifest?.updatedAtClient || 0) + 1);
  await backupContentPublication('oweta-quartett-selected-artwork', [moduleBefore, configBefore, accountBefore], [], now);
  const asset = await client.publishFamilyArtwork({ familyId: 'haus-draig', assetId, bytes,
    metadata: { kind: 'group-scene', moduleId: entry.id, sha256 } });
  assert.equal(asset.url, image);
  await client.request(':commit', { writes: [
    { update: { name: moduleBefore.name, fields: encodeFirestoreFields({ entryJson: JSON.stringify(next), updatedAtClient: revision }) },
      updateMask: { fieldPaths: ['entryJson', 'updatedAtClient'] }, currentDocument: { updateTime: moduleBefore.updateTime },
      updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }] },
    { update: { name: configBefore.name, fields: encodeFirestoreFields({ moduleStoreUpdatedAtClient: revision,
      moduleStoreManifest: { updatedAtClient: revision } }) },
      updateMask: { fieldPaths: ['moduleStoreUpdatedAtClient', 'moduleStoreManifest.updatedAtClient'] },
      currentDocument: { updateTime: configBefore.updateTime },
      updateTransforms: [{ fieldPath: 'moduleStoreUpdatedAt', setToServerValue: 'REQUEST_TIME' }] }
  ] });
  const [moduleAfter, configAfter, accountAfter] = await Promise.all([
    client.request(modulePath), client.request('/char_tabs/config'), client.request(accountPath)
  ]);
  assert.deepEqual(JSON.parse(decodeFirestoreFields(moduleAfter.fields).entryJson), next);
  assert.deepEqual(accountAfter.fields, accountBefore.fields, 'Gruppenvorrat und Kasse müssen unverändert bleiben.');
  const nextConfig = decodeFirestoreFields(configAfter.fields);
  assert.deepEqual(nextConfig, { ...config, moduleStoreUpdatedAtClient: revision,
    moduleStoreManifest: { ...config.moduleStoreManifest, updatedAtClient: revision },
    moduleStoreUpdatedAt: nextConfig.moduleStoreUpdatedAt });
  const verification = { ...summary, dryRun: false, verified: true, groupInventoryPreserved: true,
    otherContentPreserved: true, asset };
  await writeFile(new URL('selected-artwork-verification.json', output), JSON.stringify(verification, null, 2) + '\n');
  return verification;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await publishOwetaQuartetArtwork({ apply: process.argv.includes('--apply') })));
}
