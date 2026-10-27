import { mkdir, readFile, writeFile, stat, open, unlink } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readSourceTree, selectBuildTasks } from '../build/site-build-plan.mjs';
import { SITE_BUILD_TASKS } from '../build/site-build-tasks.mjs';
import { executeBuildPlan } from '../build/run-site-build.mjs';
import { readPublishedReceipt, writeBuildReceipt, BUILD_RECEIPT_PATH } from '../build/site-build-receipt.mjs';
import { RELEASE_SITE, RELEASE_STATE_DIRECTORY, GENERATED_OUTPUTS } from './config.mjs';
import { git, assertReleaseWorkspace, releaseCommit, assertLocalReleaseMessage } from './git-state.mjs';
import { snapshotPublication, ownedStage } from './snapshot.mjs';
import { verifyRelease } from './netlify-client.mjs';
import { publicationInventory } from './publication-inventory.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const stateDirectory = path.join(root, RELEASE_STATE_DIRECTORY);
const args = new Set(process.argv.slice(2));
const modes = ['--plan', '--prepare', '--publish', '--cleanup-stage'];
if (modes.filter(mode => args.has(mode)).length !== 1 || [...args].some(arg => ![...modes, '--push', '--full'].includes(arg))) {
  throw Error('Use one of --plan, --prepare, --publish [--push], --cleanup-stage; optionally --full.');
}

async function run(command, commandArgs, cwd = root) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, { cwd, shell: false, stdio: ['ignore', 'pipe', 'inherit'],
      env: { ...process.env, NETLIFY_TELEMETRY_DISABLED: '1', NO_UPDATE_NOTIFIER: '1' } });
    let output = '';
    child.stdout.on('data', bytes => { output += bytes; if (output.length > 1024 * 1024) child.kill(); });
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve(output) : reject(Error(`Release command failed (${code}).`)));
  });
}

async function prepare() {
  const commit = assertReleaseWorkspace(root);
  const tree = readSourceTree(root);
  const baseline = await readPublishedReceipt({ NETLIFY: 'true', SITE_ID: RELEASE_SITE.id, URL: RELEASE_SITE.origin });
  const plan = selectBuildTasks(SITE_BUILD_TASKS, tree, { baseline, siteId: RELEASE_SITE.id,
    runtime: `${process.version}/${process.platform}/${process.arch}`, force: args.has('--full') });
  await executeBuildPlan(plan, { root });
  assertReleaseWorkspace(root, { generated: GENERATED_OUTPUTS, expectedCommit: commit });
  await writeBuildReceipt(root, { siteId: RELEASE_SITE.id, commit, plan });
  const snapshot = await snapshotPublication(root, tree, { overlays: [...GENERATED_OUTPUTS, BUILD_RECEIPT_PATH] });
  if (releaseCommit(root) !== commit) throw Error('HEAD changed. Snapshot retained for diagnosis; prepare again.');
  const prepared = { commit, preparedAt: new Date().toISOString(), ...snapshot };
  await writeFile(path.join(stateDirectory, 'prepared.json'), JSON.stringify(prepared, null, 2) + '\n');
  console.log(JSON.stringify({ commit, files: snapshot.files.length,
    bytes: snapshot.files.reduce((sum, item) => sum + item.bytes, 0), checksRun: plan.filter(task => task.run).length }));
  return prepared;
}

async function publish() {
  assertReleaseWorkspace(root);
  if (git(root, ['branch', '--show-current']).trim() !== RELEASE_SITE.branch) throw Error('Release requires the master branch.');
  if (args.has('--push')) assertLocalReleaseMessage(git(root, ['log', '-1', '--format=%B']));
  const prepared = await prepare();
  git(root, ['fetch', RELEASE_SITE.remote, RELEASE_SITE.branch]);
  if (args.has('--push')) git(root, ['push', RELEASE_SITE.remote, `${prepared.commit}:refs/heads/${RELEASE_SITE.branch}`], { stdio: 'inherit' });
  if (args.has('--push')) git(root, ['fetch', RELEASE_SITE.remote, RELEASE_SITE.branch]);
  const remote = git(root, ['rev-parse', `${RELEASE_SITE.remote}/${RELEASE_SITE.branch}`]).trim();
  if (remote !== prepared.commit) throw Error('Push the prepared commit before deployment (use --publish --push).');
  assertReleaseWorkspace(root, { generated: GENERATED_OUTPUTS, expectedCommit: prepared.commit });
  const cli = process.env.ALERIA_NETLIFY_CLI || path.join(root, 'netlify/.cli/node_modules/netlify-cli/bin/run.js');
  await stat(cli).catch(() => { throw Error('Netlify CLI missing. See netlify/docs/LOCAL_RELEASES.md.'); });
  const output = await run(process.execPath, [cli, 'deploy', '--prod', '--no-build', '--dir', prepared.directory,
    '--functions', path.join(prepared.support, 'netlify/functions'), '--skip-functions-cache', '--site', RELEASE_SITE.id,
    '--message', `Verified local release ${prepared.commit.slice(0, 9)}`, '--json'], prepared.support);
  const deploy = JSON.parse(output);
  const result = await verifyRelease(root, prepared, deploy.deploy_id);
  await writeFile(path.join(stateDirectory, 'last-release.json'), JSON.stringify(result, null, 2) + '\n');
  await ownedStage(root, { remove: true });
  await ownedStage(root, { remove: true, support: true });
  console.log(JSON.stringify(result, null, 2));
}

async function main() {
  if (args.has('--plan')) {
    const tree = readSourceTree(root);
    console.log(JSON.stringify({ commit: releaseCommit(root), ...publicationInventory(root, tree),
      commands: modes, snapshot: 'Immutable committed blobs; generated catalogs overlaid after validation.' }, null, 2));
    return;
  }
  await mkdir(stateDirectory, { recursive: true });
  const lockPath = path.join(stateDirectory, 'release.lock');
  const lock = await open(lockPath, 'wx').catch(() => { throw Error('A release lock exists. Check the other process before removing it.'); });
  try {
    await lock.writeFile(JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() }));
    if (args.has('--cleanup-stage')) {
      await ownedStage(root, { remove: true });
      await ownedStage(root, { remove: true, support: true });
    }
    else if (args.has('--prepare')) await prepare();
    else await publish();
  } finally { await lock.close(); await unlink(lockPath); }
}

main().catch(error => { console.error('[release] ' + error.message); process.exitCode = 1; });
