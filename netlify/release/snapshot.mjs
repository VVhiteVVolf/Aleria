import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, lstat, realpath, readFile, writeFile, link, rm, unlink } from 'node:fs/promises';
import path from 'node:path';
import { shouldPublish, PUBLISH_DIRECTORY } from '../build/site-publish.mjs';

const OWNER_FILE = '.aleria-publish-stage';
const OWNER = 'aleria-site-build-v1\n';

export function safePublicationPath(root, file) {
  if (!shouldPublish(file)) throw Error(`Not a publication path: ${file}`);
  const target = path.resolve(root, file);
  const relative = path.relative(root, target);
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) throw Error('Publication path escapes stage.');
  return target;
}

export async function ownedStage(root, { remove = false, support = false } = {}) {
  const resolved = await realpath(root);
  const parent = support ? path.join(resolved, '.release-state') : resolved;
  await mkdir(parent, { recursive: true });
  if (await realpath(parent) !== parent) throw Error('Publication parent is redirected.');
  const stage = path.join(parent, support ? 'function-source' : PUBLISH_DIRECTORY);
  const existing = await lstat(stage).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (existing) {
    if (!existing.isDirectory() || existing.isSymbolicLink()
      || await realpath(stage) !== stage
      || await readFile(path.join(stage, OWNER_FILE), 'utf8').catch(() => '') !== OWNER) {
      throw Error('Refusing to remove an unowned or redirected publication stage.');
    }
    // Only this fixed, resolved, marked child of the repository can be removed.
    await rm(stage, { recursive: true, force: true });
  }
  if (!remove) { await mkdir(stage); await writeFile(path.join(stage, OWNER_FILE), OWNER); }
  return stage;
}

class GitOutput {
  constructor(stream) { this.iterator = stream[Symbol.asyncIterator](); this.pending = Buffer.alloc(0); }
  async read(size) {
    const chunks = []; let remaining = size;
    while (remaining) {
      if (!this.pending.length) {
        const next = await this.iterator.next();
        if (next.done) throw Error('Incomplete Git object stream.');
        this.pending = next.value;
      }
      const take = Math.min(remaining, this.pending.length);
      chunks.push(this.pending.subarray(0, take));
      this.pending = this.pending.subarray(take); remaining -= take;
    }
    return Buffer.concat(chunks, size);
  }
  async line() {
    const bytes = [];
    for (let i = 0; i < 200; i++) {
      const value = (await this.read(1))[0];
      if (value === 10) return Buffer.from(bytes).toString('ascii');
      bytes.push(value);
    }
    throw Error('Invalid Git object header.');
  }
}

// Read committed blobs, never hard-link a live working file. A concurrent edit
// can therefore neither alter this snapshot nor leak into an in-flight upload.
export async function snapshotPublication(root, tree, { overlays = [], log = console.log } = {}) {
  const stage = await ownedStage(root);
  const support = await ownedStage(root, { support: true });
  const isSupport = file => file === 'netlify.toml' || file.startsWith('netlify/functions/') || file.startsWith('netlify/lib/');
  const selected = tree.filter(entry => shouldPublish(entry.file) || isSupport(entry.file));
  const child = spawn('git', ['cat-file', '--batch'], { cwd: root, stdio: ['pipe', 'pipe', 'pipe'] });
  let failure = ''; child.stderr.on('data', value => { failure += value; });
  const completion = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve() : reject(Error(`Git snapshot failed: ${failure}`)));
  });
  completion.catch(() => {});
  const output = new GitOutput(child.stdout);
  const firstCopy = new Map(), manifest = [];
  try {
    for (const entry of selected) {
      const [, type, id] = entry.object.split(' ');
      if (type !== 'blob' || !/^100(?:644|755) blob [a-f0-9]{40}$/.test(entry.object)) throw Error(`Unsupported source: ${entry.file}`);
      const publicFile = shouldPublish(entry.file);
      const target = publicFile ? safePublicationPath(stage, entry.file) : path.resolve(support, entry.file);
      if (!publicFile && !target.startsWith(support + path.sep)) throw Error('Private source escapes snapshot.');
      await mkdir(path.dirname(target), { recursive: true });
      let digest;
      if (firstCopy.has(id)) {
        const previous = firstCopy.get(id);
        await link(previous.target, target);
        digest = previous.digest;
      } else {
        child.stdin.write(id + '\n');
        const header = await output.line();
        const match = header.match(/^([a-f0-9]{40}) blob (\d+)$/);
        if (!match || match[1] !== id || Number(match[2]) > 128 * 1024 * 1024) throw Error(`Invalid/oversized Git blob: ${entry.file}`);
        const bytes = await output.read(Number(match[2]));
        if ((await output.read(1))[0] !== 10) throw Error('Invalid Git blob terminator.');
        if (createHash('sha1').update(`blob ${bytes.length}\0`).update(bytes).digest('hex') !== id) throw Error('Git object hash mismatch.');
        await writeFile(target, bytes);
        digest = { sha: createHash('sha1').update(bytes).digest('hex'), bytes: bytes.length };
        firstCopy.set(id, { target, digest });
      }
      if (publicFile) manifest.push({ file: entry.file, ...digest });
      if (manifest.length % 4000 === 0) log(`[release] Snapshot: ${manifest.length}/${selected.length} files`);
    }
    child.stdin.end(); await completion;
    for (const file of overlays) {
      const target = safePublicationPath(stage, file);
      const bytes = await readFile(path.join(root, file));
      await mkdir(path.dirname(target), { recursive: true });
      await unlink(target).catch(error => { if (error.code !== 'ENOENT') throw error; });
      await writeFile(target, bytes);
      const item = { file, sha: createHash('sha1').update(bytes).digest('hex'), bytes: bytes.length };
      const index = manifest.findIndex(entry => entry.file === file);
      if (index < 0) manifest.push(item); else manifest[index] = item;
    }
    // Function imports resolve against the same immutable modules as the site.
    // The support tree is outside the upload directory and contains no secrets.
    for (const item of manifest.filter(item => /\.(?:js|mjs|json)$/.test(item.file))) {
      const target = safePublicationPath(support, item.file);
      await mkdir(path.dirname(target), { recursive: true });
      await link(safePublicationPath(stage, item.file), target);
    }
    return { directory: stage, support, files: manifest };
  } catch (error) { child.kill(); await completion.catch(() => {}); throw error; }
}
