import { createHash } from 'node:crypto';
import { link, lstat, open, readFile, realpath, unlink } from 'node:fs/promises';
import path from 'node:path';

export const CANONICAL_SOURCE_OWNER = 'aleria-canonical-public-source-v1';
export const CANONICAL_SOURCE_MARKER = '.release-state/public-source.json';
const binaryAsset = /\.(?:png|jpe?g|webp|gif|avif|ico|woff2?|ttf|otf|mp3|ogg|wav|mp4|webm|glb|zip)$/i;
const sameIdentity = (first, second, { linked = false } = {}) =>
  ['dev', 'ino', 'size', 'mtimeNs', ...(linked ? [] : ['ctimeNs'])].every(key => first[key] === second[key]);

export function canLinkCanonicalAsset(file, bytes) {
  return binaryAsset.test(file) && bytes >= 64 * 1024 && bytes <= 128 * 1024 * 1024;
}

async function plainDirectory(directory) {
  const info = await lstat(directory);
  if (!info.isDirectory() || info.isSymbolicLink() || await realpath(directory) !== directory) {
    throw Error('Canonical source directory is redirected.');
  }
}

// Opt-in applies only to a separate, owned public checkout. Main is never an
// eligible source. Its creator must materialize Git blobs, finish all checks,
// and freeze this public checkout before calling the snapshot publisher.
export async function openCanonicalSource(root, commit) {
  const resolved = await realpath(root);
  const marker = path.join(resolved, CANONICAL_SOURCE_MARKER);
  const metadata = await lstat(marker).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (!metadata) return null;
  await plainDirectory(resolved);
  await plainDirectory(path.dirname(marker));
  if (!metadata.isFile() || metadata.isSymbolicLink() || await realpath(marker) !== marker) throw Error('Canonical source marker is redirected.');
  const owner = JSON.parse(await readFile(marker, 'utf8'));
  if (owner.owner !== CANONICAL_SOURCE_OWNER || !/^[a-f0-9]{40}$/.test(commit || '') || owner.commit !== commit
    || path.resolve(owner.checkout || '') !== resolved || !path.isAbsolute(owner.sourceWorkspace || '')) {
    throw Error('Canonical source owner or commit does not match this release.');
  }
  const workspace = path.resolve(owner.sourceWorkspace);
  await plainDirectory(workspace);
  await plainDirectory(path.join(workspace, '.release-state'));
  if (resolved === workspace || path.dirname(resolved) !== path.join(workspace, '.release-state')) {
    throw Error('Canonical source must be a separate owned release checkout.');
  }
  const markerBytes = await readFile(marker);
  return {
    async linkAsset(file, object, destination) {
      if (!binaryAsset.test(file) || !/^[a-f0-9]{40}$/.test(object)) return null;
      const source = path.resolve(resolved, file);
      if (!source.startsWith(resolved + path.sep)) throw Error('Canonical source path escapes checkout.');
      const before = await lstat(source, { bigint: true }).catch(error => { if (error.code !== 'ENOENT') throw error; });
      // Existing links could share an inode with Main or another mutable tree.
      if (!before?.isFile() || before.isSymbolicLink() || before.nlink !== 1n
        || !canLinkCanonicalAsset(file, Number(before.size)) || await realpath(source) !== source) return null;
      const handle = await open(source, 'r');
      try {
        if (!sameIdentity(before, await handle.stat({ bigint: true }))) throw Error('Canonical source changed before hashing.');
        const plain = createHash('sha1'), git = createHash('sha1').update(`blob ${before.size}\0`);
        for await (const bytes of handle.createReadStream({ autoClose: false })) { plain.update(bytes); git.update(bytes); }
        const digest = { sha: plain.digest('hex'), bytes: Number(before.size) };
        if (!sameIdentity(before, await handle.stat({ bigint: true })) || !sameIdentity(before, await lstat(source, { bigint: true }))) {
          throw Error('Canonical source changed during hashing.');
        }
        if (git.digest('hex') !== object) return null;
        try { await link(source, destination); }
        catch (error) { if (['EXDEV', 'EPERM', 'ENOTSUP'].includes(error.code)) return null; throw error; }
        const linked = await lstat(destination, { bigint: true }), after = await lstat(source, { bigint: true });
        if (!linked.isFile() || linked.isSymbolicLink() || !sameIdentity(before, linked, { linked: true })
          || !sameIdentity(linked, after) || after.nlink !== 2n) {
          await unlink(destination);
          throw Error('Canonical source identity changed while linking.');
        }
        return digest;
      } finally { await handle.close(); }
    },
    async validate() {
      await plainDirectory(resolved);
      await plainDirectory(path.dirname(marker));
      const current = await lstat(marker);
      if (!current.isFile() || current.isSymbolicLink() || await realpath(marker) !== marker) throw Error('Canonical source marker is redirected.');
      if (!(await readFile(marker)).equals(markerBytes)) throw Error('Canonical source ownership changed during snapshot.');
    },
  };
}
