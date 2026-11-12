import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE_BUILD_TASKS } from './site-build-tasks.mjs';
import { readSourceTree, selectBuildTasks } from './site-build-plan.mjs';
import { readPublishedReceipt, readLocalReceipt, writeBuildReceipt } from './site-build-receipt.mjs';
import { preparePublication } from './site-publish.mjs';
import { reportBuildCache } from './site-build-metrics.mjs';
import { openBuildCheckpoints } from './build-checkpoints.mjs';
import { runBuildPreflight } from './build-preflight.mjs';
import { readBuildConcurrency, scheduleBuildValidation } from './build-validation-scheduler.mjs';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));

export async function executeBuildPlan(plan, { root = repositoryRoot, log = console.log,
  run = args => runNode(args, root), localCheckpoints, preflight = false, concurrency = 2,
  onReport = async () => {} } = {}) {
  const checkpoints = await openBuildCheckpoints(root, localCheckpoints);
  const full = localCheckpoints?.force || plan.some(task => task.reason === 'full validation requested');
  const started = performance.now(), commands = [], tasks = [];
  let status = 'failed';
  const measuredRun = async (args, context) => {
    const start = performance.now(); let commandStatus = 'failed';
    try { const result = await run(args, context); commandStatus = 'passed'; return result; }
    finally { commands.push({ ...context, entryPoint: args[0], status: commandStatus, seconds: (performance.now() - start) / 1000 }); }
  };
  try {
    for (const task of plan) {
      const checkpointTime = !full && task.run && await checkpoints?.reuse(task);
      if (checkpointTime) {
        task.run = false;
        task.reason = 'unchanged locally verified inputs';
        task.verifiedAt = checkpointTime;
      }
      log(`[site-build] ${task.run ? 'RUN' : 'REUSE'} ${task.id}: ${task.reason}`);
      if (!task.run) tasks.push({ id: task.id, status: 'reused', verifiedAt: task.verifiedAt });
    }
    if (preflight) await runBuildPreflight(plan, { run: measuredRun, log });
    await scheduleBuildValidation(plan, { concurrency, execute: async task => {
      const start = performance.now();
      let taskStatus = 'failed';
      try {
        for (const args of task.commands) await measuredRun(args, { phase: 'validation', taskId: task.id });
        task.verifiedAt = new Date().toISOString();
        await checkpoints?.save(task);
        taskStatus = 'passed';
        log(`[site-build] DONE ${task.id} in ${((performance.now() - start) / 1000).toFixed(2)}s`);
      } finally {
        if (taskStatus !== 'passed') task.verifiedAt = null;
        tasks.push({ id: task.id, status: taskStatus, seconds: (performance.now() - start) / 1000 });
      }
    } });
    status = 'passed';
  } catch (error) {
    if (checkpoints) {
      try { await checkpoints.validate(); }
      catch (validationError) { throw new AggregateError([error, validationError], 'Build failed and the workspace changed; no new checkpoint was saved.'); }
    }
    throw error;
  } finally {
    await onReport({ version: 1, status, concurrency, preflight, full: Boolean(full),
      recordedAt: new Date().toISOString(), totalSeconds: (performance.now() - started) / 1000, tasks, commands });
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
  const concurrency = readBuildConcurrency(args);
  if (args.includes('--preflight')) {
    if (args.includes('--plan') || args.includes('--full')) throw Error('Use --preflight separately from --plan or --full.');
    return runBuildPreflight(SITE_BUILD_TASKS.map(task => ({ ...task, run: true })), {
      run: command => runNode(command, root),
    });
  }
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
  await executeBuildPlan(plan, { root, preflight: true, concurrency });
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
