import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, rm, realpath } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { executeBuildPlan } from '../build/run-site-build.mjs';
import { canCheckpointTask } from '../build/build-checkpoints.mjs';
import { SITE_BUILD_TASKS } from '../build/site-build-tasks.mjs';
import { MAX_VALIDATION_AGE_MS } from '../build/site-build-plan.mjs';

const check = ['AleriaAlmanach/scripts/build-item-register.mjs', '--check'];
const fingerprint = value => createHash('sha256').update(value).digest('hex');
const task = (id, extra = {}) => ({ id, fingerprint: fingerprint(id), run: true,
  reason: 'inputs changed', commands: [['--test', `${id}.test.mjs`]], ...extra });
async function fixture(t) {
  const parent = await realpath(tmpdir());
  const root = await mkdtemp(path.join(parent, 'aleria-checkpoint-test-'));
  t.after(async () => {
    const resolved = await realpath(root);
    assert.equal(path.dirname(resolved), parent);
    assert.ok(path.basename(resolved).startsWith('aleria-checkpoint-test-'));
    await rm(resolved, { recursive: true, force: true });
  });
  const file = path.join(root, '.release-state', 'task-checkpoints.json');
  return { root, file, localCheckpoints: { file, runtime: 'node/test', validateBeforeSave: async () => {} } };
}

test('ordinary builds do not create or consume local checkpoints', async t => {
  const { root, file } = await fixture(t);
  let calls = 0;
  for (let i = 0; i < 2; i++) await executeBuildPlan([task('ordinary')], { root, log() {}, run: async () => { calls++; } });
  assert.equal(calls, 2);
  await assert.rejects(readFile(file), { code: 'ENOENT' });
});

test('success survives a later failure and retry retains its original verification time', async t => {
  const options = await fixture(t);
  let calls = [];
  await assert.rejects(executeBuildPlan([task('first'), task('later')], { ...options, log() {}, run: async args => {
    calls.push(args[1]);
    if (args[1] === 'later.test.mjs') throw Error('later failed');
  } }), /later failed/);
  const saved = JSON.parse(await readFile(options.file, 'utf8'));
  assert.deepEqual(Object.keys(saved.tasks), ['first']);
  calls = [];
  const plan = [task('first'), task('later')];
  await executeBuildPlan(plan, { ...options, log() {}, run: async args => { calls.push(args[1]); } });
  assert.deepEqual(calls, ['later.test.mjs']);
  assert.equal(plan[0].run, false);
  assert.equal(plan[0].verifiedAt, saved.tasks.first.verifiedAt);
});

test('input fingerprints, runtime, TTL and future timestamps prevent reuse', async t => {
  const options = await fixture(t);
  await executeBuildPlan([task('gate')], { ...options, log() {}, run: async () => {} });
  const original = JSON.parse(await readFile(options.file, 'utf8'));
  const cases = [
    { saved: original, next: task('gate', { fingerprint: fingerprint('changed') }) },
    { saved: { ...original, runtime: 'another-node' }, next: task('gate') },
    { saved: { ...original, tasks: { gate: { ...original.tasks.gate, verifiedAt: new Date(Date.now() - MAX_VALIDATION_AGE_MS - 1000).toISOString() } } }, next: task('gate') },
    { saved: { ...original, tasks: { gate: { ...original.tasks.gate, verifiedAt: new Date(Date.now() + 3600000).toISOString() } } }, next: task('gate') },
    { saved: { ...original, version: 99 }, next: task('gate') },
  ];
  for (const candidate of cases) {
    await writeFile(options.file, JSON.stringify(candidate.saved));
    let calls = 0;
    await executeBuildPlan([candidate.next], { ...options, log() {}, run: async () => { calls++; } });
    assert.equal(calls, 1);
  }
});

test('full validation ignores checkpoints', async t => {
  const options = await fixture(t);
  await executeBuildPlan([task('gate')], { ...options, log() {}, run: async () => {} });
  const calls = [];
  await executeBuildPlan([task('gate'), task('a', { commands: [check, check] })], {
    ...options, localCheckpoints: { ...options.localCheckpoints, force: true },
    log() {}, run: async args => { calls.push(args); },
  });
  assert.equal(calls.length, 3);
  let fullPlanCalls = 0;
  await executeBuildPlan([task('gate', { reason: 'full validation requested' })], {
    ...options, log() {}, run: async () => { fullPlanCalls++; },
  });
  assert.equal(fullPlanCalls, 1);
});

test('checkpointing requires an explicit workspace guard and validates before saving or reuse', async t => {
  const options = await fixture(t);
  await assert.rejects(executeBuildPlan([], { ...options, localCheckpoints: { file: options.file, runtime: 'test' } }), /validation callback/);
  await executeBuildPlan([task('gate')], { ...options, log() {}, run: async () => {} });
  const before = await readFile(options.file, 'utf8');
  const guarded = { ...options, localCheckpoints: { ...options.localCheckpoints,
    validateBeforeSave: async () => { throw Error('dirty workspace'); } }, log() {}, run: async () => assert.fail('must validate before cache reuse') };
  await assert.rejects(executeBuildPlan([task('gate')], guarded), /workspace changed/);
  assert.equal(await readFile(options.file, 'utf8'), before);
  await assert.rejects(executeBuildPlan([task('new')], { ...guarded, run: async () => {} }), /workspace changed/);
  assert.equal(await readFile(options.file, 'utf8'), before);
});

test('malformed local cache runs checks and destinations cannot escape local release state', async t => {
  const options = await fixture(t);
  await executeBuildPlan([], { ...options, log() {}, run: async () => {} });
  await writeFile(options.file, 'not JSON');
  let calls = 0;
  await executeBuildPlan([task('gate')], { ...options, log() {}, run: async () => { calls++; } });
  assert.equal(calls, 1);
  await assert.rejects(executeBuildPlan([], { ...options, localCheckpoints: { ...options.localCheckpoints,
    file: path.join(options.root, 'outside.json') } }), /directly inside/);
});

test('output generators, unknown entry points and always tasks never become checkpoints', async t => {
  const options = await fixture(t);
  const makePlan = () => [task('output', { commands: [['build-output.mjs']] }), task('policy', { always: true })];
  let calls = 0;
  for (let i = 0; i < 2; i++) await executeBuildPlan(makePlan(), { ...options, log() {}, run: async () => { calls++; } });
  assert.equal(calls, 4);
  await assert.rejects(readFile(options.file), { code: 'ENOENT' });
  assert.equal(canCheckpointTask(task('bad', { fingerprint: 'not a digest' })), false);
  assert.equal(canCheckpointTask(task('unknown-check', { commands: [['unreviewed.mjs', '--check']] })), false);
});

test('existing validation-only groups are eligible while output-owning groups remain required', () => {
  const tasks = SITE_BUILD_TASKS.map(value => ({ ...value, fingerprint: fingerprint(value.id) }));
  assert.equal(tasks.filter(canCheckpointTask).length, 46);
  assert.equal(canCheckpointTask(tasks.find(value => value.id === 'notice-boards')), false);
  assert.equal(canCheckpointTask(tasks.find(value => value.id === 'regional-catalog')), false);
  assert.equal(canCheckpointTask(tasks.find(value => value.id === 'map-media')), false);
  assert.equal(canCheckpointTask(tasks.find(value => value.id === 'family-charts')), true);
  assert.equal(canCheckpointTask(tasks.find(value => value.id === 'honigtoertchen')), true);
  assert.equal(canCheckpointTask(tasks.find(value => value.id === 'family-records')), true);
  assert.equal(canCheckpointTask(task('pert-check', { commands: [['AleriaAlmanach/scripts/build-pert-characters.mjs', '--check']] })), true);
  assert.equal(canCheckpointTask(task('pert-apply', { commands: [['AleriaAlmanach/scripts/build-pert-characters.mjs', '--apply']] })), false);
});


test('reviewed scoped house and source-export modes are check-only with exact arguments', () => {
  const eligible = args => canCheckpointTask(task('scoped-check', { commands: [args] }));
  for (const script of ['Familien Häuser und Clans/scripts/build-house-content.mjs', 'Gallerien/krieger/scripts/build-catalog.mjs']) {
    assert.equal(eligible([script, '--houses=haus-gwernant', '--check']), true);
    assert.equal(eligible([script, '--houses=pert,haus-gwernant', '--check']), true);
    for (const args of [[], ['--houses=haus-gwernant'], ['--houses=haus-gwernant', '--apply'], ['--houses=', '--check'], ['--houses=../private', '--check'], ['--houses=haus-gwernant', '--check', '--apply']]) assert.equal(eligible([script, ...args]), false);
  }
  const staff = 'AleriaAlmanach/scripts/build-eleganz-sales-characters.mjs';
  assert.equal(eligible([staff, '--source-exports', '--check']), true);
  for (const args of [[], ['--check'], ['--source-exports'], ['--source-exports', '--apply'], ['--source-exports', '--check', '--apply'], ['--artwork', '--check']]) assert.equal(eligible([staff, ...args]), false);
  assert.equal(eligible(['AleriaAlmanach/scripts/build-goettliche-eleganz.mjs', '--check']), true);
  assert.equal(eligible(['AleriaAlmanach/scripts/build-goettliche-eleganz.mjs', '--apply']), false);
  assert.equal(eligible(['unreviewed.mjs', '--houses=haus-gwernant', '--check']), false);
});
