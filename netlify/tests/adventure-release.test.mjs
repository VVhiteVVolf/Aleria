import test from 'node:test';
import assert from 'node:assert/strict';
import { access, mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { ADVENTURE_SYSTEM_TASKS } from '../build/adventure-system-tasks.mjs';
import { SITE_BUILD_TASKS } from '../build/site-build-tasks.mjs';
import { isTaskInput, selectBuildTasks } from '../build/site-build-plan.mjs';
import { runtimeCheckDependencyPlan, prepareRuntimeCheckDependencies } from '../build/prepare-runtime-checks.mjs';
import { checkMechanicsProjection } from '../build/check-mechanics-projection.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const consumers = file => ADVENTURE_SYSTEM_TASKS.filter(task => isTaskInput(task, file)).map(task => task.id);
test('group, story, source biography and item changes invalidate the appropriate release consumers', () => {
  for (const file of ['AleriaAlmanach/modules/landing/group-roster-window.js', 'AleriaAlmanach/modules/story/story-description.js',
    'AleriaAlmanach/modules/group-adventures/source/idwals-schiffsmannschaft-2026-11-01.json',
    'AleriaAlmanach/modules/gawain-duncan/gawain-public-biography.mjs', 'CharakterDatenbank/generated/characters.snapshot.json']) {
    assert.ok(consumers(file).includes('group-community'), file);
  }
  for (const file of ['AleriaAlmanach/modules/item-register/item-register-gameplay-defaults.js',
    'AleriaAlmanach/modules/character-equipment/equipment-preparation-costs.js', 'Markt/WaffenRüstungen/data/shop-data.js',
    'AleriaAlmanach/modules/arkaneum/arkaneum-data.js', 'Anzeigetafeln/assets/data/notice-reward-catalog.json',
    'firebase/functions/src/groups/commit-group-inventory.js', 'firebase/functions/src/mechanics/undo-mechanical-comment.js',
    'firebase/firestore.rules']) assert.ok(consumers(file).includes('item-mechanics'), file);
  assert.deepEqual(consumers('AleriaAlmanach/modules/archive/archive-dashboard.js'), []);
  assert.deepEqual(consumers('AleriaAlmanach/assets/unrelated/portrait.png'), []);
});

test('new gates have real inputs and validation-only generators, with dependency preparation before imported checks', async () => {
  for (const task of ADVENTURE_SYSTEM_TASKS) {
    assert.ok(SITE_BUILD_TASKS.includes(task));
    for (const input of task.inputs) await access(resolve(root, input));
    assert.equal(task.commands[0][0], 'netlify/build/prepare-runtime-checks.mjs');
    for (const command of task.commands.filter(command => /\/build-[^/]+\.mjs$/.test(command[0]))) assert.ok(command.includes('--check'), command.join(' '));
    assert.equal(task.commands.some(command => command.join(' ').includes('sync:mechanics')), false);
    assert.equal(task.commands.some(command => command.join(' ').includes('integration/')), false);
  }
  assert.equal(SITE_BUILD_TASKS.find(task => task.id === 'quest-journal').commands[0][0], 'netlify/build/prepare-runtime-checks.mjs');
});

test('currency source, originals, display derivatives and builder invalidate UI and money consumers without adding a mechanics root',()=>{
  for(const file of ['AleriaAlmanach/modules/currency/currency-art.js','AleriaAlmanach/modules/currency/currency-art.global.js',
    'AleriaAlmanach/assets/currency/aleria-goldtaler-v1.webp','AleriaAlmanach/assets/currency/aleria-silbertaler-v1.png',
    'AleriaAlmanach/assets/gwynthor-troetzli/items/copper-coin-v1.png','AleriaAlmanach/public/assets/inventory/coins/eisenpfennig.png',
    'AleriaAlmanach/scripts/build-currency-art.mjs'])assert.deepEqual(consumers(file),['group-community','item-mechanics'],file);
  const task=ADVENTURE_SYSTEM_TASKS.find(row=>row.id==='group-community');
  assert.ok(task.commands.some(command=>command[0]==='AleriaAlmanach/scripts/build-currency-art.mjs'&&command.includes('--check')));
  assert.ok(task.commands.some(command=>command.includes('AleriaAlmanach/tests/currency-art.test.mjs')));
});

test('a stored valid baseline cannot reuse group or item checks after their added sources change', () => {
  const options = { siteId: 'test', runtime: 'node/test', now: Date.parse('2026-11-01T10:00:00Z') };
  const files = ['AleriaAlmanach/modules/story/story-description.js', 'AleriaAlmanach/modules/item-register/item-register-text.js'];
  const tree = files.map(file => ({ file, object: '100644 blob ' + 'a'.repeat(40) }));
  const plan = selectBuildTasks(ADVENTURE_SYSTEM_TASKS, tree, options);
  const baseline = { version: 1, siteId: 'test', commit: 'a'.repeat(40), tasks: Object.fromEntries(plan.map(task => [task.id,
    { fingerprint: task.fingerprint, verifiedAt: new Date(options.now - 1000).toISOString() }])) };
  assert.deepEqual(selectBuildTasks(ADVENTURE_SYSTEM_TASKS, tree, { ...options, baseline }).filter(task => task.run), []);
  for (const [index, taskId] of ['group-community', 'item-mechanics'].entries()) {
    const changed = tree.map((row, i) => i === index ? { ...row, object: '100644 blob ' + 'b'.repeat(40) } : row);
    assert.ok(selectBuildTasks(ADVENTURE_SYSTEM_TASKS, changed, { ...options, baseline }).find(task => task.id === taskId).run);
  }
});

test('existing chart and guide gates include their new actual biography and item-rule imports', () => {
  for (const taskId of ['family-charts', 'gameplay-guides']) assert.ok(isTaskInput(SITE_BUILD_TASKS.find(task => task.id === taskId),
    'AleriaAlmanach/modules/gawain-duncan/gawain-public-biography.mjs'));
  const guide = SITE_BUILD_TASKS.find(task => task.id === 'gameplay-guides');
  for (const file of ['item-definitions/item-possession-duplication.js', 'item-register/item-register-standard.js',
    'inventory-use/item-charge-recovery.js']) assert.ok(isTaskInput(guide, `AleriaAlmanach/modules/${file}`), file);
});

async function dependencyFixture(t) {
  const directory = await mkdtemp(join(tmpdir(), 'aleria-runtime-dependencies-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const entries = [['AleriaAlmanach', ['esbuild']], ['firebase/functions', ['firebase-admin', 'firebase-functions']]];
  const install = async (packageDirectory, names, version = '1.0.0') => {
    for (const name of names) {
      const moduleDirectory = join(packageDirectory, 'node_modules', name);
      await mkdir(moduleDirectory, { recursive: true });
      await writeFile(join(moduleDirectory, 'package.json'), JSON.stringify({ name, version, main: 'index.js' }));
      await writeFile(join(moduleDirectory, 'index.js'), 'module.exports = {};');
    }
  };
  for (const [relative, names] of entries) {
    const packageDirectory = join(directory, relative);
    await mkdir(packageDirectory, { recursive: true });
    await writeFile(join(packageDirectory, 'package.json'), '{}');
    await writeFile(join(packageDirectory, 'package-lock.json'), JSON.stringify({ lockfileVersion: 3,
      packages: Object.fromEntries(names.map(name => [`node_modules/${name}`, { version: '1.0.0' }])) }));
    await install(packageDirectory, names);
  }
  return { root: directory, install };
}

test('existing lock-matching dependencies are reused without package installation or network access', async t => {
  const fixture = await dependencyFixture(t);
  assert.deepEqual((await runtimeCheckDependencyPlan(fixture.root)).map(entry => entry.missing), [[], []]);
  await prepareRuntimeCheckDependencies({ root: fixture.root, run: () => assert.fail('must reuse installed modules'), log() {} });
});

test('only the missing nested package is prepared, and a failed preparation cannot pass a release check', async t => {
  const fixture = await dependencyFixture(t), backend = join(fixture.root, 'firebase/functions');
  await fixture.install(backend, ['firebase-functions'], '0.9.0');
  await assert.rejects(prepareRuntimeCheckDependencies({ root: fixture.root, check: true, log() {} }), /Missing locked firebase/);
  const calls = [];
  await prepareRuntimeCheckDependencies({ root: fixture.root, run: async directory => {
    calls.push(directory); await fixture.install(directory, ['firebase-functions']);
  }, log() {} });
  assert.deepEqual(calls, [backend]);
  await fixture.install(backend, ['firebase-admin'], '0.9.0');
  await assert.rejects(prepareRuntimeCheckDependencies({ root: fixture.root, run: async () => {}, log() {} }), /remain unavailable/);
  await assert.rejects(runtimeCheckDependencyPlan(fixture.root, 'unknown'), /Unknown/);
});

test('browser/server projection check detects stale mechanical bytes without changing either source', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'aleria-mechanics-projection-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const source = join(directory, 'AleriaAlmanach/modules/combat'), generated = join(directory, 'firebase/functions/src/generated/combat');
  await mkdir(source, { recursive: true }); await mkdir(generated, { recursive: true });
  await writeFile(join(source, 'attack.js'), 'export const damage = 8;');
  await writeFile(join(generated, 'attack.js'), 'export const damage = 8;');
  assert.equal(await checkMechanicsProjection(directory), 1);
  await writeFile(join(source, 'attack.js'), 'export const damage = 12;');
  await assert.rejects(checkMechanicsProjection(directory), /Browser\/server mechanics differ/);
  await writeFile(join(generated, 'extra.js'), 'export const extra = true;');
  await writeFile(join(generated, 'attack.js'), 'export const damage = 12;');
  await assert.rejects(checkMechanicsProjection(directory), /no current browser source/);
});
