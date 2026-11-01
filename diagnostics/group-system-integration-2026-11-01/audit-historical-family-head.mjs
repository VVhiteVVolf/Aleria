// Read-only comparison input: import committed modules with their committed
// dependencies in this process only. No checkout, worktree or source writes.
import { registerHooks } from 'node:module';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { resolve, relative, sep } from 'node:path';
import { writeFile } from 'node:fs/promises';
const root = fileURLToPath(new URL('../../', import.meta.url));
const changed = new Set(execFileSync('git', ['diff', '--name-only', '-z', 'HEAD'], { cwd: root, encoding: 'utf8' }).split('\0'));
registerHooks({ load(url, context, nextLoad) {
  if (url.startsWith('file:')) {
    const path = relative(root, fileURLToPath(url)).split(sep).join('/');
    if (changed.has(path) && /\.(?:m?js|json)$/.test(path)) {
      return { format: path.endsWith('.json') ? 'json' : 'module',
        source: execFileSync('git', ['show', `HEAD:${path}`], { cwd: root }), shortCircuit: true };
    }
  }
  return nextLoad(url, context);
} });
const { FAMILY_REGISTRY } = await import(pathToFileURL(resolve(root, 'Stammbäume/assets/js/data/families.registry.js')));
const { protectedAlbicFamilies, reviewHash } = await import(pathToFileURL(resolve(root, 'Kontinente/tests/support/albic-review-baseline.mjs')));
const ids = (await import(pathToFileURL(resolve(root, 'Kontinente/tests/support/family-baseline-20261023.json')), { with: { type: 'json' } })).default;
const records = protectedAlbicFamilies(FAMILY_REGISTRY.filter(record => ids.includes(record.id)));
await writeFile(new URL('historical-family-head.json', import.meta.url), JSON.stringify({ hash: reviewHash(records), records }, null, 2) + '\n');
console.log(JSON.stringify({ count: records.length, hash: reviewHash(records) }));
