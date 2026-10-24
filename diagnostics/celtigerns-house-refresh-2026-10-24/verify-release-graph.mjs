// One-time release evidence. Normal tests verify the general preservation contract.
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
const before = JSON.parse(readFileSync(new URL('previous-defaults.json', import.meta.url), 'utf8'));
const results = Object.entries(before).map(([id, baseline]) => {
  const family = FAMILY_REGISTRY.find(record => record.id === id).family;
  const graph = Object.fromEntries(['persons','partnerships','parentages','houses','timeJumps','cadetBranches'].map(key => [key, family[key]]));
  const current = createHash('sha256').update(JSON.stringify(graph)).digest('hex');
  return { id, before: baseline.graphFingerprint, after: current, unchanged: current === baseline.graphFingerprint };
});
writeFileSync(new URL('graph-preservation.json', import.meta.url), JSON.stringify({ checked: results.length, unchanged: results.every(r => r.unchanged), families: results }, null, 2) + '\n');
if (!results.every(result => result.unchanged)) throw Error('Ein Familiengraph hat sich verändert.');
console.log(`${results.length} Familiengraphen bytegleich zum vorherigen Stand.`);
