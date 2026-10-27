import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, writeFile, rm, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { snapshotPublication, ownedStage, safePublicationPath } from '../release/snapshot.mjs';
import { assertReleaseWorkspace, assertLocalReleaseMessage } from '../release/git-state.mjs';
import { readSourceTree } from '../build/site-build-plan.mjs';
import { shouldPublish } from '../build/site-publish.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'aleria-release-test-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = args => execFileSync('git', args, { cwd: root, stdio: 'pipe', encoding: 'utf8' });
  git(['init', '-q']); git(['config', 'user.name', 'Release test']); git(['config', 'user.email', 'test@example.invalid']);
  await writeFile(path.join(root, '.gitignore'), '.site-publish/\n');
  await writeFile(path.join(root, 'index.html'), 'committed bytes\n');
  await writeFile(path.join(root, 'copy.html'), 'committed bytes\n');
  git(['add', '.']); git(['commit', '-qm', 'fixture']);
  return { root, git };
}

test('source archives leave the deploy while active originals, full-size art and templates remain', () => {
  for (const file of ['Vorschau/Triarchie/assets/generated/taghan.png',
    'Vorschau/Iathneach/assets/warriors/generated-archive/old.png', 'diagnostics/review/REVIEW.md']) {
    assert.equal(shouldPublish(file), false, file);
  }
  for (const file of ['Vorschau/Iathneach/assets/originals/cetchathach.png',
    'Vorschau/Triarchie/assets/warriors/production/taghan.png', 'Stammbäume/assets/images/portraits/person.png',
    'Vorschau/COUNTRY_PREPARATION_TEMPLATE.md', 'output/Patrick-Ideenwerk.zip']) assert(shouldPublish(file), file);
});

test('local push requires a selective skip marker rather than stopping all web publishers', () => {
  assertLocalReleaseMessage('Publish prepared assets [skip netlify]');
  assert.throws(() => assertLocalReleaseMessage('ordinary web-publisher update'), /must contain/);
});

test('snapshot reads the committed release and survives edits made before and after staging', async t => {
  const { root } = await fixture(t);
  await writeFile(path.join(root, 'index.html'), 'new concurrent work');
  const result = await snapshotPublication(root, readSourceTree(root), { log() {} });
  await writeFile(path.join(root, 'copy.html'), 'another concurrent edit');
  assert.equal(await readFile(path.join(result.directory, 'index.html'), 'utf8'), 'committed bytes\n');
  assert.equal(await readFile(path.join(result.directory, 'copy.html'), 'utf8'), 'committed bytes\n');
  assert.equal(result.files.length, 2);
});

test('generated overlays replace their own link without changing an identical committed file', async t => {
  const { root } = await fixture(t);
  await writeFile(path.join(root, 'index.html'), 'generated current catalog');
  const result = await snapshotPublication(root, readSourceTree(root), { overlays: ['index.html'], log() {} });
  assert.equal(await readFile(path.join(result.directory, 'index.html'), 'utf8'), 'generated current catalog');
  assert.equal(await readFile(path.join(result.directory, 'copy.html'), 'utf8'), 'committed bytes\n');
  assert.notEqual(result.files.find(file => file.file === 'index.html').sha, result.files.find(file => file.file === 'copy.html').sha);
});

test('function sources and config are snapshotted privately and imports use immutable public modules', async t => {
  const { root, git } = await fixture(t);
  await mkdir(path.join(root, 'netlify/functions'), { recursive: true });
  await writeFile(path.join(root, 'netlify/functions/example.mjs'), 'export default 1;');
  await writeFile(path.join(root, 'netlify.toml'), '[build]\n');
  await writeFile(path.join(root, 'schema.js'), 'export const version=1;');
  git(['add', '.']); git(['commit', '-qm', 'function']);
  await writeFile(path.join(root, 'netlify/functions/example.mjs'), 'export default 2;');
  const result = await snapshotPublication(root, readSourceTree(root), { log() {} });
  assert.equal(await readFile(path.join(result.support, 'netlify/functions/example.mjs'), 'utf8'), 'export default 1;');
  assert.equal(await readFile(path.join(result.support, 'schema.js'), 'utf8'), 'export const version=1;');
  assert(result.files.every(item => !item.file.startsWith('netlify/') && item.file !== 'netlify.toml'));
});

test('workspace guard rejects uncommitted application changes and allows a diagnostic status writer', async t => {
  const { root } = await fixture(t);
  assertReleaseWorkspace(root);
  await mkdir(path.join(root, 'diagnostics'));
  await writeFile(path.join(root, 'diagnostics/status.json'), '{}');
  assertReleaseWorkspace(root);
  await writeFile(path.join(root, 'index.html'), 'unreviewed');
  assert.throws(() => assertReleaseWorkspace(root), /Commit application/);
  assertReleaseWorkspace(root, { generated: ['index.html'] });
  assert.throws(() => assertReleaseWorkspace(root, { expectedCommit: 'a'.repeat(40) }), /HEAD changed/);
});

test('stage cleanup refuses valuable directories, junctions and escaping publication paths', async t => {
  const { root } = await fixture(t);
  const stage = path.join(root, '.site-publish');
  await mkdir(stage); await writeFile(path.join(stage, 'valuable.md'), 'keep');
  await assert.rejects(ownedStage(root, { remove: true }), /unowned/);
  assert.equal(await readFile(path.join(stage, 'valuable.md'), 'utf8'), 'keep');
  await rm(stage, { recursive: true });
  const external = path.join(root, 'external'); await mkdir(external);
  await writeFile(path.join(external, '.aleria-publish-stage'), 'aleria-site-build-v1\n');
  await symlink(external, stage, process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(ownedStage(root, { remove: true }), /redirected/);
  assert.throws(() => safePublicationPath(root, '../outside'), /publication path|escapes/);
});
