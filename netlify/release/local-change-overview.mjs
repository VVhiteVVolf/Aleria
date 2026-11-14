import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { lstat, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { git } from './git-state.mjs';
import { RELEASE_SITE } from './config.mjs';
import { assertLocalChangePath, parseLocalInputReceipt, parseLocalChangeScope,
  localChangeExclusion, classifyLocalChange } from './local-change-policy.mjs';

const readGit = (root, args) => git(root, ['--no-optional-locks', ...args],
  { stdio: 'pipe', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0', GIT_NO_LAZY_FETCH: '1' } });
const inside = (root, target) => {
  const relative = path.relative(root, target);
  return relative !== '..' && !relative.startsWith('..' + path.sep) && !path.isAbsolute(relative);
};

async function readJson(file, maxBytes = 16 * 1024 * 1024) {
  const info = await lstat(file);
  if (!info.isFile() || info.isSymbolicLink() || info.size > maxBytes) throw Error('Invalid local-change metadata file.');
  return JSON.parse(await readFile(file, 'utf8'));
}

function readTree(root, commit) {
  const tree = new Map();
  for (const entry of readGit(root, ['ls-tree', '-r', '-z', commit]).split('\0').filter(Boolean)) {
    const tab = entry.indexOf('\t'), [mode, type, object] = entry.slice(0, tab).split(' '), file = entry.slice(tab + 1);
    assertLocalChangePath(file);
    tree.set(file, { mode, type, object });
  }
  return tree;
}

async function readLocalIdentity(root, file) {
  const target = path.resolve(root, file);
  try {
    const before = await lstat(target, { bigint: true });
    if (!before.isFile() || before.isSymbolicLink()) return { blocked: 'not-a-regular-local-file' };
    if (!inside(root, await realpath(target))) return { blocked: 'local-path-leaves-workspace' };
    const sha256 = createHash('sha256'), blob = createHash('sha1').update(`blob ${before.size}\0`);
    const text = before.size <= 10n * 1024n * 1024n ? [] : null;
    let bytes = 0n;
    for await (const chunk of createReadStream(target)) {
      sha256.update(chunk); blob.update(chunk); bytes += BigInt(chunk.length);
      if (bytes > before.size) return { blocked: 'local-file-changed-during-read' };
      if (text) text.push(chunk);
    }
    const after = await lstat(target, { bigint: true });
    if (before.size !== after.size || before.mtimeNs !== after.mtimeNs || before.ino !== after.ino || bytes !== before.size
      || !inside(root, await realpath(target))) return { blocked: 'local-file-changed-during-read' };
    const result = { sha256: sha256.digest('hex'), blob: blob.digest('hex'), bytes: Number(bytes) };
    if (text) {
      const data = Buffer.concat(text);
      if (!data.includes(0) && data.includes(Buffer.from('\r\n'))) {
        const normalized = Buffer.from(data.toString('latin1').replace(/\r\n/g, '\n'), 'latin1');
        result.normalizedBlob = createHash('sha1').update(`blob ${normalized.length}\0`).update(normalized).digest('hex');
      }
    }
    return result;
  } catch (error) {
    return error.code === 'ENOENT' ? { missing: true } : { blocked: 'local-file-unreadable' };
  }
}

export async function collectLocalChanges({ root, receiptFile, scopeFile, publicRoot } = {}) {
  const started = performance.now();
  root = await realpath(root);
  const receipt = parseLocalInputReceipt(await readJson(receiptFile || path.join(root, '.release-state/published-local-inputs.json')));
  const scope = parseLocalChangeScope(await readJson(scopeFile || path.join(root, '.release-state/local-change-scope.json')));
  publicRoot = await realpath(publicRoot || path.resolve(root, scope.publicRoot));
  if (!inside(root, publicRoot) || publicRoot === root) throw Error('Public source must be a separate directory within this workspace.');
  const release = await readJson(path.join(publicRoot, '.release-state/last-release.json'));
  if (!/^[a-f0-9]{40}$/.test(release.commit) || release.url !== RELEASE_SITE.origin
    || !release.deployId || !Number.isInteger(release.verifiedFiles) || release.verifiedFiles < 1
    || !Number.isFinite(Date.parse(release.verifiedAt))) throw Error('Missing valid native verified-public-release record.');
  const receiptTree = readTree(publicRoot, receipt.publicCommit);
  for (const [file, record] of receipt.records) {
    const entry = receiptTree.get(file);
    if (!entry || entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode)
      || entry.object !== record.reconciledPublicBlob) throw Error(`Receipt does not match its public Git tree: ${file}`);
  }
  try { readGit(publicRoot, ['merge-base', '--is-ancestor', receipt.publicCommit, release.commit]); }
  catch { throw Error('Input receipt is not an ancestor of the last verified public release. Review the baseline.'); }
  const tree = receipt.publicCommit === release.commit ? receiptTree : readTree(publicRoot, release.commit);
  const mainHead = readGit(root, ['rev-parse', 'HEAD']).trim();
  const reviewedMainCommit = receipt.reviewedMainCommit || scope.reviewedMainCommit;
  if (!reviewedMainCommit) throw Error('Missing reviewed Main commit in receipt or local scope.');
  try { readGit(root, ['merge-base', '--is-ancestor', reviewedMainCommit, mainHead]); }
  catch { throw Error('Reviewed Main commit is not an ancestor of the current workspace. Review the baseline.'); }
  const publicHead = readGit(publicRoot, ['rev-parse', 'HEAD']).trim();
  const candidates = new Set([
    ...receipt.records.keys(),
    ...readGit(root, ['diff', '--no-renames', '--name-only', '-z', reviewedMainCommit]).split('\0'),
    ...readGit(root, ['ls-files', '--others', '--exclude-standard', '-z']).split('\0'),
  ].filter(Boolean));
  const counts = Object.fromEntries(['new', 'local-change', 'conflict', 'deleted', 'blocked', 'excluded', 'reconciled', 'public-equivalent'].map(key => [key, 0]));
  const entries = [], omitted = new Map(), inspect = [];
  for (const file of [...candidates].sort()) {
    const exclusion = localChangeExclusion(file, scope);
    if (exclusion) {
      counts.excluded++;
      if (exclusion.technical) omitted.set(exclusion.reason, (omitted.get(exclusion.reason) || 0) + 1);
      else entries.push({ path: file, status: 'excluded', reason: exclusion.reason });
    } else inspect.push(file);
  }
  let cursor = 0;
  async function worker() {
    while (cursor < inspect.length) {
      const file = inspect[cursor++], entry = tree.get(file);
      const local = entry && (entry.type !== 'blob' || !['100644', '100755'].includes(entry.mode))
        ? { blocked: 'non-regular-public-git-entry' } : await readLocalIdentity(root, file);
      const classification = classifyLocalChange({ record: receipt.records.get(file), currentBlob: entry?.object, local });
      counts[classification.status]++;
      entries.push({ path: file, ...classification });
    }
  }
  await Promise.all(Array.from({ length: 4 }, worker));
  if (readGit(root, ['rev-parse', 'HEAD']).trim() !== mainHead
    || readGit(publicRoot, ['rev-parse', 'HEAD']).trim() !== publicHead) throw Error('Repository HEAD changed during discovery. Run the overview again.');
  entries.sort((a, b) => a.path.localeCompare(b.path, 'en'));
  return {
    version: 1, owner: 'aleria-local-change-overview-v1', readOnly: true, publicationAuthorized: false,
    checkedAt: new Date().toISOString(), totalSeconds: (performance.now() - started) / 1000,
    baseline: { mainHead, reviewedMainCommit, receiptCommit: receipt.publicCommit, publishedCommit: release.commit, publicHead,
      unpublishedPublicHead: publicHead !== release.commit, scopeSource: scope.source || null },
    summary: { candidates: candidates.size, inspectedFiles: inspect.length, receiptRecords: receipt.records.size, counts,
      publicRefinementsPreserved: entries.filter(entry => entry.publicRefined).length,
      requiresReview: counts.new + counts['local-change'] + counts.conflict + counts.deleted + counts.blocked },
    omitted: [...omitted].map(([reason, files]) => ({ reason, files })), entries,
    limits: ['Local discovery against the last native verified release; no network freshness check.',
      'No automatic copy, merge, staging, deletion, build, push or deployment. Unknown differences require review.',
      'Input receipts describe previously reconciled local bytes, not exact equality with public bytes or build validity.'],
  };
}
