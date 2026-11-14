import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { collectLocalChanges } from '../release/local-change-overview.mjs';
import { assertLocalChangePath, parseLocalInputReceipt, parseLocalChangeScope,
  classifyLocalChange, localChangeExclusion } from '../release/local-change-policy.mjs';
import { formatLocalChanges } from '../release/local-changes.mjs';

const sha = value => createHash('sha256').update(value).digest('hex');
const oldBlob = 'a'.repeat(40), newBlob = 'b'.repeat(40);
const record = { path: 'index.html', reviewedLocalSha256: sha('local'), reconciledPublicBlob: oldBlob };
const receipt = { owner: 'aleria-local-publication-inputs-v1', publicCommit: oldBlob, records: [record] };
const scope = { owner: 'aleria-local-change-scope-v1', publicRoot: 'public', excludedPaths: [], excludedPrefixes: [], excludedNameFragments: [] };

test('unchanged reconciled input never rolls back newer public refinements or public removal', () => {
  for (const currentBlob of [oldBlob, newBlob, undefined]) {
    const result = classifyLocalChange({ record, currentBlob, local: { sha256: record.reviewedLocalSha256, blob: 'c'.repeat(40) } });
    assert.equal(result.status, 'reconciled');
    assert.equal(result.publicRefined, currentBlob !== oldBlob);
  }
});

test('changed input distinguishes an independent local edit from concurrent public changes', () => {
  const local = { sha256: sha('changed'), blob: 'c'.repeat(40) };
  assert.equal(classifyLocalChange({ record, currentBlob: oldBlob, local }).status, 'local-change');
  assert.equal(classifyLocalChange({ record, currentBlob: newBlob, local }).status, 'conflict');
  assert.equal(classifyLocalChange({ record, local }).status, 'conflict');
});

test('matching public bytes, new paths and differences without a known base stay distinct', () => {
  assert.equal(classifyLocalChange({ currentBlob: oldBlob, local: { blob: oldBlob } }).status, 'public-equivalent');
  assert.equal(classifyLocalChange({ currentBlob: oldBlob, local: { blob: newBlob, normalizedBlob: oldBlob } }).status, 'public-equivalent');
  assert.equal(classifyLocalChange({ currentBlob: oldBlob, local: { blob: newBlob } }).status, 'conflict');
  assert.equal(classifyLocalChange({ local: { blob: newBlob } }).status, 'new');
  assert.equal(classifyLocalChange({ local: { missing: true } }).status, 'deleted');
  assert.equal(classifyLocalChange({ local: { blocked: 'outside' } }).status, 'blocked');
});

test('receipts reject unsafe paths, malformed hashes and duplicate records', () => {
  for (const file of ['../file', '/file', 'C:/file', 'a\\b', 'a//b', 'a/./b', 'a\nsecret']) {
    assert.throws(() => assertLocalChangePath(file));
    assert.throws(() => parseLocalInputReceipt({ ...receipt, records: [{ ...record, path: file }] }));
  }
  for (const value of [{}, { ...receipt, owner: 'foreign' }, { ...receipt, publicCommit: 'main' },
    { ...receipt, records: [record, record] }, { ...receipt, records: [{ ...record, reviewedLocalSha256: 'bad' }] }]) {
    assert.throws(() => parseLocalInputReceipt(value));
  }
  assert.equal(parseLocalInputReceipt(receipt).records.size, 1);
});

test('scope rules validate paths and explicit prefix boundaries', () => {
  assert.equal(parseLocalChangeScope(scope).publicRoot, 'public');
  for (const value of [{ ...scope, publicRoot: '../public' }, { ...scope, excludedPrefixes: ['work'] },
    { ...scope, excludedPaths: [{ path: 'a', reason: '' }] }, { ...scope, excludedNameFragments: ['../argall'] }]) {
    assert.throws(() => parseLocalChangeScope(value));
  }
});

test('technical nested Git directories are excluded without accepting unsafe or unrelated directory paths', () => {
  const parsed = parseLocalChangeScope(scope);
  assert.deepEqual(localChangeExclusion('diagnostics/task/catalog-candidate/', parsed), { reason: 'local-tools-and-evidence', technical: true });
  assert.deepEqual(localChangeExclusion('.release-state/own-source/', parsed), { reason: 'local-tools-and-evidence', technical: true });
  for (const file of ['diagnostics/../private/', 'diagnostics//nested/', '../diagnostics/', 'outside/']) assert.throws(() => localChangeExclusion(file, parsed));
});

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'aleria-local-changes-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const publicRoot = path.join(root, 'public');
  const write = async (file, data) => { await mkdir(path.dirname(file), { recursive: true }); await writeFile(file, data); };
  const git = (directory, ...args) => execFileSync('git', ['--no-optional-locks', ...args],
    { cwd: directory, encoding: 'utf8', stdio: 'pipe', env: { ...process.env, GIT_OPTIONAL_LOCKS: '0' } }).trim();
  for (const directory of [root, publicRoot]) {
    await mkdir(directory, { recursive: true });
    git(directory, 'init', '-q'); git(directory, 'config', 'user.name', 'Local overview test');
    git(directory, 'config', 'user.email', 'test@example.invalid'); git(directory, 'config', 'core.autocrlf', 'false');
    await write(path.join(directory, '.gitignore'), '.release-state/\npublic/\n');
    await write(path.join(directory, 'index.html'), directory === root ? 'reviewed local\n' : 'reviewed public refinement\n');
    await write(path.join(directory, 'same.txt'), 'already public\n');
    await write(path.join(directory, 'removed.txt'), 'committed\n');
    git(directory, 'add', '.'); git(directory, 'commit', '-qm', 'fixture');
  }
  const publicCommit = git(publicRoot, 'rev-parse', 'HEAD');
  const data = { owner: 'aleria-local-publication-inputs-v1', publicCommit, records: [{ path: 'index.html',
    reviewedLocalSha256: sha('reviewed local\n'), reconciledPublicBlob: git(publicRoot, 'rev-parse', 'HEAD:index.html') }] };
  const receiptFile = path.join(root, '.release-state/published-local-inputs.json');
  const scopeFile = path.join(root, '.release-state/local-change-scope.json');
  await write(receiptFile, JSON.stringify(data));
  await write(scopeFile, JSON.stringify({ ...scope, reviewedMainCommit: git(root, 'rev-parse', 'HEAD'),
    excludedPaths: [{ path: 'held.txt', reason: 'explicit-user-scope' }],
    excludedNameFragments: ['fleischsammler'], excludedPrefixes: ['private/'] }));
  const releaseFile = path.join(publicRoot, '.release-state/last-release.json');
  const release = { commit: publicCommit, deployId: 'fixture', verifiedFiles: 4,
    url: 'https://dieweltvonaleria.netlify.app', verifiedAt: new Date().toISOString() };
  await write(releaseFile, JSON.stringify(release));
  const run = () => collectLocalChanges({ root });
  return { root, publicRoot, write, git, data, receiptFile, scopeFile, releaseFile, release, run };
}

test('real Git discovery folds diagnostics and reports new files, exclusions, removals and text equivalence', async t => {
  const f = await fixture(t);
  await f.write(path.join(f.root, 'new.js'), 'new feature');
  await f.write(path.join(f.root, 'same.txt'), 'already public\r\n');
  await f.write(path.join(f.root, 'held.txt'), 'excluded');
  await f.write(path.join(f.root, 'module/fleischsammler.js'), 'excluded');
  await f.write(path.join(f.root, 'private/source.txt'), 'private');
  await f.write(path.join(f.root, 'diagnostics/test/report.json'), '{"private":true}');
  await unlink(path.join(f.root, 'removed.txt'));
  const r = await f.run(), byPath = new Map(r.entries.map(row => [row.path, row]));
  assert.equal(byPath.get('index.html').status, 'reconciled');
  assert.equal(byPath.get('same.txt').reason, 'line-ending-equivalent');
  assert.equal(byPath.get('new.js').status, 'new');
  assert.equal(byPath.get('removed.txt').status, 'deleted');
  for (const name of ['held.txt', 'module/fleischsammler.js', 'private/source.txt']) assert.equal(byPath.get(name).status, 'excluded');
  assert(!byPath.has('diagnostics/test/report.json'));
  assert.equal(r.omitted[0].files, 1);
  assert.equal(r.readOnly, true); assert.equal(r.publicationAuthorized, false);
});

test('a public HEAD ahead of production is never treated as already published', async t => {
  const f = await fixture(t);
  await f.write(path.join(f.publicRoot, 'next.js'), 'not deployed');
  f.git(f.publicRoot, 'add', 'next.js'); f.git(f.publicRoot, 'commit', '-qm', 'not deployed');
  await f.write(path.join(f.root, 'next.js'), 'not deployed');
  const report = await f.run();
  assert.equal(report.baseline.unpublishedPublicHead, true);
  assert.equal(report.baseline.publishedCommit, f.data.publicCommit);
  assert.equal(report.entries.find(row => row.path === 'next.js').status, 'new');
});

test('a newer verified public revision preserves unchanged Main input and flags a later concurrent edit', async t => {
  const f = await fixture(t);
  await f.write(path.join(f.publicRoot, 'index.html'), 'new public refinement\n');
  f.git(f.publicRoot, 'add', 'index.html'); f.git(f.publicRoot, 'commit', '-qm', 'public refinement');
  await f.write(f.releaseFile, JSON.stringify({ ...f.release, commit: f.git(f.publicRoot, 'rev-parse', 'HEAD') }));
  let report = await f.run();
  assert.equal(report.entries.find(row => row.path === 'index.html').status, 'reconciled');
  assert.equal(report.summary.publicRefinementsPreserved, 1);
  await f.write(path.join(f.root, 'index.html'), 'new local edit\n');
  report = await f.run();
  assert.equal(report.entries.find(row => row.path === 'index.html').status, 'conflict');
});

test('local edits and deletion are detected even when the path was clean against Main HEAD', async t => {
  const f = await fixture(t);
  await f.write(path.join(f.root, 'index.html'), 'local delta\n');
  f.git(f.root, 'add', 'index.html'); f.git(f.root, 'commit', '-qm', 'local delta');
  let report = await f.run();
  assert.equal(report.entries.find(row => row.path === 'index.html').status, 'local-change');
  await unlink(path.join(f.root, 'index.html'));
  report = await f.run();
  assert.equal(report.entries.find(row => row.path === 'index.html').status, 'deleted');
});

test('new files already committed in Main since its reviewed baseline are still discovered', async t => {
  const f = await fixture(t);
  await f.write(path.join(f.root, 'committed-new.js'), 'new local feature\n');
  f.git(f.root, 'add', 'committed-new.js'); f.git(f.root, 'commit', '-qm', 'new local feature');
  const report = await f.run();
  assert.equal(report.entries.find(row => row.path === 'committed-new.js').status, 'new');
});

test('missing or forged receipt and invalid release records fail instead of guessing publication state', async t => {
  const f = await fixture(t);
  await f.write(f.receiptFile, JSON.stringify({ ...f.data, records: [{ ...f.data.records[0], reconciledPublicBlob: newBlob }] }));
  await assert.rejects(f.run(), /Receipt does not match/);
  await f.write(f.receiptFile, JSON.stringify(f.data));
  await f.write(f.releaseFile, JSON.stringify({ ...f.release, url: 'https://foreign.invalid' }));
  await assert.rejects(f.run(), /verified-public-release/);
  await unlink(f.receiptFile);
  await assert.rejects(f.run(), /ENOENT/);
});

test('symlink files and parent directories leaving the workspace are blocked', async t => {
  const f = await fixture(t), outside = await mkdtemp(path.join(tmpdir(), 'aleria-local-external-'));
  t.after(() => rm(outside, { recursive: true, force: true }));
  await f.write(path.join(outside, 'secret.txt'), 'outside bytes must not be compared');
  await symlink(outside, path.join(f.root, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  const report = await f.run();
  const blocked = report.entries.find(row => row.path.startsWith('linked'));
  assert.equal(blocked.status, 'blocked');
});

test('read-only discovery preserves both Git indexes, local files and the input receipt', async t => {
  const f = await fixture(t);
  await f.write(path.join(f.root, 'new.js'), 'local');
  const paths = [path.join(f.root, '.git/index'), path.join(f.publicRoot, '.git/index'),
    f.receiptFile, f.scopeFile, path.join(f.root, 'index.html'), path.join(f.root, 'new.js')];
  const before = await Promise.all(paths.map(file => readFile(file)));
  const report = await f.run();
  for (let i = 0; i < paths.length; i++) assert.deepEqual(await readFile(paths[i]), before[i]);
  const text = formatLocalChanges(report, { limit: 1 });
  assert(text.includes('nur lesend')); assert(text.includes('new.js'));
  assert(!text.includes('Bereits abgeglichen: index.html'));
});
