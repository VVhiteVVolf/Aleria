import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// A historical import protects the families that existed at its capture date,
// while later regions may add independent families without rebasing that proof.
export function assertFamilyBaseline(records, baseline, familyIds) {
  const ids = new Set(familyIds);
  const captured = records.filter(record => ids.has(record.id));
  assert.equal(captured.length, ids.size, 'Keine historische Familienakte darf verschwinden.');
  assert.equal(createHash('sha256').update(JSON.stringify(captured)).digest('hex'), baseline.sha256);
}
