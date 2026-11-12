import { isCatalogValidationCommand } from './validation-commands.mjs';

// These checks read authored sources and committed projections only. They do not
// need installations or the three catalogs generated during a normal build.
const EARLY_CHECKS = new Set([
  'AleriaAlmanach/scripts/build-quest-catalog.mjs',
  'Karten/tools/build-households.mjs',
  'AleriaAlmanach/scripts/build-economy-calculator.mjs',
  'AleriaAlmanach/scripts/build-economy-price-review.mjs',
]);

export function collectPreflightChecks(plan) {
  const checks = new Map();
  for (const task of plan.filter(task => task.run)) for (const args of task.commands) {
    if (!EARLY_CHECKS.has(args[0]) || !isCatalogValidationCommand(args)) continue;
    const key = JSON.stringify(args);
    if (!checks.has(key)) checks.set(key, { args, taskIds: [] });
    checks.get(key).taskIds.push(task.id);
  }
  return [...checks.values()];
}

export async function runBuildPreflight(plan, { run, log = console.log } = {}) {
  const checks = collectPreflightChecks(plan), errors = [], failed = [];
  for (const check of checks) {
    log(`[site-build] PREFLIGHT ${check.args.join(' ')}`);
    try { await run(check.args, { phase: 'preflight', taskIds: check.taskIds }); }
    catch (error) {
      errors.push(error);
      failed.push(check.args.join(' '));
      log(`[site-build] PREFLIGHT FAILED ${check.args.join(' ')}`);
    }
  }
  if (errors.length) throw new AggregateError(errors,
    `Generated catalog preflight failed (${errors.length}/${checks.length}); review these checks before running the full build:\n${failed.join('\n')}`);
  return { checks: checks.length };
}
