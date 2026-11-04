import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { link, lstat, mkdir, mkdtemp, readFile, rm, symlink, unlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { canLinkCanonicalAsset, CANONICAL_SOURCE_MARKER, CANONICAL_SOURCE_OWNER } from '../release/canonical-source.mjs';
import { snapshotPublication } from '../release/snapshot.mjs';
import { readSourceTree } from '../build/site-build-plan.mjs';
import { writeBuildReceipt, BUILD_RECEIPT_PATH } from '../build/site-build-receipt.mjs';
import { readPreparedRelease, savePreparedRelease } from '../release/prepared-release.mjs';

async function fixture(t) {
  const workspace = await mkdtemp(path.join(tmpdir(), 'aleria-canonical-test-'));
  assert(workspace.startsWith(path.join(tmpdir(), 'aleria-canonical-test-')));
  t.after(() => rm(workspace, { recursive: true, force: true }));
  const root = path.join(workspace, '.release-state/public');
  await mkdir(path.join(root, '.release-state'), { recursive: true });
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  git(['init', '-q']); git(['config', 'user.name', 'Release test']); git(['config', 'user.email', 'test@example.invalid']);
  git(['config', 'core.autocrlf', 'false']);
  await writeFile(path.join(root, '.gitignore'), '.release-state/\n.site-publish/\nbuild-meta/\n');
  const bytes = Buffer.alloc(70 * 1024, 4);
  await writeFile(path.join(root, 'picture.png'), bytes);
  await writeFile(path.join(root, 'module.js'), 'export default "source";\n');
  git(['add', '.']); git(['commit', '-qm', 'fixture']);
  const commit = git(['rev-parse', 'HEAD']).trim(), tree = readSourceTree(root);
  const marker = path.join(root, CANONICAL_SOURCE_MARKER);
  const owner = { owner: CANONICAL_SOURCE_OWNER, checkout: root, sourceWorkspace: workspace, commit };
  await writeFile(marker, JSON.stringify(owner));
  return { workspace, root, bytes, commit, tree, marker, owner, git };
}

test('only large binary asset types are eligible; code and data never become source links', () => {
  assert(canLinkCanonicalAsset('assets/picture.png', 70000));
  for (const file of ['module.js', 'data.json', 'source.mjs', 'document.md', 'drawing.svg']) assert(!canLinkCanonicalAsset(file, 1000000));
  assert(!canLinkCanonicalAsset('icon.png', 100));
  assert(!canLinkCanonicalAsset('oversized.png', 129 * 1024 * 1024));
});

test('owned canonical binaries share one dataset while code remains immutable Git copies', async t => {
  const { workspace, root, bytes, commit, tree } = await fixture(t);
  const main = path.join(workspace, 'original.png'); await writeFile(main, bytes);
  const prepared = await snapshotPublication(root, tree, { canonicalSource: true, commit, log() {} });
  assert.equal(prepared.canonicalBinaryLinks, 1); assert.equal(prepared.canonicalBinaryBytes, bytes.length);
  assert.equal((await lstat(path.join(root, 'picture.png'))).ino, (await lstat(path.join(prepared.directory, 'picture.png'))).ino);
  assert.notEqual((await lstat(main)).ino, (await lstat(path.join(prepared.directory, 'picture.png'))).ino);
  await writeFile(path.join(root, 'module.js'), 'local source edit');
  assert.equal(await readFile(path.join(prepared.directory, 'module.js'), 'utf8'), 'export default "source";\n');
  assert.deepEqual(await readFile(main), bytes);
});

test('the default snapshot never shares working-file bytes even when an owner marker exists', async t => {
  const { root, bytes, tree } = await fixture(t);
  const prepared = await snapshotPublication(root, tree, { log() {} });
  assert.equal(prepared.canonicalBinaryLinks, 0);
  await writeFile(path.join(root, 'picture.png'), 'later work');
  assert.deepEqual(await readFile(path.join(prepared.directory, 'picture.png')), bytes);
});

test('stale bytes fall back to committed Git data instead of authorizing a private source change', async t => {
  const { root, bytes, tree, commit } = await fixture(t);
  await writeFile(path.join(root, 'picture.png'), Buffer.alloc(bytes.length, 9));
  const prepared = await snapshotPublication(root, tree, { canonicalSource: true, commit, log() {} });
  assert.equal(prepared.canonicalBinaryLinks, 0);
  assert.deepEqual(await readFile(path.join(prepared.directory, 'picture.png')), bytes);
});

test('an asset already linked to Main or another tree is never reused as a link source', async t => {
  const { workspace, root, bytes, tree, commit } = await fixture(t);
  const main = path.join(workspace, 'main-original.png'); await writeFile(main, bytes);
  await unlink(path.join(root, 'picture.png')); await link(main, path.join(root, 'picture.png'));
  const prepared = await snapshotPublication(root, tree, { canonicalSource: true, commit, log() {} });
  assert.equal(prepared.canonicalBinaryLinks, 0);
  assert.notEqual((await lstat(main)).ino, (await lstat(path.join(prepared.directory, 'picture.png'))).ino);
  assert.deepEqual(await readFile(main), bytes);
});

test('same-blob deduplication cannot leak a canonical binary inode into code, data or private functions', async t => {
  const { root, bytes, tree, commit } = await fixture(t);
  // Keep the binary first to exercise the old firstCopy shortcut explicitly.
  const blob = tree.find(entry => entry.file === 'picture.png').object;
  const aliases = ['z-code.js', 'z-data.json', 'netlify/functions/z-private.mjs'];
  const reordered = [tree.find(entry => entry.file === 'picture.png'), ...tree.filter(entry => entry.file !== 'picture.png'),
    ...aliases.map(file => ({ file, object: blob }))];
  const prepared = await snapshotPublication(root, reordered, { canonicalSource: true, commit, log() {} });
  assert.equal(prepared.canonicalBinaryLinks, 1);
  const source = path.join(root, 'picture.png'), sourceInode = (await lstat(source)).ino;
  for (const [base, file] of [[prepared.directory, 'z-code.js'], [prepared.directory, 'z-data.json'],
    [prepared.support, 'z-code.js'], [prepared.support, 'z-data.json'], [prepared.support, aliases[2]]]) {
    assert.notEqual((await lstat(path.join(base, file))).ino, sourceInode, file);
  }
  await writeFile(source, Buffer.alloc(bytes.length, 8));
  for (const [base, file] of [[prepared.directory, 'z-code.js'], [prepared.directory, 'z-data.json'], [prepared.support, aliases[2]]]) {
    assert.deepEqual(await readFile(path.join(base, file)), bytes, file);
  }
});

test('one owned index refresh retains generated edits as unstaged while caching binary-link metadata', async t => {
  const { root, tree, commit, git } = await fixture(t);
  await writeFile(path.join(root, 'module.js'), 'export default "generated";\n');
  await snapshotPublication(root, tree, { canonicalSource: true, commit, overlays: ['module.js'], log() {} });
  try { git(['update-index', '--refresh']); }
  catch (error) { assert.equal(error.status, 1, 'Only actual unstaged generated content may require an update.'); }
  assert.equal(git(['diff', '--cached', '--name-only']).trim(), '');
  assert.deepEqual(git(['diff', '--name-only', 'HEAD']).trim().split(/\r?\n/), ['module.js']);
  assert.equal(await readFile(path.join(root, 'module.js'), 'utf8'), 'export default "generated";\n');
});

test('foreign, wrong-commit or Main owner markers fail before staging', async t => {
  const { root, marker, owner, tree, commit } = await fixture(t);
  for (const invalid of [{ ...owner, owner: 'foreign' }, { ...owner, commit: 'a'.repeat(40) }, { ...owner, sourceWorkspace: root }]) {
    await writeFile(marker, JSON.stringify(invalid));
    await assert.rejects(snapshotPublication(root, tree, { canonicalSource: true, commit, log() {} }), /Canonical source/);
  }
  await unlink(marker);
  const external = path.join(path.dirname(root), 'external-marker'); await mkdir(external);
  await writeFile(path.join(external, 'public-source.json'), JSON.stringify(owner));
  await rm(path.dirname(marker), { recursive: true });
  await symlink(external, path.dirname(marker), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(snapshotPublication(root, tree, { canonicalSource: true, commit, log() {} }), /redirected/);
});

test('the native complete-byte validator rejects any later edit to a canonical linked asset', async t => {
  const { workspace, root, bytes, tree, commit } = await fixture(t);
  const main = path.join(workspace, 'protected-original.png'); await writeFile(main, bytes);
  const now = Date.now(), siteId = 'site', runtime = 'runtime';
  const plan = [{ id: 'checks', fingerprint: 'a'.repeat(64), verifiedAt: new Date(now).toISOString() }];
  const overlays = [BUILD_RECEIPT_PATH];
  await writeBuildReceipt(root, { siteId, commit, plan });
  const snapshot = await snapshotPublication(root, tree, { canonicalSource: true, commit, overlays, log() {} });
  const record = path.join(root, '.release-state/prepared.json');
  await savePreparedRelease(record, snapshot, { siteId, commit, runtime, now });
  const options = { siteId, commit, runtime, tree, plan, overlays, now, log() {} };
  assert.ok(await readPreparedRelease(root, record, options));
  await writeFile(path.join(root, 'picture.png'), Buffer.alloc(bytes.length, 6));
  assert.equal(await readPreparedRelease(root, record, options), null);
  assert.deepEqual(await readFile(main), bytes);
});
