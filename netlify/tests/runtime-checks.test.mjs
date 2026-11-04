import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { prepareRuntimeCheckDependencies } from '../build/prepare-runtime-checks.mjs';

async function fixture(t) {
  const root = await mkdtemp(path.join(tmpdir(), 'aleria-runtime-test-'));
  assert(root.startsWith(path.join(tmpdir(), 'aleria-runtime-test-')));
  t.after(() => rm(root, { recursive: true, force: true }));
  const directory = path.join(root, 'AleriaAlmanach'); await mkdir(directory);
  const dependencies = { esbuild: '1.0.0' };
  await writeFile(path.join(directory, 'package.json'), JSON.stringify({ name: 'fixture', dependencies }));
  await writeFile(path.join(directory, 'package-lock.json'), JSON.stringify({ packages: { '': { dependencies }, 'node_modules/esbuild': { version: '1.0.0' } } }));
  async function installed(modules, version = '1.0.0') {
    await mkdir(path.join(modules, 'esbuild'), { recursive: true });
    await writeFile(path.join(modules, 'esbuild/package.json'), JSON.stringify({ name: 'esbuild', version, main: 'index.js' }));
    await writeFile(path.join(modules, 'esbuild/index.js'), 'module.exports = {};');
  }
  return { root, directory, installed };
}

test('matching linked dependencies are reused without executing npm', async t => {
  const { root, directory, installed } = await fixture(t);
  const shared = path.join(root, 'shared'); await installed(shared);
  await symlink(shared, path.join(directory, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  let calls = 0;
  await prepareRuntimeCheckDependencies({ root, scope: 'almanach', run: async () => calls++, log() {} });
  assert.equal(calls, 0);
});

test('a mismatch never runs npm ci through a shared dependency junction', async t => {
  const { root, directory, installed } = await fixture(t);
  const shared = path.join(root, 'shared'); await installed(shared, '0.0.1');
  const original = await readFile(path.join(shared, 'esbuild/package.json'));
  await symlink(shared, path.join(directory, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  let calls = 0;
  await assert.rejects(prepareRuntimeCheckDependencies({ root, scope: 'almanach', run: async () => calls++, log() {} }), /Refusing npm ci/);
  assert.equal(calls, 0);
  assert.deepEqual(await readFile(path.join(shared, 'esbuild/package.json')), original);
});

test('check mode is installation-free even when dependencies are completely absent', async t => {
  const { root } = await fixture(t); let calls = 0;
  await assert.rejects(prepareRuntimeCheckDependencies({ root, scope: 'almanach', check: true, run: async () => calls++, log() {} }), /Missing locked/);
  assert.equal(calls, 0);
});

test('missing dependencies can still be prepared in a normal local owned directory', async t => {
  const { root, directory, installed } = await fixture(t); let calls = 0;
  await prepareRuntimeCheckDependencies({ root, scope: 'almanach', run: async target => {
    assert.equal(target, directory); calls++; await installed(path.join(target, 'node_modules'));
  }, log() {} });
  assert.equal(calls, 1);
});

test('a valuable non-directory at node_modules is not handed to npm cleanup', async t => {
  const { root, directory } = await fixture(t); let calls = 0;
  await writeFile(path.join(directory, 'node_modules'), 'valuable unrelated file');
  await assert.rejects(prepareRuntimeCheckDependencies({ root, scope: 'almanach', run: async () => calls++, log() {} }), /Refusing npm ci/);
  assert.equal(calls, 0);
  assert.equal(await readFile(path.join(directory, 'node_modules'), 'utf8'), 'valuable unrelated file');
});
