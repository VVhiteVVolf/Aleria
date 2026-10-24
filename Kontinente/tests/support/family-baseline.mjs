import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import review from './albic-family-review-20261024.json' with { type: 'json' };
import { protectedAlbicFamilies, reviewHash } from './albic-review-baseline.mjs';

// A historical import protects the families that existed at its capture date,
// while later regions may add independent families without rebasing that proof.
export function assertFamilyBaseline(records, baseline, familyIds) {
  const ids = new Set(familyIds);
  const captured = records.filter(record => ids.has(record.id));
  assert.equal(captured.length, ids.size, 'Keine historische Familienakte darf verschwinden.');
  if (baseline.sha256 === review.sourceBaselineHash) {
    // The old complete-record proof is retained. The approved location/banner
    // review separately protects genealogy, ranks, allegiances and portraits.
    // View-only biography defaults remain owned by the biography feature.
    assert.equal(reviewHash(protectedAlbicFamilies(captured)), review.protectedSha256);
    return;
  }
  assert.equal(createHash('sha256').update(JSON.stringify(captured)).digest('hex'), baseline.sha256);
}
