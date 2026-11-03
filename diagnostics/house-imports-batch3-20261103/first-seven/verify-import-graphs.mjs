import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { FAMILY_REGISTRY } from '../../../Stammbäume/assets/js/data/families.registry.js';

const root = new URL('../../../', import.meta.url);
const fixture = JSON.parse(readFileSync(new URL('Familien Häuser und Clans/tests/fixtures/graue-weite-house-pages-initial-review.json', root), 'utf8'));
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const graphKeys = ['persons', 'partnerships', 'parentages', 'houses', 'timeJumps', 'cadetBranches'];
const profilesEqual = (current, before) => JSON.stringify(Object.fromEntries(
  Object.keys(before).map(key => [key, current.houseProfile[key] || '']),
)) === JSON.stringify(before);
const records = fixture.records.map(before => {
  const current = FAMILY_REGISTRY.find(record => record.id === before.id);
  return {
    id: before.id,
    graphUnchanged: hash(Object.fromEntries(graphKeys.map(key => [key, current.family[key]]))) === before.initialGraphFingerprint,
    canonicalProfileUnchanged: profilesEqual(current, before.initialCanonicalProfile),
  };
});
const protectedOrigins = fixture.protectedOrigins.map(before => {
  const current = FAMILY_REGISTRY.find(record => record.id === before.id);
  return {
    id: before.id,
    completeFamilyUnchanged: hash(current.family) === before.initialFamilyFingerprint,
    canonicalProfileUnchanged: profilesEqual(current, before.initialCanonicalProfile),
  };
});
const audit = {
  reviewedAt: new Date().toISOString(),
  purpose: 'One-time import audit: fifteen southern graphs and four complete northern origin records. Ongoing tests allow later authorized editing.',
  records, protectedOrigins,
};
writeFileSync(new URL('graph-preservation-one-time.json', import.meta.url), JSON.stringify(audit, null, 2) + '\n');
console.log(JSON.stringify(audit));
if (records.some(record => !record.graphUnchanged || !record.canonicalProfileUnchanged)
  || protectedOrigins.some(record => !record.completeFamilyUnchanged || !record.canonicalProfileUnchanged)) process.exitCode = 1;
