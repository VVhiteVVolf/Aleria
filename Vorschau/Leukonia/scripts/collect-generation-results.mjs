/** Merge root-owned per-job receipts without touching prototype worker manifests. */
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('../sources/', import.meta.url);
const manifest = new URL('art-generation-results.json', root);
const current = JSON.parse(await readFile(manifest, 'utf8'));
const merged = new Map(current.records.map(record => [record.id, record]));
for (const file of await readdir(new URL('generation-results/', root))) {
  if (!file.endsWith('.json')) continue;
  const record = JSON.parse(await readFile(new URL('generation-results/'+file, root), 'utf8'));
  if (record.id+'.json' !== file) throw new Error('Receipt filename does not match asset identity: '+file);
  if (merged.has(record.id) && merged.get(record.id).generatedFile !== record.generatedFile) throw new Error('Unarchived replacement: '+record.id);
  merged.set(record.id, record);
}
current.records = [...merged.values()].sort((a,b) => a.id.localeCompare(b.id));
await writeFile(manifest, JSON.stringify(current,null,2)+'\n','utf8');
console.log(JSON.stringify({manifest:fileURLToPath(manifest),records:current.records.length}));
