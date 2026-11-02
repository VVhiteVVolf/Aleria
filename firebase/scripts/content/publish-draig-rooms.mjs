// Explicit editorial update of one existing module. Existing scene threads,
// dates, participants, comments, profiles and resources are outside the write set.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { decodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';
import { DRAIG_ROOM_ART } from '../../../AleriaAlmanach/modules/castell-draig-rooms/room-art.mjs';
import { DRAIG_ROOMS, DRAIG_ROOMS_MODULE_ID, planDraigRoomRefresh, planDraigRoomCorrection } from '../../../AleriaAlmanach/modules/castell-draig-rooms/room-pages.mjs';

const sourceDirectory = new URL('../../../AleriaAlmanach/assets/castell-draig/wohntrakte-zimmer-2026-11-01-v2/', import.meta.url);
const correctingAnaraut = process.argv.includes('--anaraut-without-dog');
const directory = correctingAnaraut ? new URL('anaraut-without-dog-v3/', sourceDirectory) : sourceDirectory;
const root = new URL('../../../', import.meta.url);
const baseline = JSON.parse(await readFile(new URL('module-before.json', directory), 'utf8')).entry;
const results = JSON.parse(await readFile(new URL('image-results.json', sourceDirectory), 'utf8'));
const modulePath = `/module_store_entries/${DRAIG_ROOMS_MODULE_ID}`;
const entryOf = document => {
  const data = decodeFirestoreFields(document.fields);
  return data.entryJson ? JSON.parse(data.entryJson) : data.entry;
};
const artwork = [];
for (const art of DRAIG_ROOM_ART.filter(art => !correctingAnaraut || art.id === 'anaraut')) {
  const bytes = await readFile(new URL(art.destination, root));
  assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  assert.equal(bytes.readUInt32BE(16) * 3, bytes.readUInt32BE(20) * 2);
  const sha256 = createHash('sha256').update(bytes).digest('hex');
  assert.equal(sha256, results.images.find(image => image.id === art.id)?.sha256, `Ungeprüftes Bild: ${art.id}`);
  artwork.push({ ...art, bytes, sha256 });
}
const assetIdOf = item => `rooms-v${item.version || 2}-${item.id}-${item.sha256.slice(0, 16)}`;
const storageUrl = item => `https://firebasestorage.googleapis.com/v0/b/aleriaprojekt.firebasestorage.app/o/${encodeURIComponent(`family-assets/haus-draig/${assetIdOf(item)}/original.png`)}?alt=media`;
const expected = correctingAnaraut
  ? planDraigRoomCorrection(baseline, 'anaraut', storageUrl(artwork[0]))
  : planDraigRoomRefresh(baseline, Object.fromEntries(artwork.map(item => [item.id, storageUrl(item)])));
const publicRead = async () => {
  const response = await fetch(`https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents${modulePath}`, { signal: AbortSignal.timeout(30000) });
  assert(response.ok, `Öffentliche Modulprüfung: HTTP ${response.status}`);
  return entryOf(await response.json());
};
const verifyBaseline = current => {
  if (JSON.stringify(current) === JSON.stringify(expected)) return true;
  assert.deepEqual(current, baseline, 'Der Wohntrakt wurde inzwischen bearbeitet; keine fremden Änderungen überschreiben.');
  return false;
};
const initial = await publicRead();
const alreadyApplied = verifyBaseline(initial);
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ dryRun: true, moduleId: baseline.id, alreadyApplied,
    pagesBefore: baseline.pages.length, pagesAfter: expected.pages.length,
    removed: baseline.pages.filter(page => !expected.pages.some(next => next.commentThreadKey === page.commentThreadKey)).map(page => page.pageTitle),
    roomScenes: DRAIG_ROOMS.filter(room => artwork.some(art => art.id === room.id)).map(room => ({ name: room.name, thread: `wohntrakte-${room.id}` })),
    preservedGawainThread: true, commentsWritten: 0, profileWrites: 0 }));
} else {
  const { request, publishFamilyArtwork } = await createContentPublicationClient();
  const document = await request(modulePath);
  const config = await request('/char_tabs/config');
  assert(document && config, 'Modul oder Konfiguration fehlt.');
  const before = entryOf(document);
  const present = verifyBaseline(before);
  const configData = decodeFirestoreFields(config.fields);
  assert(configData.moduleStoreManifest?.customSections?.some(section => section.entryIds?.includes(baseline.id)), 'Modulplatzierung fehlt.');
  assert(!configData.hiddenModuleIds?.[baseline.id] && !configData.moduleStoreManifest.hiddenModuleIds?.[baseline.id], 'Modul ist ausgeblendet.');
  const now = new Date().toISOString();
  if (!present) await backupContentPublication(correctingAnaraut ? 'anaraut-without-dog-v3' : 'draig-rooms-v2', [document, config], [], now);
  const assets = [];
  for (const item of artwork) {
    const asset = await publishFamilyArtwork({ familyId: 'haus-draig',
      assetId: assetIdOf(item), bytes: item.bytes,
      metadata: { characterId: DRAIG_ROOMS.find(room => room.id === item.id).characterId,
        moduleId: baseline.id, kind: 'scene', sha256: item.sha256 } });
    assert.equal(asset.url, storageUrl(item));
    assets.push({ id: item.id, ...asset });
  }
  if (!present) {
    const revision = Math.max(Date.now(), Number(configData.moduleStoreUpdatedAtClient || 0) + 1,
      Number(configData.moduleStoreManifest.updatedAtClient || 0) + 1);
    await request(':commit', { writes: [
      { update: { name: document.name, fields: { entryJson: { stringValue: JSON.stringify(expected) }, updatedAtClient: { integerValue: String(revision) } } },
        updateMask: { fieldPaths: ['entryJson', 'updatedAtClient'] },
        updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }], currentDocument: { updateTime: document.updateTime } },
      { update: { name: config.name, fields: { moduleStoreUpdatedAtClient: { integerValue: String(revision) },
          moduleStoreManifest: { mapValue: { fields: { updatedAtClient: { integerValue: String(revision) } } } } } },
        updateMask: { fieldPaths: ['moduleStoreUpdatedAtClient', 'moduleStoreManifest.updatedAtClient'] },
        updateTransforms: [{ fieldPath: 'moduleStoreUpdatedAt', setToServerValue: 'REQUEST_TIME' }], currentDocument: { updateTime: config.updateTime } }
    ] });
  }
  const verified = await publicRead();
  assert.deepEqual(verified, expected, 'Öffentlicher Modulstand weicht ab.');
  const configAfter = await request('/char_tabs/config');
  for (const [key, value] of Object.entries(config.fields)) {
    if (['moduleStoreUpdatedAt', 'moduleStoreUpdatedAtClient'].includes(key)) continue;
    if (key === 'moduleStoreManifest') {
      const oldManifest = structuredClone(value), nextManifest = structuredClone(configAfter.fields[key]);
      delete oldManifest.mapValue.fields.updatedAtClient;
      delete nextManifest.mapValue.fields.updatedAtClient;
      assert.deepEqual(nextManifest, oldManifest, 'Manifest über seine Revision hinaus verändert.');
    } else assert.deepEqual(configAfter.fields[key], value, `Fremdes Konfigurationsfeld verändert: ${key}`);
  }
  const packageBefore = JSON.parse(await readFile(new URL('module-import.json', sourceDirectory), 'utf8'));
  await writeFile(new URL('module-published.json', directory), JSON.stringify({ ...packageBefore, entry: verified }, null, 2) + '\n');
  const receipt = { publishedAt: now, moduleId: baseline.id, pages: verified.pages.length,
    rooms: 8, updatedRooms: artwork.map(item => item.id), removedPage: correctingAnaraut ? null : 'Verlauf', commentsWritten: 0, profileWrites: 0,
    existingThreadKeysPreserved: true, existingSceneDatesPreserved: true,
    unrelatedConfigUnchanged: true, publicReadbackVerified: true, assets,
    url: `https://dieweltvonaleria.netlify.app/AleriaAlmanach/AleriaAlmanach.html?entry=${baseline.id}` };
  await writeFile(new URL('publication-verification.json', directory), JSON.stringify(receipt, null, 2) + '\n');
  if (correctingAnaraut) {
    const previousReceipt = JSON.parse(await readFile(new URL('previous-publication-verification.json', directory), 'utf8'));
    const allAssets = previousReceipt.assets.map(asset => assets.find(next => next.id === asset.id) || asset);
    await writeFile(new URL('module-published.json', sourceDirectory), JSON.stringify({ ...packageBefore, entry: verified }, null, 2) + '\n');
    await writeFile(new URL('publication-verification.json', sourceDirectory), JSON.stringify({ ...receipt, assets: allAssets,
      assetsVerifiedThisRevision: assets.length, correction: 'anaraut-without-dog-v3' }, null, 2) + '\n');
  }
  console.log(JSON.stringify({ published: true, alreadyApplied: present, pages: verified.pages.length, rooms: 8, url: receipt.url }));
}
