import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { SHARED_BUILD_INPUTS } from './site-build-tasks.mjs';

export const BUILD_RECEIPT_VERSION = 1;
export const MAX_VALIDATION_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const matches = (file, input) => input.endsWith('/') ? file.startsWith(input) : file === input;

export function isTaskInput(task, file) {
  return [...SHARED_BUILD_INPUTS, ...task.inputs].some(input => matches(file, input))
    && !(task.excludes || []).some(input => matches(file, input));
}

export function isPublishedReceipt(baseline, siteId) {
  return Boolean(baseline?.version === BUILD_RECEIPT_VERSION && baseline.siteId === siteId
    && /^[a-f0-9]{40,64}$/.test(baseline.commit || '')
    && baseline.tasks && typeof baseline.tasks === 'object' && !Array.isArray(baseline.tasks));
}

export function readSourceTree(root) {
  return execFileSync('git', ['ls-tree', '-r', '-z', 'HEAD'], {
    cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024
  }).split('\0').filter(Boolean).map(record => {
    const separator = record.indexOf('\t');
    if (separator < 0) throw Error('Invalid Git source tree.');
    return { file: record.slice(separator + 1), object: record.slice(0, separator) };
  });
}

export function taskFingerprint(task, tree, runtime) {
  const selected = tree.filter(({ file }) => isTaskInput(task, file))
    .sort((a, b) => a.file.localeCompare(b.file, 'en'));
  const hash = createHash('sha256').update(JSON.stringify({
    version: BUILD_RECEIPT_VERSION, id: task.id, commands: task.commands, runtime
  }));
  for (const { file, object } of selected) hash.update('\0' + file + '\0' + object);
  return hash.digest('hex');
}

export function selectBuildTasks(tasks, tree, { baseline, siteId, runtime, force = false, now = Date.now() }) {
  const usable = isPublishedReceipt(baseline, siteId);
  return tasks.map(task => {
    const fingerprint = taskFingerprint(task, tree, runtime);
    const previous = usable ? baseline.tasks?.[task.id] : null;
    const age = now - Date.parse(previous?.verifiedAt || '');
    const reusable = previous?.fingerprint === fingerprint && age >= 0 && age < MAX_VALIDATION_AGE_MS;
    const reason = task.always ? 'required deployment output or build policy'
      : force ? 'full validation requested'
      : !usable ? 'no valid published baseline'
      : previous?.fingerprint !== fingerprint ? 'inputs changed'
      : !reusable ? 'validation expired or invalid' : 'unchanged verified inputs';
    return { ...task, fingerprint, run: Boolean(task.always || force || !reusable), reason,
      verifiedAt: reusable && !force && !task.always ? previous.verifiedAt : null };
  });
}
