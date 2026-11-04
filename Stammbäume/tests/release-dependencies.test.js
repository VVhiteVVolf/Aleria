import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readFile, symlink, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chartReleaseDependencyPlan, chartDependencyInstallCommand, prepareChartReleaseDependencies } from '../tools/prepare-release-dependencies.mjs';

const version = '1.61.1';
const browserVersion = '149.0.7827.55';
const lockedPackage = {
  version, resolved: `https://registry.npmjs.org/playwright-core/-/playwright-core-${version}.tgz`,
  integrity: 'sha512-fixture', engines: { node: '>=18' }
};
const manifest = { name: 'chart-release-fixture', devDependencies: { 'playwright-core': version } };
const lock = { lockfileVersion: 3, packages: { '': manifest, 'node_modules/playwright-core': lockedPackage } };

async function fixture(t, { installed = true } = {}) {
  const directory = await mkdtemp(join(tmpdir(), 'aleria-chart-release-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const json = (path, value) => writeFile(join(directory, path), JSON.stringify(value));
  await json('package.json', manifest);
  await json('package-lock.json', lock);
  async function install() {
    await mkdir(join(directory, 'node_modules/playwright-core'), { recursive: true });
    await json('node_modules/.package-lock.json', { lockfileVersion: 3, packages: { 'node_modules/playwright-core': lockedPackage } });
    await json('node_modules/playwright-core/package.json', { name: 'playwright-core', version, main: 'index.js' });
    await json('node_modules/playwright-core/browsers.json', { browsers: [{ name: 'chromium-headless-shell', revision: '1228', browserVersion }] });
    for (const file of ['index.js', 'cli.js']) await writeFile(join(directory, 'node_modules/playwright-core', file), '');
  }
  if (installed) await install();
  return { directory, install, json };
}

const failRun = () => assert.fail('Existing matching dependencies must be reused.');
const quiet = () => {};

test('the official release entrypoint uses guarded preparation and executes these dependency regressions', async () => {
  const source = await readFile(new URL('../tools/check-release.mjs', import.meta.url), 'utf8');
  assert.match(source, /import \{ prepareChartReleaseDependencies \} from '\.\/prepare-release-dependencies\.mjs'/);
  assert.match(source, /await prepareChartReleaseDependencies\(\{ directory: cwd,/);
  assert.ok(source.includes("'tests/release-dependencies.test.js'"));
  assert.ok(!source.includes("run('npm'"));
  assert.ok(!source.includes('npm ci --include'));
  assert.ok(!source.includes("await run(process.execPath, ['node_modules/playwright-core/cli.js'"));
  for (const name of ['family-chart-reading', 'family-chart-partnerships', 'relationship-matrix', 'chart-geometry-audit', 'family-chart-overview', 'person-entry-viewport']) {
    assert.ok(source.includes(`'tests/${name}.test.js'`), name);
  }
});

test('matching lock, installed package and browser version reuse dependencies without installation', async t => {
  const { directory } = await fixture(t);
  assert.deepEqual((await chartReleaseDependencyPlan({ directory })).reasons, []);
  let probes = 0;
  await prepareChartReleaseDependencies({ directory, run: failRun, log: quiet, probeBrowser: async () => { probes++; return browserVersion; } });
  assert.equal(probes, 1, 'Reuse requires a working versioned browser, not an executable existence check.');
});

test('manifest/lock disagreement fails before any install or browser probe', async t => {
  const { directory, json } = await fixture(t);
  await json('package.json', { ...manifest, devDependencies: { 'playwright-core': '1.60.0' } });
  await assert.rejects(prepareChartReleaseDependencies({ directory, run: failRun, log: quiet, probeBrowser: failRun }), /lock does not match devDependencies/);
});

test('an incompatible Node toolchain fails without attempting npm ci', async t => {
  const { directory } = await fixture(t);
  await assert.rejects(chartReleaseDependencyPlan({ directory, nodeVersion: '17.9.1' }), /requires Node >=18/);
  assert.deepEqual((await chartReleaseDependencyPlan({ directory, nodeVersion: '18.0.0' })).reasons, []);
});

test('missing dependencies are installed once and the resulting installation is validated', async t => {
  const { directory, install } = await fixture(t, { installed: false });
  const commands = [];
  await prepareChartReleaseDependencies({ directory, log: quiet, probeBrowser: async () => browserVersion, run: async command => { commands.push(command); await install(); } });
  assert.equal(commands.length, 1);
  assert.equal(commands[0].directory, directory);
  assert.ok(commands[0].args.includes('ci'));
  await prepareChartReleaseDependencies({ directory, log: quiet, probeBrowser: async () => browserVersion, run: failRun });
});

test('matching package version with a different installed lock integrity requires a clean install', async t => {
  const { directory, install, json } = await fixture(t);
  await json('node_modules/.package-lock.json', { lockfileVersion: 3, packages: { 'node_modules/playwright-core': { ...lockedPackage, integrity: 'sha512-other' } } });
  assert.ok((await chartReleaseDependencyPlan({ directory })).reasons.some(reason => reason.startsWith('install lock:')));
  let installs = 0;
  await prepareChartReleaseDependencies({ directory, log: quiet, probeBrowser: async () => browserVersion, run: async () => { installs++; await install(); } });
  assert.equal(installs, 1);
});

test('a mismatch never cleans shared Playwright dependencies through a junction', async t => {
  const { directory } = await fixture(t, { installed: false });
  const shared = await mkdtemp(join(tmpdir(), 'aleria-chart-shared-'));
  assert(shared.startsWith(join(tmpdir(), 'aleria-chart-shared-')));
  t.after(() => rm(shared, { recursive: true, force: true }));
  await writeFile(join(shared, 'original.txt'), 'keep shared original');
  await symlink(shared, join(directory, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(prepareChartReleaseDependencies({ directory: directory + '/', run: failRun, probeBrowser: failRun, log: quiet }), /Refusing npm ci/);
  assert.equal(await readFile(join(shared, 'original.txt'), 'utf8'), 'keep shared original');
});

test('a stale installed version or missing CLI invalidates dependency reuse', async t => {
  const { directory, json, install } = await fixture(t);
  await json('node_modules/playwright-core/package.json', { name: 'playwright-core', version: '1.60.0', main: 'index.js' });
  assert.ok((await chartReleaseDependencyPlan({ directory })).reasons.some(reason => reason.startsWith('installed version:')));
  await install();
  await rm(join(directory, 'node_modules/playwright-core/cli.js'));
  assert.ok((await chartReleaseDependencyPlan({ directory })).reasons.length);
});

test('an unsuccessful install cannot continue into browser preparation', async t => {
  const { directory } = await fixture(t, { installed: false });
  await assert.rejects(prepareChartReleaseDependencies({ directory, log: quiet, run: async () => {}, probeBrowser: failRun }), /dependencies remain unavailable/);
});

test('only the missing locked headless browser is installed, then its version is verified again', async t => {
  const { directory } = await fixture(t);
  let probes = 0;
  const commands = [];
  await prepareChartReleaseDependencies({ directory, log: quiet, probeBrowser: async () => {
    if (++probes === 1) throw Error("browserType.launch: Executable doesn't exist at /cache/chromium_headless_shell-1228/chrome-headless-shell");
    return browserVersion;
  }, run: async command => { commands.push(command); } });
  assert.equal(probes, 2);
  assert.deepEqual(commands.map(({ args }) => args), [['node_modules/playwright-core/cli.js', 'install', 'chromium', '--only-shell']]);
});

test('wrong browser versions and OS launch failures do not trigger redundant downloads', async t => {
  const { directory } = await fixture(t);
  await assert.rejects(prepareChartReleaseDependencies({ directory, log: quiet, run: failRun, probeBrowser: async () => '148.0.0.1' }), /revision 1228 requires/);
  await assert.rejects(prepareChartReleaseDependencies({ directory, log: quiet, run: failRun, probeBrowser: async () => { throw Error('Missing system library'); } }), /Missing system library/);
});

test('a browser install must actually provide the required revision', async t => {
  const { directory } = await fixture(t);
  let installs = 0;
  await assert.rejects(prepareChartReleaseDependencies({ directory, log: quiet, run: async () => { installs++; }, probeBrowser: async () => { throw Error("Executable doesn't exist at /cache/expected-revision"); } }), /Executable doesn't exist/);
  assert.equal(installs, 1);
});

test('Windows npm uses the existing cmd wrapper and all clean-install flags', () => {
  assert.deepEqual(chartDependencyInstallCommand('win32', 'C:\\Windows\\System32\\cmd.exe'), {
    command: 'C:\\Windows\\System32\\cmd.exe', args: ['/d', '/s', '/c', 'npm', 'ci', '--include=dev', '--ignore-scripts', '--no-audit', '--no-fund']
  });
  assert.equal(chartDependencyInstallCommand('linux').command, 'npm');
});
