import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, mkdir, writeFile, stat, access } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SITE_BUILD_TASKS } from '../build/site-build-tasks.mjs';
import { selectBuildTasks, MAX_VALIDATION_AGE_MS } from '../build/site-build-plan.mjs';
import { readPublishedReceipt, writeBuildReceipt, BUILD_RECEIPT_PATH } from '../build/site-build-receipt.mjs';
import { executeBuildPlan } from '../build/run-site-build.mjs';
import { preparePublication, shouldPublish, PUBLISH_DIRECTORY } from '../build/site-publish.mjs';
import { changesRequireBuild } from '../build/ignore-site-build.mjs';

const now = Date.parse('2026-10-15T12:00:00Z');
const options = { now, runtime: 'node/test', siteId: 'test-site' };
const checkCount = SITE_BUILD_TASKS.filter(task => !task.always).length;
const source = file => ({ file, object: '100644 blob ' + 'a'.repeat(40) });
const tree = [
  'netlify/build/run-site-build.mjs', 'netlify.toml', 'shared/calendar.js',
  'AleriaAlmanach/modules/archive/archive-dashboard.js',
  'AleriaAlmanach/modules/combat/combat-profile-model.js',
  'Stammbäume/assets/js/data/families.registry.js', 'Stammbäume/assets/css/layout.css',
  'Stammbäume/assets/images/portraits/person.png',
  'Familien Häuser und Clans/house/haus.biography.mjs',
  'CharakterDatenbank/generated/characters.snapshot.json',
  'AleriaAlmanach/modules/natural-resources/tenebrium-content.mjs'
].map(source);
const baselinePlan = selectBuildTasks(SITE_BUILD_TASKS, tree, options);
const baseline = { version: 1, siteId: options.siteId, commit: 'a'.repeat(40),
  tasks: Object.fromEntries(baselinePlan.map(task => [task.id, {
    fingerprint: task.fingerprint, verifiedAt: new Date(now - 3600000).toISOString()
  }])) };
const select = (nextTree = tree, overrides = {}) => selectBuildTasks(SITE_BUILD_TASKS, nextTree, {
  ...options, baseline, ...overrides
});
const checks = plan => plan.filter(task => task.run && !task.always).map(task => task.id);
const changed = file => tree.map(entry => entry.file === file ? { ...entry, object: '100644 blob ' + 'b'.repeat(40) } : entry);

test('unchanged successful inputs reuse checks while every deploy rebuilds its generated catalogs', () => {
  assert.deepEqual(checks(select()), []);
  assert.deepEqual(select().filter(task => task.run).map(task => task.id), ['build-policy', 'regional-catalog', 'map-media']);
});

test('an archive-only fix checks the archive without checking guides or family charts', () => {
  assert.deepEqual(checks(select(changed('AleriaAlmanach/modules/archive/archive-dashboard.js'))), ['almanach-runtime']);
});

test('cross-feature inputs trigger their consumers, including external house biographies and combat profiles', () => {
  const family = checks(select(changed('Familien Häuser und Clans/house/haus.biography.mjs')));
  assert.ok(family.includes('gameplay-guides'));
  assert.ok(family.includes('regional-equipment'));
  assert.ok(family.includes('family-charts'));
  assert.deepEqual(checks(select(changed('AleriaAlmanach/modules/combat/combat-profile-model.js'))), ['almanach-runtime', 'gameplay-guides']);
  assert.deepEqual(checks(select(changed('CharakterDatenbank/generated/characters.snapshot.json'))), ['gameplay-guides']);
});

test('chart CSS triggers the browser audit, portraits do not trigger geometry that blocks image requests', () => {
  assert.deepEqual(checks(select(changed('Stammbäume/assets/css/layout.css'))), ['family-charts']);
  assert.deepEqual(checks(select(changed('Stammbäume/assets/images/portraits/person.png'))), []);
});

test('added, removed, renamed and multi-commit input changes cannot be missed by a last-commit shortcut', () => {
  assert.ok(checks(select([...tree, source('Stammbäume/assets/js/new-feature.js')])).includes('family-charts'));
  assert.ok(checks(select(tree.filter(entry => !entry.file.endsWith('families.registry.js')))).includes('family-charts'));
  const moved = tree.map(entry => entry.file.endsWith('families.registry.js') ? { ...entry, file: 'Stammbäume/assets/js/renamed.js' } : entry);
  assert.ok(checks(select(moved)).includes('family-charts'));
  const multiple = changed('Stammbäume/assets/js/data/families.registry.js').map(entry => entry.file.includes('/archive/') ? { ...entry, object: 'another change' } : entry);
  assert.ok(checks(select(multiple)).includes('family-charts'));
  assert.ok(checks(select(multiple)).includes('almanach-runtime'));
});

test('unknown, malformed, foreign, expired and future baselines always run checks', () => {
  for (const candidate of [null, {}, { ...baseline, version: 99 }, { ...baseline, siteId: 'other' },
    { ...baseline, commit: 'invalid' }, { ...baseline, tasks: {} }]) {
    assert.equal(checks(select(tree, { baseline: candidate })).length, checkCount);
  }
  assert.equal(checks(select(tree, { now: now + MAX_VALIDATION_AGE_MS })).length, checkCount);
  assert.equal(checks(select(tree, { now: now - 7200000 })).length, checkCount);
});

test('policy, shared code, runtime changes and explicit full validation invalidate all checks', () => {
  assert.equal(checks(select(changed('netlify/build/run-site-build.mjs'))).length, checkCount);
  assert.equal(checks(select(changed('shared/calendar.js'))).length, checkCount);
  assert.equal(checks(select(tree, { runtime: 'new-node' })).length, checkCount);
  assert.equal(checks(select(tree, { force: true })).length, checkCount);
});

test('unrelated documentation and backup changes preserve existing validations', () => {
  assert.deepEqual(checks(select([...tree, source('netlify/docs/build-performance.md'),
    source('Stammbäume/assets/data/published-families/backups/house/old.json')])), []);
});

test('published baseline lookup is bounded, belongs to the main site, and safely falls back on errors', async () => {
  const environment = { NETLIFY: 'true', SITE_ID: 'test-site', URL: 'https://example.netlify.app', DEPLOY_ID: 'candidate' };
  let requested;
  const fetchImpl = async (url, init) => {
    requested = String(url);
    assert.equal(init.cache, 'no-store');
    assert.equal(init.redirect, 'error');
    assert.ok(init.signal);
    return { ok: true, text: async () => JSON.stringify(baseline) };
  };
  assert.deepEqual(await readPublishedReceipt(environment, { fetchImpl }), baseline);
  assert.equal(requested, 'https://example.netlify.app/build-meta/validation.json?build=candidate');
  for (const response of [{ ok: false }, { ok: true, text: async () => 'not json' },
    { ok: true, text: async () => 'x'.repeat(65537) }]) {
    assert.equal(await readPublishedReceipt(environment, { fetchImpl: async () => response, log() {} }), null);
  }
  assert.equal(await readPublishedReceipt({ ...environment, URL: 'http://unsafe.example' }, {
    fetchImpl: () => assert.fail('must not fetch'), log() {}
  }), null);
});

test('a failed step stops the build and cannot produce a validated receipt', async () => {
  const plan = select(tree, { force: true });
  const calls = [];
  await assert.rejects(executeBuildPlan(plan, { log() {}, run: async args => {
    calls.push(args);
    if (calls.length === 2) throw Error('generator failure');
  } }), /generator failure/);
  assert.equal(calls.length, 2);
  await assert.rejects(writeBuildReceipt('.', { siteId: 'test-site', commit: 'a'.repeat(40), plan }), /Unverified/);
});

test('reused receipts retain the original verification time so reuse cannot postpone expiry forever', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'aleria-build-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const plan = select();
  await executeBuildPlan(plan, { log() {}, run: async () => {} });
  await writeBuildReceipt(directory, { siteId: 'test-site', commit: 'b'.repeat(40), plan });
  const stored = JSON.parse(await readFile(path.join(directory, BUILD_RECEIPT_PATH), 'utf8'));
  assert.equal(stored.commit, 'b'.repeat(40));
  assert.equal(stored.tasks['family-charts'].verifiedAt, baseline.tasks['family-charts'].verifiedAt);
});

test('publication preserves runtime modules, original downloads and artwork while excluding authoring tools', () => {
  for (const file of ['index.html', 'Stammbäume/assets/js/data/families.registry.js',
    'Familien Häuser und Clans/house/haus.biography.mjs',
    'AleriaAlmanach/AvatarWerkstatt/Charaktere/portrait.png',
    'Fonts/font/source/original/instructions.docx', '.well-known/example.json']) assert.ok(shouldPublish(file), file);
  for (const file of ['firebase/functions/index.js', 'netlify/functions/family-publisher.mjs',
    'Stammbäume/node_modules/playwright-core/package.json', 'Stammbäume/tests/chart-quality-fixture.html',
    'Stammbäume/tools/check-release.mjs', 'AleriaAlmanach/scripts/build-regional-equipment.mjs',
    '.private-backups/data.json', 'AGENTS.md', 'debug.log', '../outside', '/absolute', 'path\\file']) assert.equal(shouldPublish(file), false, file);
});

test('publication uses post-generation bytes, preserves URLs and omits untracked local work', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'aleria-publication-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, 'build-meta'));
  await writeFile(path.join(directory, BUILD_RECEIPT_PATH), '{}');
  await writeFile(path.join(directory, 'index.html'), 'generated current catalog');
  await writeFile(path.join(directory, 'private-untracked.txt'), 'local work');
  await preparePublication(directory, [source('index.html'), source('netlify/build/private.mjs')], { log() {} });
  const staged = path.join(directory, PUBLISH_DIRECTORY);
  assert.equal(await readFile(path.join(staged, 'index.html'), 'utf8'), 'generated current catalog');
  assert.equal((await stat(path.join(staged, 'index.html'))).size, (await stat(path.join(directory, 'index.html'))).size);
  await assert.rejects(access(path.join(staged, 'private-untracked.txt')));
  await assert.rejects(access(path.join(staged, 'netlify/build/private.mjs')));
  await preparePublication(directory, [source('index.html')], { log() {} });
  assert.equal(await readFile(path.join(staged, 'index.html'), 'utf8'), 'generated current catalog');
});

test('publication never removes an unowned directory', async t => {
  const directory = await mkdtemp(path.join(tmpdir(), 'aleria-stage-guard-test-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  await mkdir(path.join(directory, PUBLISH_DIRECTORY));
  const valuable = path.join(directory, PUBLISH_DIRECTORY, 'user-work.txt');
  await writeFile(valuable, 'keep');
  await assert.rejects(preparePublication(directory, [], { log() {} }), /unowned/);
  assert.equal(await readFile(valuable, 'utf8'), 'keep');
});

test('only private, unconsumed changes can skip an entire deploy', () => {
  assert.equal(changesRequireBuild(['netlify/docs/build-performance.md', 'AGENTS.md']), false);
  for (const files of [['index.html'], ['Stammbäume/assets/images/portraits/person.png'],
    ['AleriaAlmanach/modules/archive/archive-dashboard.js'], ['Stammbäume/tests/geometry.test.js'],
    ['Karten/tools/build-media-library.mjs'], ['netlify/build/ignore-site-build.mjs'],
    ['netlify.toml'], ['shared/calendar.js'], ['firebase/tests/publisher-access.test.mjs']]) {
    assert.equal(changesRequireBuild(files), true, files.join(','));
  }
});
