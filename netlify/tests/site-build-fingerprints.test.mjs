import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { SITE_BUILD_TASKS, SHARED_BUILD_INPUTS } from '../build/site-build-tasks.mjs';
import { BUILD_RECEIPT_VERSION, selectBuildTasks, taskFingerprint } from '../build/site-build-plan.mjs';

const runtime = 'node/fingerprint-equivalence';
const options = { runtime, siteId: 'fingerprint-test', now: Date.parse('2026-11-04T12:00:00Z') };
const source = (file, object = '100644 blob ' + 'a'.repeat(40)) => ({ file, object });
const task = (id, inputs, excludes) => ({ id, inputs, excludes, commands: [['check.mjs', '--check']] });

// The pre-index algorithm is the compatibility contract for existing receipts.
function originalFingerprint(task, tree, runtime) {
  const matches = (file, input) => input.endsWith('/') ? file.startsWith(input) : file === input;
  const selected = tree.filter(({ file }) => [...SHARED_BUILD_INPUTS, ...task.inputs]
    .some(input => matches(file, input)) && !(task.excludes || []).some(input => matches(file, input)))
    .sort((a, b) => a.file.localeCompare(b.file, 'en'));
  const hash = createHash('sha256').update(JSON.stringify({
    version: BUILD_RECEIPT_VERSION, id: task.id, commands: task.commands, runtime
  }));
  for (const { file, object } of selected) hash.update('\0' + file + '\0' + object);
  return hash.digest('hex');
}

function shuffled(rows, seed) {
  const result = rows.slice();
  for (let index = result.length - 1; index > 0; index--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const other = seed % (index + 1);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

const fixture = [
  'feature/a.mjs', 'feature/A.mjs', 'feature/ä.mjs', 'feature/a\u0308.mjs',
  'feature/é.mjs', 'feature/e\u0301.mjs', 'feature/😀.mjs', 'feature/deep/ße.json',
  'feature-other/outside.mjs', 'feature/raw', 'feature/raw/inside.mjs', 'feature/raw/',
  'feature//nested.mjs', 'feature/ignored/excluded.mjs', 'feature/ignored-keep.mjs',
  'shared/always.mjs', 'netlify/build/site-build-plan.mjs',
  'Stammbäume/assets/js/data/families.registry.js', 'Familien Häuser und Clans/Äste/haus.biography.mjs'
].map(file => source(file));
fixture.push(source('feature/a.mjs', '100755 blob ' + 'b'.repeat(40)));

test('indexed planning retains exact fingerprints for shuffled Unicode paths and overlapping inputs', () => {
  const tasks = [
    task('overlap', ['feature/', 'feature/deep/', 'feature/a.mjs', 'feature/']),
    task('exclude', ['feature/'], ['feature/ignored/', 'feature/A.mjs', 'shared/']),
    task('exact', ['feature/raw']),
    task('prefix', ['feature/raw/']),
    task('missing', ['missing/', 'missing.file']),
    task('shared-only', []),
    ...SITE_BUILD_TASKS
  ];
  for (const seed of [1, 2, 3, 97]) {
    const tree = Object.freeze(shuffled(fixture, seed).map(entry => Object.freeze({ ...entry })));
    const before = JSON.stringify(tree);
    const plan = selectBuildTasks(tasks, tree, options);
    for (const [index, value] of tasks.entries()) {
      const expected = originalFingerprint(value, tree, runtime);
      assert.equal(plan[index].fingerprint, expected, value.id);
      assert.equal(taskFingerprint(value, tree, runtime), expected, value.id);
    }
    assert.equal(JSON.stringify(tree), before, 'fingerprinting must not mutate its tree');
  }
});

test('indexed matching keeps exact-file boundaries, subtree exclusions and shared-input precedence', () => {
  const value = task('boundaries', ['feature/raw', 'feature/deep/'], ['feature/deep/ignored/']);
  const tree = [source('feature/raw'), source('feature/deep/kept.mjs'), source('shared/always.mjs')];
  const fingerprint = taskFingerprint(value, tree, runtime);
  for (const file of ['feature/raw/child.mjs', 'feature/raw-extra', 'feature/deep/ignored/secret.mjs', 'feature/deeper/outside.mjs']) {
    assert.equal(taskFingerprint(value, [...tree, source(file)], runtime), fingerprint, file);
  }
  for (const file of ['feature/deep/new.mjs', 'shared/new.mjs']) {
    assert.notEqual(taskFingerprint(value, [...tree, source(file)], runtime), fingerprint, file);
  }
  const excludeShared = { ...value, excludes: ['shared/'] };
  assert.equal(taskFingerprint(excludeShared, tree, runtime),
    taskFingerprint(excludeShared, tree.filter(entry => !entry.file.startsWith('shared/')), runtime));
});

test('existing receipts still invalidate for added, removed, renamed and changed Git entries', () => {
  const value = task('invalidation', ['feature/']);
  const tree = [source('feature/kept.mjs'), source('feature/other.mjs'), source('unrelated/file.mjs')];
  const baseline = { version: BUILD_RECEIPT_VERSION, siteId: options.siteId, commit: 'a'.repeat(40),
    tasks: { [value.id]: { fingerprint: originalFingerprint(value, tree, runtime),
      verifiedAt: new Date(options.now - 1000).toISOString() } } };
  assert.equal(selectBuildTasks([value], tree, { ...options, baseline })[0].run, false);
  const variants = [
    [...tree, source('feature/added.mjs')],
    tree.slice(1),
    tree.map((entry, index) => index ? entry : { ...entry, file: 'feature/renamed.mjs' }),
    tree.map((entry, index) => index ? entry : { ...entry, object: '100644 blob ' + 'b'.repeat(40) }),
    tree.map((entry, index) => index ? entry : { ...entry, object: '100755 blob ' + 'a'.repeat(40) })
  ];
  for (const next of variants) {
    const result = selectBuildTasks([value], next, { ...options, baseline })[0];
    assert.equal(result.fingerprint, originalFingerprint(value, next, runtime));
    assert.equal(result.run, true);
  }
});

test('each planning call indexes current rows without retaining stale tree state', () => {
  const value = task('current-state', ['feature/']);
  const tree = [source('feature/file.mjs')];
  const first = selectBuildTasks([value], tree, options)[0].fingerprint;
  tree[0].object = '120000 blob ' + 'c'.repeat(40);
  const second = selectBuildTasks([value], tree, options)[0].fingerprint;
  assert.notEqual(second, first);
  assert.equal(second, originalFingerprint(value, tree, runtime));
  tree[0].file = 'outside/file.mjs';
  assert.equal(selectBuildTasks([value], tree, options)[0].fingerprint,
    originalFingerprint(value, tree, runtime));
});
