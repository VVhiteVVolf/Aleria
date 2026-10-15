import assert from 'node:assert/strict';
import { createHash, randomUUID } from 'node:crypto';
import { createRequire } from 'node:module';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { resolve, relative, sep, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';

// A bounded artwork release for five existing scene modules. No room, comment,
// character or combat document is created, removed or rewritten.
const workspace = resolve(fileURLToPath(new URL('../../', import.meta.url)));
const artifacts = new URL('../assets/castell-draig/', import.meta.url);
const manifest = JSON.parse(await readFile(new URL('image-manifest-2026-10-15.json', artifacts), 'utf8'));
const baseline = JSON.parse(await readFile(new URL('modules-before-2026-10-15.json', artifacts), 'utf8'));
const bucket = 'aleriaprojekt.firebasestorage.app';
const database = 'projects/aleriaprojekt/databases/(default)';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const save = (name, value) => writeFile(new URL(name, artifacts), JSON.stringify(value, null, 2) + '\n');
const privateBackups = resolve(workspace, '.private-backups/castell-draig/2026-10-15');

async function savePrivateBackup(name, value) {
  await mkdir(privateBackups, { recursive: true });
  await writeFile(resolve(privateBackups, name), JSON.stringify(value, null, 2) + '\n');
}

function decode(value) {
  if ('mapValue' in value) return Object.fromEntries(Object.entries(value.mapValue.fields || {}).map(([k, v]) => [k, decode(v)]));
  if ('arrayValue' in value) return (value.arrayValue.values || []).map(decode);
  if ('integerValue' in value) return Number(value.integerValue);
  return value.stringValue ?? value.doubleValue ?? value.booleanValue ?? value.timestampValue ?? null;
}

function record(document) {
  return decode({ mapValue: { fields: document.fields } });
}

function entryOf(document) {
  const data = record(document);
  return data.entryJson ? JSON.parse(data.entryJson) : data.entry;
}

function withoutArtwork(entry) {
  const copy = structuredClone(entry);
  delete copy.image;
  for (const page of copy.pages || []) delete page.image;
  return copy;
}

async function validateLocalArtwork() {
  assert.equal(manifest.stylePreset, 'anime-scene-portrait');
  assert.equal(manifest.jobs.length, 37);
  assert.equal(new Set(manifest.jobs.map(job => job.id)).size, 37);
  assert.equal(new Set(manifest.jobs.map(job => job.moduleId + '/' + job.pageIndex)).size, 37);
  assert.equal(baseline.modules.length, 5);
  assert.equal(baseline.modules.flatMap(module => module.entry.pages).filter(page => page.image).length, 37);
  const files = [];
  for (const job of manifest.jobs) {
    assert.equal(job.status, 'generated', 'Unfinished artwork: ' + job.id);
    const localPath = resolve(workspace, job.localPath);
    const allowed = resolve(workspace, 'AleriaAlmanach/public/assets/castell-draig/2026-10-15');
    const child = relative(allowed, localPath);
    assert.ok(child && !isAbsolute(child) && !child.startsWith('..' + sep) && !child.startsWith('..' + '/'), 'Artwork outside its release directory');
    const bytes = await readFile(localPath);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', job.id + ': expected PNG');
    const width = bytes.readUInt32BE(16), height = bytes.readUInt32BE(20);
    assert.equal(width * 3, height * 2, job.id + ': expected 2:3');
    assert.ok(width >= 1024 && height >= 1536);
    const module = baseline.modules.find(item => item.recordId === job.moduleId);
    assert.ok(module?.entry.pages[job.pageIndex]?.image, 'Artwork must replace an existing illustrated page');
    files.push({ job, bytes, sha256: digest(bytes), width, height });
  }
  assert.equal(new Set(files.map(file => file.sha256)).size, files.length, 'Every illustrated room needs its own image');
  return files;
}

async function requireCloudAccess() {
  const require = createRequire(new URL('../../firebase/package.json', import.meta.url));
  const auth = require('firebase-tools/lib/auth.js');
  const account = auth.getProjectDefaultAccount(workspace);
  assert.ok(account?.tokens?.refresh_token, 'Firebase CLI login is required');
  const token = await auth.getAccessToken(account.tokens.refresh_token, ['https://www.googleapis.com/auth/cloud-platform']);
  const headers = { Authorization: 'Bearer ' + token.access_token };
  async function firestore(path, body) {
    const response = await fetch('https://firestore.googleapis.com/v1/' + database + path, {
      method: body ? 'POST' : 'GET',
      headers: { ...headers, 'Content-Type': 'application/json' },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    if (!response.ok) throw new Error('Firestore ' + response.status + ': ' + (await response.json()).error?.message);
    return response.json();
  }
  return { headers, firestore };
}

async function publishArtwork(file, asset, headers) {
  const objectUrl = 'https://storage.googleapis.com/storage/v1/b/' + bucket + '/o/' + encodeURIComponent(asset.storagePath);
  const existing = await fetch(objectUrl, { headers });
  if (existing.status === 404) {
    const boundary = 'castell-draig-' + randomUUID();
    const metadata = {
      name: asset.storagePath, contentType: 'image/png',
      cacheControl: 'public,max-age=31536000,immutable',
      metadata: {
        kind: 'castell-draig-scene-artwork', visibility: 'public', sha256: file.sha256,
        firebaseStorageDownloadTokens: asset.downloadToken, moduleId: file.job.moduleId
      }
    };
    const body = Buffer.concat([
      Buffer.from('--' + boundary + '\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n' + JSON.stringify(metadata)
        + '\r\n--' + boundary + '\r\nContent-Type: image/png\r\n\r\n'),
      file.bytes, Buffer.from('\r\n--' + boundary + '--\r\n')
    ]);
    const response = await fetch('https://storage.googleapis.com/upload/storage/v1/b/' + bucket
      + '/o?uploadType=multipart&ifGenerationMatch=0', {
      method: 'POST', headers: { ...headers, 'Content-Type': 'multipart/related; boundary=' + boundary }, body
    });
    if (!response.ok) throw new Error(file.job.id + ': upload ' + response.status + ' ' + await response.text());
  } else {
    assert.ok(existing.ok, file.job.id + ': storage lookup ' + existing.status);
    assert.equal((await existing.json()).metadata?.sha256, file.sha256, 'Existing storage object differs');
  }
  const download = await fetch(asset.url);
  assert.ok(download.ok, file.job.id + ': anonymous image download ' + download.status);
  assert.equal(download.headers.get('content-type')?.split(';')[0], 'image/png');
  assert.equal(digest(Buffer.from(await download.arrayBuffer())), file.sha256, 'Published image bytes differ');
  asset.verifiedAt = new Date().toISOString();
}

async function publishAllArtwork(files, headers) {
  const fileName = 'asset-publication-2026-10-15.json';
  let publication;
  try { publication = JSON.parse(await readFile(new URL(fileName, artifacts), 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
  publication ||= { schemaVersion: 1, bucket, assets: {} };
  for (const file of files) {
    let asset = publication.assets[file.job.id];
    if (!asset) {
      const storagePath = 'module-assets/castell-draig/2026-10-15/' + file.job.id + '-' + file.sha256.slice(0, 16) + '.png';
      const downloadToken = randomUUID();
      asset = publication.assets[file.job.id] = {
        storagePath, downloadToken, sha256: file.sha256, size: file.bytes.length,
        width: file.width, height: file.height, localPath: file.job.localPath,
        url: 'https://firebasestorage.googleapis.com/v0/b/' + bucket + '/o/' + encodeURIComponent(storagePath)
          + '?alt=media&token=' + downloadToken
      };
    }
    assert.equal(asset.sha256, file.sha256, 'Published release cannot silently replace its artwork');
  }
  await save(fileName, publication);
  let cursor = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (cursor < files.length) {
      const file = files[cursor++];
      await publishArtwork(file, publication.assets[file.job.id], headers);
    }
  }));
  publication.verifiedAt = new Date().toISOString();
  await save(fileName, publication);
  return publication;
}

function replaceEntryImages(document, source, publication) {
  const before = entryOf(document), after = structuredClone(before);
  assert.equal(after.id, source.entry.id);
  const jobs = manifest.jobs.filter(job => job.moduleId === source.recordId);
  for (const job of jobs) {
    const originalPage = source.entry.pages[job.pageIndex];
    const matches = after.pages.filter(page => page.commentThreadKey === originalPage.commentThreadKey);
    assert.equal(matches.length, 1, 'Missing or ambiguous room thread: ' + job.id);
    const page = matches[0], url = publication.assets[job.id].url;
    assert.equal(page.pageTitle, originalPage.pageTitle, 'Room was renamed during image generation: ' + job.id);
    assert.ok(page.image === originalPage.image || page.image === url, 'Room artwork was independently changed: ' + job.id);
    page.image = url;
    if (job.pageIndex === 0) {
      assert.ok(after.image === source.entry.image || after.image === url, 'Module cover was independently changed');
      after.image = url;
    }
  }
  assert.deepEqual(withoutArtwork(after), withoutArtwork(before), 'A non-artwork field changed');
  return { before, after, document, id: source.recordId, images: jobs.length };
}

async function releaseModuleImages(publication, firestore) {
  const documents = await Promise.all(baseline.modules.map(module => firestore('/documents/module_store_entries/' + module.recordId)));
  const config = await firestore('/documents/char_tabs/config');
  const updates = documents.map((document, index) => replaceEntryImages(document, baseline.modules[index], publication));
  const configuration = record(config);
  const revision = Math.max(Date.now(), Number(configuration.moduleStoreUpdatedAtClient || 0) + 1,
    Number(configuration.moduleStoreManifest?.updatedAtClient || 0) + 1);
  const changed = updates.filter(update => JSON.stringify(update.before) !== JSON.stringify(update.after));
  await savePrivateBackup('modules-live-before-release.json', { readAt: new Date().toISOString(), documents, config });
  const writes = changed.map(update => ({
    update: { name: update.document.name, fields: {
      entryJson: { stringValue: JSON.stringify(update.after) }, updatedAtClient: { integerValue: String(revision) }
    } },
    updateMask: { fieldPaths: ['entryJson', 'updatedAtClient'] },
    updateTransforms: [{ fieldPath: 'updatedAt', setToServerValue: 'REQUEST_TIME' }],
    currentDocument: { updateTime: update.document.updateTime }
  }));
  if (writes.length) {
    writes.push({
      update: { name: config.name, fields: {
        moduleStoreUpdatedAtClient: { integerValue: String(revision) },
        moduleStoreManifest: { mapValue: { fields: { updatedAtClient: { integerValue: String(revision) } } } }
      } },
      updateMask: { fieldPaths: ['moduleStoreUpdatedAtClient', 'moduleStoreManifest.updatedAtClient'] },
      updateTransforms: [{ fieldPath: 'moduleStoreUpdatedAt', setToServerValue: 'REQUEST_TIME' }],
      currentDocument: { updateTime: config.updateTime }
    });
    await firestore('/documents:commit', { writes });
  }
  const after = await Promise.all(updates.map(update => firestore('/documents/module_store_entries/' + update.id)));
  for (let index = 0; index < updates.length; index++) {
    assert.deepEqual(entryOf(after[index]), updates[index].after, 'Post-release module differs');
    assert.deepEqual(withoutArtwork(entryOf(after[index])), withoutArtwork(updates[index].before));
  }
  const report = {
    verifiedAt: new Date().toISOString(), imageCount: manifest.jobs.length, updatedModules: changed.length,
    nonArtworkFieldsUnchanged: true, roomThreadsUnchanged: true,
    modules: updates.map(update => ({ id: update.id, title: update.after.title, pages: update.after.pages.length, images: update.images }))
  };
  await savePrivateBackup('modules-after-release.json', { report, documents: after });
  await save('release-verification-2026-10-15.json', report);
  return report;
}

const files = await validateLocalArtwork();
if (!process.argv.includes('--apply')) {
  console.log(JSON.stringify({ validated: files.length, modules: baseline.modules.length, mode: 'local-check', totalBytes: files.reduce((sum, file) => sum + file.bytes.length, 0) }));
} else {
  const { headers, firestore } = await requireCloudAccess();
  const publication = await publishAllArtwork(files, headers);
  console.log('All 37 public PNG downloads verified against local SHA-256 hashes.');
  console.log(JSON.stringify(await releaseModuleImages(publication, firestore), null, 2));
}
