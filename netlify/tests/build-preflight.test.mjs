import test from 'node:test';
import assert from 'node:assert/strict';
import { collectPreflightChecks, runBuildPreflight } from '../build/build-preflight.mjs';
import { executeBuildPlan } from '../build/run-site-build.mjs';

const quest = ['AleriaAlmanach/scripts/build-quest-catalog.mjs', '--check'];
const houses = ['Karten/tools/build-households.mjs', '--check'];
const task = (id, commands, extra = {}) => ({ id, commands, run: true, reason: 'inputs changed', ...extra });

test('preflight collects each known selected catalog once, excluding reuse and output modes', () => {
  const checks = collectPreflightChecks([
    task('one', [quest, houses]), task('two', [houses]), task('reuse', [quest], { run: false }),
    task('output', [[houses[0]], [quest[0], '--check', '--write'], ['unknown.mjs', '--check']]),
  ]);
  assert.deepEqual(checks, [{ args: quest, taskIds: ['one'] }, { args: houses, taskIds: ['one', 'two'] }]);
});

test('all stale catalogs are reported together before expensive tests or generators run', async () => {
  const plan = [task('early-tests', [['--test', 'expensive.test.mjs']]), task('catalogs', [quest, houses]),
    task('output', [['generate.mjs']])];
  const calls = []; let report;
  await assert.rejects(executeBuildPlan(plan, { preflight: true, log() {}, onReport: value => { report = value; },
    run: async args => { calls.push(args); throw Error('stale'); } }), error => {
    assert.equal(error.errors.length, 2);
    assert.match(error.message, /2\/2/);
    return true;
  });
  assert.deepEqual(calls, [quest, houses]);
  assert.equal(report.status, 'failed');
  assert.equal(report.tasks.length, 0);
  assert.ok(plan.every(value => !value.verifiedAt));
  assert.ok(report.commands.every(value => value.phase === 'preflight' && value.status === 'failed'));
});

test('preflight success never substitutes for a complete task or a later check after generation', async () => {
  const calls = [], plan = [task('catalog', [quest]), task('output', [['generate.mjs']]), task('later', [quest])];
  await executeBuildPlan(plan, { preflight: true, log() {}, run: async args => { calls.push(args); } });
  assert.deepEqual(calls, [quest, quest, ['generate.mjs'], quest]);
  assert.ok(plan.every(value => value.verifiedAt));
});

test('a preflight with no selected catalog is a no-op', async () => {
  assert.deepEqual(await runBuildPreflight([task('reused', [quest], { run: false })], {
    log() {}, run: () => assert.fail('must not run'),
  }), { checks: 0 });
});
