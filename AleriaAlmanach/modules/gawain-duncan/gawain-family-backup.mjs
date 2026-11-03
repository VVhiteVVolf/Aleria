import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

// Keep distinct historical contents immutable even when an older writer reused
// a family revision and timestamp. The complete digest names the exact bytes.
export function gawainFamilyBackupPath(envelope, content) {
  assert.equal(envelope.familyId, 'haus-draig');
  assert(Number.isSafeInteger(envelope.revision) && envelope.revision >= 0);
  assert(Number.isFinite(Date.parse(envelope.updatedAt)));
  assert.equal(typeof content, 'string');
  const digest = createHash('sha256').update(content).digest('hex');
  return `backups/haus-draig/r${String(envelope.revision).padStart(8, '0')}-${envelope.updatedAt.replace(/[^0-9A-Z]/gi, '')}-${digest}.json`;
}
