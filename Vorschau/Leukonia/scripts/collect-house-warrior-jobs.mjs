/** Join independent art-wave briefs into one compact authoring input for the catalog. */
import { readFile, writeFile } from 'node:fs/promises';
const root = new URL('../sources/', import.meta.url);
const manifests = ['house-warriors-original-jobs.json','house-warriors-pool-01-17-jobs.json','house-warriors-pool-18-32-jobs.json'];
const jobs = [];
for (const file of manifests) {
  try { jobs.push(...JSON.parse(await readFile(new URL(file, root),'utf8')).jobs); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}
const ids = new Set();
for (const job of jobs) {
  if (ids.has(job.houseId)) throw new Error('Duplicate house figure: '+job.houseId);
  ids.add(job.houseId);
}
try {
  const revisions = JSON.parse(await readFile(new URL('house-warrior-revisions.json',root),'utf8'));
  for (const revision of revisions.jobs) {
    const index = jobs.findIndex(job => job.houseId === revision.houseId);
    if (index === -1 || jobs[index].assetStem !== revision.supersedesAssetStem) throw new Error('Unmatched explicit figure revision: '+revision.houseId);
    jobs[index] = revision;
  }
} catch (error) { if (error.code !== 'ENOENT') throw error; }
await writeFile(new URL('house-warrior-generation-jobs.json',root), JSON.stringify({schemaVersion:1,sourceManifests:manifests,jobs},null,2)+'\n','utf8');
console.log(JSON.stringify({houseFigureBriefs:jobs.length}));
