import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { readSourceTree, MAX_VALIDATION_AGE_MS } from '../build/site-build-plan.mjs';
import { writeBuildReceipt, BUILD_RECEIPT_PATH } from '../build/site-build-receipt.mjs';
import { snapshotPublication } from '../release/snapshot.mjs';
import { readPreparedRelease, savePreparedRelease } from '../release/prepared-release.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'aleria-prepared-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  git(['init', '-q']); git(['config', 'user.name', 'Release test']);
  git(['config', 'user.email', 'test@example.invalid']); git(['config', 'core.autocrlf', 'false']);
  await mkdir(path.join(root, 'netlify/functions'), { recursive: true });
  await writeFile(path.join(root, 'index.html'), 'committed public page\n');
  await writeFile(path.join(root, 'catalog.json'), '{"version":0}\n');
  await writeFile(path.join(root, 'module.js'), 'export const version = 1;\n');
  await writeFile(path.join(root, 'netlify/functions/example.mjs'), 'export default 1;\n');
  await writeFile(path.join(root, 'netlify.toml'), '[build]\n');
  git(['add', '.']); git(['commit', '-qm', 'fixture']);
  const commit = git(['rev-parse', 'HEAD']).trim(), tree = readSourceTree(root);
  const now = Date.now(), runtime = 'fixture/runtime', siteId = 'fixture-site';
  const plan = [{ id: 'fixture', fingerprint: 'a'.repeat(64), verifiedAt: new Date(now).toISOString() }];
  await writeFile(path.join(root, 'catalog.json'), '{"version":1}\n');
  await writeBuildReceipt(root, { commit, siteId, plan, now: new Date(now).toISOString() });
  const overlays = ['catalog.json', BUILD_RECEIPT_PATH];
  const snapshot = await snapshotPublication(root, tree, { overlays, log() {} });
  const file = path.join(root, '.release-state/prepared.json');
  const options = { commit, runtime, siteId, tree, plan, overlays, now, log() {} };
  const prepared = await savePreparedRelease(file, snapshot, options);
  const reuse = overrides => readPreparedRelease(root, file, { ...options, ...overrides });
  return { root, file, prepared, reuse, options };
}

test('prepared public package and private function imports resume only after content verification', async t => {
  const { prepared, reuse } = await fixture(t);
  assert.deepEqual(await reuse(), prepared);
  assert.equal(await reuse({ force: true }), null);
  assert.equal(await reuse({ commit: 'b'.repeat(40) }), null);
  assert.equal(await reuse({ runtime: 'other/runtime' }), null);
  assert.equal(await reuse({ siteId: 'other-site' }), null);
  assert.equal(await reuse({ now: Date.now() + MAX_VALIDATION_AGE_MS + 1000 }), null);
});

test('changed committed bytes cannot be authorized by editing the cached digest', async t => {
  const { prepared, file, reuse } = await fixture(t);
  await writeFile(path.join(prepared.directory, 'index.html'), 'unreviewed replacement\n');
  const record = prepared.files.find(item => item.file === 'index.html');
  record.sha = 'b'.repeat(40); record.bytes = 23;
  await writeFile(file, JSON.stringify(prepared));
  assert.equal(await reuse(), null);
});

test('extra public or private files invalidate an otherwise valid package', async t => {
  const { prepared, reuse } = await fixture(t);
  for (const base of [prepared.directory, prepared.support]) {
    const file = path.join(base, 'unlisted.txt');
    await writeFile(file, 'must never be uploaded');
    assert.equal(await reuse(), null);
    await unlink(file);
  }
  assert.ok(await reuse());
});

test('private functions and support modules remain bound to their committed source', async t => {
  const { prepared, reuse } = await fixture(t);
  await writeFile(path.join(prepared.support, 'netlify/functions/example.mjs'), 'export default 2;\n');
  assert.equal(await reuse(), null);
});

test('changed generated output and changed check fingerprints invalidate reuse', async t => {
  const { root, reuse, options } = await fixture(t);
  assert.equal(await reuse({ plan: [{ ...options.plan[0], fingerprint: 'c'.repeat(64) }] }), null);
  await writeFile(path.join(root, 'catalog.json'), '{"version":2}\n');
  assert.equal(await reuse(), null);
});

test('cached package cannot bypass the snapshot source mode restrictions', async t => {
  const { reuse, options } = await fixture(t);
  for (const file of ['index.html', 'catalog.json', 'netlify/functions/example.mjs']) {
    const tree = options.tree.map(source => source.file === file
      ? { ...source, object: source.object.replace('100644', '120000') } : source);
    assert.equal(await reuse({ tree }), null);
  }
});

test('expired or future individual checks cannot be refreshed by rewriting preparedAt', async t => {
  const { prepared, root, reuse, options } = await fixture(t);
  for (const offset of [-MAX_VALIDATION_AGE_MS - 1000, 10000]) {
    const receipt = JSON.parse(await readFile(path.join(prepared.directory, BUILD_RECEIPT_PATH), 'utf8'));
    receipt.tasks.fixture.verifiedAt = new Date(options.now + offset).toISOString();
    const bytes = JSON.stringify(receipt);
    await writeFile(path.join(prepared.directory, BUILD_RECEIPT_PATH), bytes);
    await writeFile(path.join(root, BUILD_RECEIPT_PATH), bytes);
    assert.equal(await reuse(), null);
  }
});

test('redirected stage paths and nested links cannot authorize external contents', async t => {
  const { root, prepared, reuse } = await fixture(t);
  const external = path.join(root, 'external'); await mkdir(external);
  await symlink(external, path.join(prepared.directory, 'linked'), process.platform === 'win32' ? 'junction' : 'dir');
  assert.equal(await reuse(), null);
});

test('malformed, incomplete or foreign cached paths fail closed', async t => {
  const { prepared, file, reuse } = await fixture(t);
  for (const value of [{ ...prepared, directory: path.dirname(prepared.directory) },
    { ...prepared, files: prepared.files.slice(1) }, { ...prepared, files: null }]) {
    await writeFile(file, JSON.stringify(value)); assert.equal(await reuse(), null);
  }
  await writeFile(file, 'not JSON'); assert.equal(await reuse(), null);
});
