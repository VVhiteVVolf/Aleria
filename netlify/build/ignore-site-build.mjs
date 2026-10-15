import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { SITE_BUILD_TASKS } from './site-build-tasks.mjs';
import { isPublishedReceipt, isTaskInput } from './site-build-plan.mjs';
import { readPublishedReceipt } from './site-build-receipt.mjs';
import { shouldPublish } from './site-publish.mjs';

export function changesRequireBuild(files) {
  return files.some(file => shouldPublish(file) || SITE_BUILD_TASKS.some(task => isTaskInput(task, file)));
}

export async function shouldIgnoreBuild({ environment = process.env,
  root = fileURLToPath(new URL('../../', import.meta.url)), log = console.log } = {}) {
  if (environment.ALERIA_BUILD_FULL === 'true') return false;
  const baseline = await readPublishedReceipt(environment, { log });
  if (!isPublishedReceipt(baseline, environment.SITE_ID)) return false;
  try {
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim();
    // A retry of the already published commit must still run (e.g. cache audit).
    if (commit === baseline.commit) return false;
    execFileSync('git', ['merge-base', '--is-ancestor', baseline.commit, commit], { cwd: root, stdio: 'ignore' });
    const files = execFileSync('git', ['diff', '--name-only', '--no-renames', '-z', baseline.commit, commit, '--'], {
      cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024
    }).split('\0').filter(Boolean);
    const ignore = files.length > 0 && !changesRequireBuild(files);
    log(`[site-build] ${ignore ? 'Skip' : 'Continue'} deployment: ${files.length} changes since last publication.`);
    return ignore;
  } catch {
    log('[site-build] Publication ancestry unavailable; continuing build.');
    return false;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  shouldIgnoreBuild().then(ignore => { process.exitCode = ignore ? 0 : 1; })
    .catch(() => { process.exitCode = 1; });
}
