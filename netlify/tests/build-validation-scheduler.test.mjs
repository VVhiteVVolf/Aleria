import test from 'node:test';
import assert from 'node:assert/strict';
import { setImmediate } from 'node:timers/promises';
import { canRunValidationInParallel, readBuildConcurrency, scheduleBuildValidation } from '../build/build-validation-scheduler.mjs';
import { executeBuildPlan } from '../build/run-site-build.mjs';

const task = (id, extra = {}) => ({ id, run: true, parallelValidation: true, commands: [['--test', `${id}.test.mjs`]], ...extra });
const deferred = () => { let resolve; const promise = new Promise(value => { resolve = value; }); return { promise, resolve }; };

test('concurrency is bounded and explicitly opted-in; unknown commands and installers remain serial', () => {
  assert.equal(readBuildConcurrency(), 2);
  assert.equal(readBuildConcurrency(['--jobs=1']), 1);
  for (const args of [['--jobs=0'], ['--jobs=5'], ['--jobs=2', '--jobs=3']]) assert.throws(() => readBuildConcurrency(args));
  assert.equal(canRunValidationInParallel(task('pure')), true);
  for (const extra of [{ parallelValidation: false }, { always: true }, { commands: [['generate.mjs']] },
    { commands: [['netlify/build/prepare-runtime-checks.mjs', '--scope=firebase']] }]) {
    assert.equal(canRunValidationInParallel(task('serial', extra)), false);
  }
});

test('serial barriers drain previous readers and run before later readers, respecting the configured limit', async () => {
  const events = []; let active = 0, maximum = 0;
  const plan = [task('a'), task('b'), task('c'), task('writer', { commands: [['generate.mjs']] }), task('d'), task('e')];
  await scheduleBuildValidation(plan, { concurrency: 2, execute: async value => {
    if (value.id === 'writer') assert.equal(active, 0);
    events.push(`start:${value.id}`); maximum = Math.max(maximum, ++active);
    await setImmediate(); active--; events.push(`end:${value.id}`);
  } });
  assert.equal(maximum, 2);
  for (const id of ['a', 'b', 'c']) assert.ok(events.indexOf(`end:${id}`) < events.indexOf('start:writer'));
  for (const id of ['d', 'e']) assert.ok(events.indexOf('end:writer') < events.indexOf(`start:${id}`));
});

test('failure stops new work, drains started checks and never reaches a following generator', async () => {
  const release = deferred(), started = deferred(), calls = []; let complete = false;
  const run = scheduleBuildValidation([task('running'), task('failed'), task('unstarted'),
    task('writer', { commands: [['generate.mjs']] })], { concurrency: 2, execute: async value => {
    calls.push(value.id);
    if (value.id === 'running') { await release.promise; complete = true; }
    else { started.resolve(); throw Error('validation failed'); }
  } });
  const rejection = assert.rejects(run, /validation failed/);
  await started.promise; await setImmediate();
  assert.equal(complete, false);
  assert.deepEqual(calls, ['running', 'failed']);
  release.resolve(); await rejection;
  assert.equal(complete, true);
});

test('jobs=1 retains serial order, reused groups never execute, and invalid limits fail before work', async () => {
  const calls = [];
  await scheduleBuildValidation([task('a'), task('reused', { run: false }), task('b')], {
    concurrency: 1, execute: async value => { calls.push(value.id); },
  });
  assert.deepEqual(calls, ['a', 'b']);
  await assert.rejects(scheduleBuildValidation([task('a')], { concurrency: 0, execute: () => assert.fail() }), /concurrency/);
});

test('timing reports separate command failures, passed tasks and unstarted work without saving error text', async () => {
  let report;
  const plan = [task('passed', { parallelValidation: false }), task('failed', { parallelValidation: false }), task('unstarted')];
  await assert.rejects(executeBuildPlan(plan, { log() {}, onReport: value => { report = value; },
    run: async args => { if (args[1] === 'failed.test.mjs') throw Error('sensitive diagnostic'); },
  }), /sensitive diagnostic/);
  assert.equal(report.status, 'failed');
  assert.deepEqual(report.tasks.map(value => value.status), ['passed', 'failed']);
  assert.ok(report.commands.every(value => value.seconds >= 0));
  assert.equal(report.commands.length, 2);
  assert.ok(!JSON.stringify(report).includes('sensitive diagnostic'));
  assert.equal(plan[1].verifiedAt, null);
  assert.ok(!plan[2].verifiedAt);
});

test('reports omit command arguments as well as exception text', async () => {
  let report;
  await executeBuildPlan([task('script', { commands: [['fixture.mjs', '--token', 'private-argument']] })], {
    log() {}, run: async () => {}, onReport: value => { report = value; },
  });
  assert.equal(report.commands[0].entryPoint, 'fixture.mjs');
  assert.ok(!JSON.stringify(report).includes('private-argument'));
});
