import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import successor from './gwniwr-maerllys-registry-upgrade-source-review-20261108.json' with { type: 'json' };
import {reviewedParentageSourceHash} from './reviewed-parentage-source.mjs';

const sourcePath = 'Stammbäume/assets/js/services/family-registry-upgrade.js';
const predecessorSha256 = 'cf920821519a469452e7f54db3b82dba93504861c6aacdec23f5b4e751ec8b96';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');

// Keep the historical receipt immutable. Admit one exact later source version,
// undo only its two reviewed edits, then prove the complete predecessor bytes.
export function assertReviewedArgallSourceFile(source, bytes, review = successor) {
  const reviewedParentage=reviewedParentageSourceHash(source,bytes);
  if(reviewedParentage)return reviewedParentage;
  const actual = hash(bytes);
  if (source.path !== sourcePath) {
    assert.equal(actual, source.sha256, source.path);
    return actual;
  }
  const label = `${sourcePath}/reviewed-source-successor`;
  assert.equal(source.sha256, predecessorSha256, `${label}/historical-hash`);
  assert.equal(review.schema, 'aleria.reviewed-source-successor', `${label}/schema`);
  assert.equal(review.schemaVersion, 1, `${label}/schema-version`);
  assert.equal(review.path, sourcePath, `${label}/path`);
  assert.equal(review.predecessorSha256, predecessorSha256, `${label}/predecessor`);
  assert.equal(actual, review.currentSha256, `${label}/current-full-hash`);
  assert.equal(review.hunks.length, 2, `${label}/hunk-count`);
  let previous = bytes.toString('utf8');
  assert.ok(Buffer.from(previous, 'utf8').equals(bytes), `${label}/exact-utf8`);
  for (const [index, hunk] of review.hunks.entries()) {
    assert.ok(typeof hunk.before === 'string' && hunk.before.length > 0, `${label}/${index}/before`);
    assert.ok(typeof hunk.after === 'string' && hunk.after.length > 0, `${label}/${index}/after`);
    assert.notEqual(hunk.before, hunk.after, `${label}/${index}/changed-hunk`);
    assert.equal(previous.split(hunk.after).length - 1, 1, `${label}/${index}/unique-after`);
    previous = previous.replace(hunk.after, hunk.before);
  }
  const restored = hash(Buffer.from(previous, 'utf8'));
  assert.equal(restored, predecessorSha256, `${label}/complete-predecessor-hash`);
  return restored;
}
