import { readdir, readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repositoryRoot = fileURLToPath(new URL('../../', import.meta.url));

// Validate the already generated graph without invoking the central generator.
export async function checkMechanicsProjection(root = repositoryRoot) {
  const generated = resolve(root, 'firebase/functions/src/generated');
  const files = (await readdir(generated, { recursive: true })).filter(file => /\.(?:m?js|json)$/.test(file));
  if (!files.length) throw Error('The generated mechanical graph is missing.');
  for (const file of files) {
    const original = resolve(root, 'AleriaAlmanach/modules', file);
    const current = await readFile(resolve(generated, file));
    let source;
    try { source = await readFile(original); } catch { throw Error(`Generated mechanics have no current browser source: ${file}`); }
    if (!source.equals(current)) throw Error(`Browser/server mechanics differ; run the coordinated mechanics sync: ${file}`);
  }
  return files.length;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(`[site-build] Browser/server projection: ${await checkMechanicsProjection()} identical source modules.`);
}
