import { git } from './git-state.mjs';
import { shouldPublish } from '../build/site-publish.mjs';

export function publicationInventory(root, tree) {
  const ids = [...new Set(tree.map(entry => entry.object.split(' ')[2]))];
  const sizes = new Map(git(root, ['cat-file', '--batch-check=%(objectname) %(objectsize)'],
    { input: ids.join('\n') + '\n' }).trim().split('\n').map(row => {
    const [id, bytes] = row.trim().split(' '); return [id, Number(bytes)];
  }));
  const result = { publishedFiles: 0, publishedBytes: 0, excludedSourceFiles: 0, excludedSourceBytes: 0 };
  for (const entry of tree) {
    const size = sizes.get(entry.object.split(' ')[2]);
    if (!Number.isFinite(size)) throw Error(`Missing source size: ${entry.file}`);
    const prefix = shouldPublish(entry.file) ? 'published' : 'excludedSource';
    result[prefix + 'Files']++; result[prefix + 'Bytes'] += size;
  }
  return result;
}
