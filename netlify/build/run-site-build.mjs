import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE_BUILD_TASKS } from './site-build-tasks.mjs';
import { readSourceTree, selectBuildTasks } from './site-build-plan.mjs';
import { readPublishedReceipt, readLocalReceipt, writeBuildReceipt } from './site-build-receipt.mjs';
import { preparePublication } from './site-publish.mjs';
import { reportBuildCache } from './site-build-metrics.mjs';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));

export async function executeBuildPlan(plan, { root = repositoryRoot, log = console.log,
  run = args => runNode(args, root) } = {}) {
  for (const task of plan) {
    log(`[site-build] ${task.run ? 'RUN' : 'REUSE'} ${task.id}: ${task.reason}`);
    if (!task.run) continue;
    const start = performance.now();
    for (const args of task.commands) await run(args);
    task.verifiedAt = new Date().toISOString();
    log(`[site-build] DONE ${task.id} in ${((performance.now() - start) / 1000).toFixed(2)}s`);
  }
}

function runNode(args, root) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd: root, stdio: 'inherit', shell: false });
    child.once('error', reject);
    child.once('exit', (code, signal) => code === 0 ? resolve()
      : reject(Error(`Build step failed: ${args[0]} (${signal || code})`)));
  });
}

export async function runSiteBuild({ environment = process.env, args = process.argv.slice(2), root = repositoryRoot } = {}) {
  const baselineFile = args.find(arg => arg.startsWith('--baseline='))?.slice('--baseline='.length);
  const baseline = baselineFile ? await readLocalReceipt(baselineFile) : await readPublishedReceipt(environment);
  if (!baseline && !args.includes('--plan')) await reportBuildCache(environment);
  const tree = readSourceTree(root);
  const runtime = `${process.version}/${process.platform}/${process.arch}`;
  // Local builds include uncommitted work, so reuse is opt-in only for dry runs.
  const force = args.includes('--full') || environment.ALERIA_BUILD_FULL === 'true'
    || (environment.NETLIFY !== 'true' && !args.includes('--plan'));
  const plan = selectBuildTasks(SITE_BUILD_TASKS, tree, {
    baseline, siteId: environment.SITE_ID || 'local', runtime, force
  });
  if (args.includes('--plan')) {
    console.log(JSON.stringify(plan.map(({ id, run, reason, fingerprint }) => ({ id, run, reason, fingerprint })), null, 2));
    return plan;
  }
  await executeBuildPlan(plan, { root });
  if (environment.NETLIFY === 'true') {
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    await writeBuildReceipt(root, { siteId: environment.SITE_ID, commit, plan });
    await preparePublication(root, tree);
  }
  return plan;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runSiteBuild().catch(error => { console.error('[site-build] ' + error.message); process.exitCode = 1; });
}
