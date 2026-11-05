import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, copyFile, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const sourceRoot = fileURLToPath(new URL('../../', import.meta.url));

test('prepare resumes the verified package, full runs revalidate, and unknown overlay edits stay protected', async t => {
  const root = await mkdtemp(path.join(tmpdir(), 'aleria-release-flow-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  for (const name of ['release', 'snapshot', 'canonical-source', 'git-state', 'prepared-release', 'release-timings',
    'publication-inventory', 'netlify-client']) {
    await mkdir(path.join(root, 'netlify/release'), { recursive: true });
    await copyFile(path.join(sourceRoot, 'netlify/release', name + '.mjs'), path.join(root, 'netlify/release', name + '.mjs'));
  }
  for (const name of ['site-build-plan', 'site-build-receipt', 'run-site-build', 'site-publish',
    'site-build-metrics', 'build-checkpoints', 'publication-policy']) {
    await mkdir(path.join(root, 'netlify/build'), { recursive: true });
    await copyFile(path.join(sourceRoot, 'netlify/build', name + '.mjs'), path.join(root, 'netlify/build', name + '.mjs'));
  }
  // HTTP is rejected before fetch by the baseline reader: this fixture never
  // connects to GitHub, Netlify, or any other external service.
  await writeFile(path.join(root, 'netlify/release/config.mjs'), `
    export const RELEASE_SITE = { id: 'fixture', origin: 'http://example.invalid', remote: 'origin', branch: 'master' };
    export const GENERATED_OUTPUTS = ['catalog.json'];
    export const RELEASE_STATE_DIRECTORY = '.release-state';
  `);
  await writeFile(path.join(root, 'netlify/build/site-build-tasks.mjs'), `
    export const SHARED_BUILD_INPUTS = ['netlify/'];
    export const SITE_BUILD_TASKS = [
      { id: 'generator', always: true, inputs: ['generate.mjs'], commands: [['generate.mjs']] },
      { id: 'check', inputs: ['tests/'], commands: [['--test', '--experimental-test-isolation=none', 'tests/check.test.mjs']] }
    ];
  `);
  await mkdir(path.join(root, 'tests'));
  await writeFile(path.join(root, 'tests/check.test.mjs'), `
    import test from 'node:test'; import { readFile, writeFile } from 'node:fs/promises';
    test('fixture check', async () => {
      const count = Number(await readFile('.release-state/count', 'utf8').catch(() => '0'));
      await writeFile('.release-state/count', String(count + 1));
    });
  `);
  await writeFile(path.join(root, 'generate.mjs'), `import { writeFile } from 'node:fs/promises'; await writeFile('catalog.json', '{"revision":1}');`);
  await writeFile(path.join(root, 'catalog.json'), '{"revision":0}');
  await writeFile(path.join(root, 'index.html'), 'fixture page');
  await writeFile(path.join(root, '.gitignore'), '.release-state/\n.site-publish/\nbuild-meta/\n');
  git(['init', '-q']); git(['config', 'user.name', 'Release fixture']);
  git(['config', 'user.email', 'fixture@example.invalid']); git(['config', 'core.autocrlf', 'false']);
  git(['add', '.']); git(['commit', '-qm', 'fixture']);
  const prepare = extra => execFileSync(process.execPath, ['netlify/release/release.mjs', '--prepare', ...extra],
    { cwd: root, encoding: 'utf8', stdio: 'pipe' });
  prepare([]);
  const first = await readFile(path.join(root, '.release-state/prepared.json'), 'utf8');
  assert.equal(await readFile(path.join(root, '.release-state/count'), 'utf8'), '1');
  assert.match(prepare([]), /Reuse verified prepared package/);
  assert.equal(await readFile(path.join(root, '.release-state/prepared.json'), 'utf8'), first);
  assert.equal(await readFile(path.join(root, '.release-state/count'), 'utf8'), '1');
  const reused = JSON.parse(await readFile(path.join(root, '.release-state/last-run-timings.json'), 'utf8'));
  assert.equal(reused.status, 'passed');
  assert.ok(!reused.phases.some(phase => phase.name === 'checks' || phase.name === 'publication-snapshot'));
  git(['add', 'catalog.json']); git(['commit', '-qm', 'review generated output']);
  prepare(['--full']);
  assert.equal(await readFile(path.join(root, '.release-state/count'), 'utf8'), '2');
  await writeFile(path.join(root, 'catalog.json'), 'manual output to preserve');
  assert.throws(() => prepare([]), /Command failed/);
  assert.equal(await readFile(path.join(root, 'catalog.json'), 'utf8'), 'manual output to preserve');
  const failed = JSON.parse(await readFile(path.join(root, '.release-state/last-run-timings.json'), 'utf8'));
  assert.equal(failed.status, 'failed');
  assert.equal(failed.phases.at(-1).name, 'fresh-workspace-check');
});
