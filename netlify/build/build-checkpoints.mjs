import { mkdir, lstat, realpath, readFile, writeFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { MAX_VALIDATION_AGE_MS } from './site-build-plan.mjs';
import { isCheckpointCommand } from './validation-commands.mjs';

const VERSION = 1;
const MAX_BYTES = 1024 * 1024;
const DIGEST = /^[a-f0-9]{64}$/;

// Task checkpoints use the same validation-only command contract as published
// task receipts. Preparations may install tools, but create no website output;
// they are not skipped independently within a running task. Unknown commands and
// output generators conservatively prevent checkpointing the entire task.
export function canCheckpointTask(task) {
  if (task.always || !DIGEST.test(task.fingerprint || '')) return false;
  return task.commands.every(isCheckpointCommand);
}

export async function openBuildCheckpoints(root, options) {
  if (!options) return null;
  const { file, runtime, force = false, validateBeforeSave, now = Date.now } = options;
  if (typeof runtime !== 'string' || !runtime || typeof validateBeforeSave !== 'function') {
    throw Error('Local checkpoints require runtime and a workspace validation callback.');
  }
  const resolvedRoot = await realpath(root);
  const directory = path.join(resolvedRoot, '.release-state');
  const target = path.resolve(file);
  if (path.dirname(target) !== directory || !target.endsWith('.json')) {
    throw Error('Local checkpoints must be a JSON file directly inside .release-state.');
  }
  await mkdir(directory, { recursive: true });
  if (await realpath(directory) !== directory) throw Error('Local checkpoint directory is redirected.');
  const existing = await lstat(target).catch(error => { if (error.code !== 'ENOENT') throw error; });
  if (existing && (!existing.isFile() || existing.isSymbolicLink())) throw Error('Local checkpoint file is redirected.');
  let records = new Map();
  if (!force && existing?.size <= MAX_BYTES) {
    try {
      const saved = JSON.parse(await readFile(target, 'utf8'));
      if (saved.version === VERSION && saved.runtime === runtime && saved.tasks
        && typeof saved.tasks === 'object' && !Array.isArray(saved.tasks)) {
        records = new Map(Object.entries(saved.tasks));
      }
    } catch { /* A missing/malformed checkpoint never authorizes reuse. */ }
  }
  const usable = record => {
    const age = now() - Date.parse(record?.verifiedAt || '');
    return DIGEST.test(record?.fingerprint || '') && age >= 0 && age < MAX_VALIDATION_AGE_MS;
  };
  let pendingSave = Promise.resolve();
  return {
    validate: validateBeforeSave,
    async reuse(task) {
      if (force || !canCheckpointTask(task)) return null;
      const record = records.get(task.id);
      if (!usable(record) || record.fingerprint !== task.fingerprint) return null;
      await validateBeforeSave();
      return record.verifiedAt;
    },
    save(task) {
      if (!canCheckpointTask(task)) return;
      const save = pendingSave.then(async () => {
        await validateBeforeSave();
        const next = new Map([...records].filter(([, record]) => usable(record)));
        next.set(task.id, { fingerprint: task.fingerprint, verifiedAt: task.verifiedAt });
        const temporary = path.join(directory, `.task-checkpoints-${randomUUID()}.tmp`);
        try {
          await writeFile(temporary, JSON.stringify({ version: VERSION, runtime, tasks: Object.fromEntries(next) }, null, 2) + '\n', { flag: 'wx' });
          await rename(temporary, target);
          records = next;
        } finally {
          await unlink(temporary).catch(error => { if (error.code !== 'ENOENT') throw error; });
        }
      });
      pendingSave = save.catch(() => {});
      return save;
    },
  };
}
