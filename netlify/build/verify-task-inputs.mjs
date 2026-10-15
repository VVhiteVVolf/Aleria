import { registerHooks } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SITE_BUILD_TASKS } from './site-build-tasks.mjs';
import { isTaskInput } from './site-build-plan.mjs';

const root = fileURLToPath(new URL('../../', import.meta.url));
const task = SITE_BUILD_TASKS.find(task => task.id === process.argv[2]);
if (!task) throw Error('Unknown dependency audit.');
const sources = new Set();
const hook = registerHooks({ resolve(specifier, context, nextResolve) {
  const result = nextResolve(specifier, context);
  if (result.url.startsWith('file:')) {
    const relative = path.relative(root, fileURLToPath(result.url));
    if (!relative.startsWith('..') && !path.isAbsolute(relative)) sources.add(relative.split(path.sep).join('/'));
  }
  return result;
} });
try {
  if (task.id === 'gameplay-guides') {
    const { GUIDE_REGISTRY } = await import('../../Gameplay%20Guide/modules/guide-registry.mjs');
    await import('../../Gameplay%20Guide/modules/guide-model.mjs');
    await import('../../Gameplay%20Guide/modules/guide-template.mjs');
    for (const guide of GUIDE_REGISTRY) await import('../../Gameplay%20Guide/modules/' + guide.editorialModule);
  } else if (task.id === 'family-charts') {
    await import('../../Stammbäume/tests/chart-quality-fixture.js');
  } else throw Error('Dependency audit entry point missing.');
} finally { hook.deregister(); }
const uncovered = [...sources].filter(file => !isTaskInput(task, file));
if (uncovered.length) throw Error(`Add dependencies to ${task.id} build inputs:\n${uncovered.join('\n')}`);
console.log(`[site-build] Dependency coverage ${task.id}: ${sources.size} source modules covered.`);
