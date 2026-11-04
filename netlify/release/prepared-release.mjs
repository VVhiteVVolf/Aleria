import { createHash, randomUUID } from 'node:crypto';
import { lstat, open, readFile, readdir, realpath, rename, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { BUILD_RECEIPT_PATH } from '../build/site-build-receipt.mjs';
import { BUILD_RECEIPT_VERSION, MAX_VALIDATION_AGE_MS } from '../build/site-build-plan.mjs';
import { shouldPublish } from '../build/site-publish.mjs';
import { inspectOwnedStage, isFunctionSource } from './snapshot.mjs';

const VERSION = 1;
const OWNER_FILE = '.aleria-publish-stage';

async function stageFiles(directory) {
  const files = new Set(), pending = [''];
  while (pending.length) {
    const relative = pending.pop();
    const current = path.join(directory, relative);
    if (await realpath(current) !== current) throw Error('Prepared directory is redirected.');
    for (const entry of await readdir(current, { withFileTypes: true })) {
      const file = relative ? relative + '/' + entry.name : entry.name;
      if (entry.isSymbolicLink()) throw Error('Prepared package contains a symbolic link.');
      if (entry.isDirectory()) pending.push(file);
      else if (entry.isFile()) { if (file !== OWNER_FILE) files.add(file); }
      else throw Error('Prepared package contains a non-regular file.');
    }
  }
  return files;
}

function sameIdentity(a, b) {
  return ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs'].every(key => a[key] === b[key]);
}

async function digestFile(file, cache) {
  const before = await lstat(file, { bigint: true });
  if (!before.isFile() || before.isSymbolicLink() || await realpath(file) !== file) {
    throw Error('Prepared file is not a regular, local file.');
  }
  const key = (before.ino === 0n ? file : '')
    + ['dev', 'ino', 'size', 'mtimeNs', 'ctimeNs'].map(field => before[field]).join('/');
  if (cache.has(key)) return cache.get(key);
  const pending = (async () => {
    const handle = await open(file, 'r');
    try {
      if (!sameIdentity(before, await handle.stat({ bigint: true }))) throw Error('Prepared file changed before verification.');
      const sha = createHash('sha1'), git = createHash('sha1').update(`blob ${before.size}\0`);
      for await (const bytes of handle.createReadStream({ autoClose: false })) { sha.update(bytes); git.update(bytes); }
      if (!sameIdentity(before, await handle.stat({ bigint: true }))
        || !sameIdentity(before, await lstat(file, { bigint: true }))) throw Error('Prepared file changed during verification.');
      return { sha: sha.digest('hex'), git: git.digest('hex'), bytes: Number(before.size) };
    } finally { await handle.close(); }
  })();
  cache.set(key, pending);
  return pending;
}

function matchingFiles(actual, expected) {
  if (actual.size !== expected.size || [...actual].some(file => !expected.has(file))) {
    throw Error('Prepared package file list differs from the committed publication.');
  }
}

function validReceipt(receipt, { siteId, commit, plan, now }) {
  if (receipt?.version !== BUILD_RECEIPT_VERSION || receipt.siteId !== siteId || receipt.commit !== commit) return false;
  return plan.every(task => {
    const previous = receipt.tasks?.[task.id];
    const age = now - Date.parse(previous?.verifiedAt || '');
    return previous?.fingerprint === task.fingerprint && age >= 0 && age < MAX_VALIDATION_AGE_MS;
  });
}

export async function savePreparedRelease(file, snapshot, { siteId, commit, runtime, now = Date.now() }) {
  const prepared = { version: VERSION, siteId, commit, runtime,
    preparedAt: new Date(now).toISOString(), ...snapshot };
  const temporary = file + '.' + randomUUID() + '.pending';
  try {
    await writeFile(temporary, JSON.stringify(prepared, null, 2) + '\n', { flag: 'wx' });
    await rename(temporary, file);
  } finally { await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
  return prepared;
}

// Reuse still verifies every content byte against Git or a declared overlay.
// Saved paths and digests never authorize an extra file or a different source.
export async function readPreparedRelease(root, file, { siteId, commit, runtime, tree, plan,
  overlays, force = false, now = Date.now(), log = console.log } = {}) {
  if (force) return null;
  let prepared;
  try { prepared = JSON.parse(await readFile(file, 'utf8')); }
  catch (error) { if (error.code !== 'ENOENT') log('[release] Prepared receipt unavailable; preparing again.'); return null; }
  const age = now - Date.parse(prepared?.preparedAt || '');
  if (prepared?.version !== VERSION || prepared.siteId !== siteId || prepared.commit !== commit
    || prepared.runtime !== runtime || !(age >= 0 && age < MAX_VALIDATION_AGE_MS)) return null;
  try {
    const directory = await inspectOwnedStage(root), support = await inspectOwnedStage(root, { support: true });
    if (!directory || !support || prepared.directory !== directory || prepared.support !== support) return null;
    for (const source of tree) {
      if ((shouldPublish(source.file) || isFunctionSource(source.file))
        && !/^100(?:644|755) blob [a-f0-9]{40}$/.test(source.object)) throw Error('Unsupported prepared source mode.');
    }
    const publicSources = new Map(tree.filter(entry => shouldPublish(entry.file)).map(entry => [entry.file, entry]));
    for (const overlay of overlays) {
      if (!shouldPublish(overlay)) throw Error('Invalid generated overlay.');
      publicSources.set(overlay, null);
    }
    const privateSources = new Map(tree.filter(entry => isFunctionSource(entry.file)).map(entry => [entry.file, entry]));
    for (const [name, source] of publicSources) if (/\.(?:js|mjs|json)$/.test(name)) privateSources.set(name, source);
    matchingFiles(await stageFiles(directory), new Set(publicSources.keys()));
    matchingFiles(await stageFiles(support), new Set(privateSources.keys()));
    if (!Array.isArray(prepared.files) || prepared.files.length !== publicSources.size) throw Error('Invalid prepared manifest.');
    const manifest = new Map(prepared.files.map(item => [item.file, item]));
    matchingFiles(new Set(manifest.keys()), new Set(publicSources.keys()));
    const receipt = JSON.parse(await readFile(path.join(directory, BUILD_RECEIPT_PATH), 'utf8'));
    if (!validReceipt(receipt, { siteId, commit, plan, now })) throw Error('Prepared checks expired or inputs changed.');
    const cache = new Map(), jobs = [];
    const verify = async (base, name, source, publicFile) => {
      const digest = await digestFile(path.join(base, name), cache);
      if (overlays.includes(name)) {
        const original = await digestFile(path.join(root, name), cache);
        if (digest.sha !== original.sha) throw Error('Generated overlay changed.');
      } else if (!source || source.object.split(' ')[2] !== digest.git) throw Error('Prepared bytes differ from Git.');
      if (publicFile) {
        const item = manifest.get(name);
        if (item.sha !== digest.sha || item.bytes !== digest.bytes) throw Error('Prepared manifest digest differs.');
      }
    };
    for (const [name, source] of publicSources) jobs.push(() => verify(directory, name, source, true));
    for (const [name, source] of privateSources) jobs.push(() => verify(support, name, source, false));
    let next = 0;
    const results = await Promise.allSettled(Array.from({ length: 4 }, async () => {
      while (next < jobs.length) await jobs[next++]();
    }));
    for (const result of results) if (result.status === 'rejected') throw result.reason;
    if (await inspectOwnedStage(root) !== directory || await inspectOwnedStage(root, { support: true }) !== support) {
      throw Error('Prepared stage changed during verification.');
    }
    matchingFiles(await stageFiles(directory), new Set(publicSources.keys()));
    matchingFiles(await stageFiles(support), new Set(privateSources.keys()));
    log(`[release] Reuse verified prepared package: ${prepared.files.length} files.`);
    return prepared;
  } catch (error) {
    log('[release] Prepared package no longer matches its verified inputs; preparing again.');
    return null;
  }
}
