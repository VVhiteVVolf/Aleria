// One additive scene page in the existing residential module. No scene turns,
// comments, profiles, inventories or unrelated module fields are written.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { decodeFirestoreFields } from '../backup/firestore-value-codec.mjs';
import { createContentPublicationClient, backupContentPublication } from './content-publication-client.mjs';

const directory = new URL('../../../AleriaAlmanach/assets/castell-draig/gawain-gemach-2026-11-01/', import.meta.url);
const page = JSON.parse(await readFile(new URL('scene-page.json', directory), 'utf8'));
const baseline = JSON.parse(await readFile(new URL('module-before.json', directory), 'utf8'));
const image = await readFile(new URL('../../../AleriaAlmanach/public/assets/castell-draig/2026-11-01/gawain-gemach.png', import.meta.url));
const moduleId = 'modul-1781470059057';
const threadId = `${moduleId}::session:${page.commentThreadKey}`;
assert.equal(baseline.entry.id, moduleId);
assert.equal(page.commentThreadKey, 'wohntrakte-gawain');
assert.equal(page.sessionPage, true);
assert.equal(image.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
assert.equal(image.readUInt32BE(16) * 3, image.readUInt32BE(20) * 2);
const sha256 = createHash('sha256').update(image).digest('hex');
const base = 'https://firestore.googleapis.com/v1/projects/aleriaprojekt/databases/(default)/documents';
const entryOf = document => {
  const data = decodeFirestoreFields(document.fields);
  return data.entryJson ? JSON.parse(data.entryJson) : data.entry;
};
async function readPublic(path) {
  const response = await fetch(base + path, { signal: AbortSignal.timeout(30000) });
  assert(response.ok, `Public read: HTTP ${response.status}`);
  return response.json();
}
function ensureAdditive(entry) {
  const existing = entry.pages.filter(candidate => candidate.commentThreadKey === page.commentThreadKey);
  assert(existing.length <= 1, 'Duplicate scene thread.');
  const withoutScene = structuredClone(entry);
  withoutScene.pages = withoutScene.pages.filter(candidate => candidate.commentThreadKey !== page.commentThreadKey);
  assert.deepEqual(withoutScene, baseline.entry, 'The residential module changed independently; review before publishing.');
  if (existing.length) assert.deepEqual({ ...existing[0], image: page.image }, page, 'The scene was independently edited.');
  return existing[0];
}

const initial = await readPublic(`/module_store_entries/${moduleId}`);
const existing = ensureAdditive(entryOf(initial));
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ dryRun: true, moduleId, threadId, existingPages: baseline.entry.pages.length,
    resultingPages: baseline.entry.pages.length + 1, existingPagesUnchanged: true, alreadyPresent: !!existing, imageSha256: sha256 }));
} else {
  const { request, publishFamilyArtwork } = await createContentPublicationClient();
  const document = await request(`/module_store_entries/${moduleId}`);
  const config = await request('/char_tabs/config');
  const before = entryOf(document);
  const present = ensureAdditive(before);
  const configData = decodeFirestoreFields(config.fields);
  assert(configData.moduleStoreManifest?.customSections?.some(section => section.entryIds?.includes(moduleId)), 'Module placement is missing.');
  assert(!configData.hiddenModuleIds?.[moduleId] && !configData.moduleStoreManifest.hiddenModuleIds?.[moduleId], 'The module is hidden.');
  const now = new Date().toISOString();
  await backupContentPublication('gawain-chamber', [document, config], [], now);
  const asset = await publishFamilyArtwork({ familyId: 'haus-draig', assetId: `gawain-gemach-${sha256.slice(0, 16)}`,
    bytes: image, metadata: { characterId: 'q1QtSIug74FzzwUAqWrs', moduleId, kind: 'scene', sha256 } });
  const publishedPage = { ...page, image: asset.url };
  const after = structuredClone(before);
  if (present) {
    assert.deepEqual(present, publishedPage, 'Existing scene image differs.');
  } else {
    after.pages.push(publishedPage);
    const revision = Math.max(Date.now(), Number(configData.moduleStoreUpdatedAtClient || 0) + 1,
      Number(configData.moduleStoreManifest.updatedAtClient || 0) + 1);
    await request(':commit', { writes: [
      { update: { name: document.name, fields: { entryJson: { stringValue: JSON.stringify(after) }, updatedAtClient: { integerValue: String(revision) } } },
        updateMask: { fieldPaths: ['entryJson', 'updatedAtClient'] },
        updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }], currentDocument: { updateTime: document.updateTime } },
      { update: { name: config.name, fields: { moduleStoreUpdatedAtClient: { integerValue: String(revision) },
          moduleStoreManifest: { mapValue: { fields: { updatedAtClient: { integerValue: String(revision) } } } } } },
        updateMask: { fieldPaths: ['moduleStoreUpdatedAtClient', 'moduleStoreManifest.updatedAtClient'] },
        updateTransforms: [{ fieldPath: 'moduleStoreUpdatedAt', setToServerValue: 'REQUEST_TIME' }], currentDocument: { updateTime: config.updateTime } }
    ] });
  }
  const verified = await readPublic(`/module_store_entries/${moduleId}`);
  assert.deepEqual(entryOf(verified), after, 'Public module readback differs.');
  assert.deepEqual(after.pages.slice(0, -1), baseline.entry.pages, 'An existing page changed.');
  const configAfter = await request('/char_tabs/config');
  for (const [key, value] of Object.entries(config.fields)) {
    if (['moduleStoreUpdatedAt', 'moduleStoreUpdatedAtClient'].includes(key)) continue;
    if (key === 'moduleStoreManifest') {
      const oldManifest = structuredClone(value), nextManifest = structuredClone(configAfter.fields[key]);
      delete oldManifest.mapValue.fields.updatedAtClient;
      delete nextManifest.mapValue.fields.updatedAtClient;
      assert.deepEqual(nextManifest, oldManifest, 'The module manifest changed beyond its revision.');
    } else assert.deepEqual(configAfter.fields[key], value, `Unrelated config field changed: ${key}`);
  }
  const receipt = { publishedAt: now, moduleId, threadId, pageIndex: after.pages.length - 1, pages: after.pages.length,
    existingPagesUnchanged: true, unrelatedConfigUnchanged: true, sceneCommentsWritten: 0, profileWrites: 0, asset,
    url: `https://dieweltvonaleria.netlify.app/AleriaAlmanach/AleriaAlmanach.html?entry=${moduleId}&thread=${encodeURIComponent(threadId)}` };
  await writeFile(new URL('publication-verification.json', directory), JSON.stringify(receipt, null, 2) + '\n');
  const payload = JSON.parse(await readFile(new URL('module-import.json', directory), 'utf8'));
  payload.entry = after;
  await writeFile(new URL('module-import.json', directory), JSON.stringify(payload, null, 2) + '\n');
  console.log(JSON.stringify(receipt));
}
