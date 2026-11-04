import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../', import.meta.url);
const fixture = JSON.parse(readFileSync(new URL('Familien Häuser und Clans/tests/fixtures/weidebucht-house-pages-initial-review.json', root), 'utf8'));
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const records = fixture.records.map(before => {
  const current = FAMILY_REGISTRY.find(record => record.id === before.id);
  const graph = Object.fromEntries(graphKeys.map(key => [key, current.family[key]]));
  const hash = createHash('sha256').update(JSON.stringify(graph)).digest('hex');
  const profile = Object.fromEntries(Object.keys(before.initialCanonicalProfile).map(key => [key, current.houseProfile[key] || '']));
  return {
    id: before.id,
    graphUnchanged: hash === before.initialGraphFingerprint,
    canonicalProfileUnchanged: JSON.stringify(profile) === JSON.stringify(before.initialCanonicalProfile),
  };
});
const audit = {
  reviewedAt: new Date().toISOString(),
  purpose: 'One-time before/after house-page import audit. Ongoing tests intentionally allow later legitimate genealogy changes.',
  records,
};
writeFileSync(new URL('graph-preservation-one-time.json', import.meta.url), JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify(audit));
if (records.some(record => !record.graphUnchanged || !record.canonicalProfileUnchanged)) process.exitCode = 1;
