import { readFile, writeFile } from 'node:fs/promises';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';
import { protectedAlbicFamilies, reviewHash } from '../../Kontinente/tests/support/albic-review-baseline.mjs';
import ids from '../../Kontinente/tests/support/family-baseline-20261023.json' with { type: 'json' };
const previous = JSON.parse(await readFile(new URL('historical-family-head.json', import.meta.url), 'utf8'));
const records = protectedAlbicFamilies(FAMILY_REGISTRY.filter(record => ids.includes(record.id)));
function diff(before, current, path = '') {
  if (JSON.stringify(before) === JSON.stringify(current)) return [];
  if (before && current && typeof before === 'object' && typeof current === 'object') {
    return [...new Set([...Object.keys(before), ...Object.keys(current)])].flatMap(key => diff(before[key], current[key], path ? `${path}.${key}` : key));
  }
  return [{ path, before: before ?? null, current: current ?? null }];
}
const changed = records.flatMap(record => {
  const before = previous.records.find(row => row.id === record.id);
  const changes = diff(before, record);
  return changes.length ? [{ id: record.id, changes }] : [];
});
const report = { previousHash: previous.hash, currentHash: reviewHash(records), count: records.length, changed };
await writeFile(new URL('historical-family-current-diff.json', import.meta.url), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ ...report, changed: changed.map(row => ({ id: row.id, changes: row.changes.map(change => ({ ...change,
  before: typeof change.before === 'string' ? change.before.slice(0, 180) : change.before,
  current: typeof change.current === 'string' ? change.current.slice(0, 180) : change.current })) })) }, null, 2));
