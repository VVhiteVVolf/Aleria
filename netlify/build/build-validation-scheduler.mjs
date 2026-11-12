import { isReadOnlyValidationCommand } from './validation-commands.mjs';

export function readBuildConcurrency(args = []) {
  const values = args.filter(arg => arg.startsWith('--jobs='));
  if (values.length > 1 || (values.length && !/^--jobs=[1-4]$/.test(values[0]))) {
    throw Error('Use --jobs=1, --jobs=2, --jobs=3 or --jobs=4 once.');
  }
  return values.length ? Number(values[0].slice(7)) : 2;
}

export function canRunValidationInParallel(task) {
  return task.parallelValidation === true && !task.always
    && task.commands.length > 0 && task.commands.every(isReadOnlyValidationCommand);
}

// Only contiguous, explicitly reviewed validation groups share a batch. Unknown
// commands, generators and dependency installers are serial barriers. On error,
// stop taking new work and drain every started task before releasing the caller.
export async function scheduleBuildValidation(plan, { execute, concurrency = 2 } = {}) {
  if (!Number.isInteger(concurrency) || concurrency < 1 || concurrency > 4) throw Error('Build concurrency must be an integer from 1 to 4.');
  let batch = [];
  async function flush() {
    const tasks = batch; batch = [];
    const errors = []; let next = 0;
    await Promise.all(Array.from({ length: Math.min(concurrency, tasks.length) }, async () => {
      while (!errors.length && next < tasks.length) {
        const task = tasks[next++];
        try { await execute(task); } catch (error) { errors.push(error); }
      }
    }));
    if (errors.length === 1) throw errors[0];
    if (errors.length) throw new AggregateError(errors, 'Parallel validation failed; all started checks have finished.');
  }
  for (const task of plan) {
    if (!task.run) continue;
    if (canRunValidationInParallel(task)) batch.push(task);
    else { await flush(); await execute(task); }
  }
  await flush();
}
