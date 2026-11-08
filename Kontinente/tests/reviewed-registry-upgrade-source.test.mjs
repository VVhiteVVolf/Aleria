import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import successor from './support/gwniwr-maerllys-registry-upgrade-source-review-20261108.json' with { type: 'json' };
import argall from './support/gwynthor-argall-family-review-20261105.json' with { type: 'json' };
import { assertReviewedArgallSourceFile } from './support/reviewed-registry-upgrade-source.mjs';

const root = new URL('../../', import.meta.url);
const bytes = readFileSync(new URL(successor.path, root));
const source = argall.layoutRevisionCorrection.proof.sourceFiles.find(item => item.path === successor.path);
const hash = value => createHash('sha256').update(value).digest('hex');
const currentReview = value => ({ ...structuredClone(successor), currentSha256: hash(value) });

test('the two exact source edits restore the unchanged historical source hash and receipts', () => {
  assert.equal(assertReviewedArgallSourceFile(source, bytes), source.sha256);
  assert.equal(source.sha256, 'cf920821519a469452e7f54db3b82dba93504861c6aacdec23f5b4e751ec8b96');
  assert.deepEqual(successor.historicalReceipts, [
    { path: 'Kontinente/tests/support/gwynthor-argall-family-review-20261105.json', sha256: '4c16c5da3a30f6a3beaf0315cd1925b2bf60ddc4649a5005c556c713a3ebcd4b' },
    { path: 'Stammbäume/tests/fixtures/argall-portrait-affair-amendment-20261105.json', sha256: '38871af260392343218b453b93992c9b48e44c1c02e7591cb0835159bdce216b' }
  ]);
  for (const receipt of successor.historicalReceipts) assert.equal(hash(readFileSync(new URL(receipt.path, root))), receipt.sha256, receipt.path);
  for (const item of argall.layoutRevisionCorrection.proof.sourceFiles.filter(item => item.path !== successor.path)) {
    const actual = readFileSync(new URL(item.path, root));
    assert.equal(assertReviewedArgallSourceFile(item, actual), item.sha256, item.path);
  }
});

test('a rewritten old hash, wrong path, wrong predecessor or extra proof hunk is rejected', () => {
  assert.throws(() => assertReviewedArgallSourceFile({ ...source, sha256: successor.currentSha256 }, bytes), /historical-hash/);
  for (const mutate of [
    review => { review.path = '../outside.js'; },
    review => { review.predecessorSha256 = '0'.repeat(64); },
    review => { review.hunks.push(structuredClone(review.hunks[0])); },
    review => { review.hunks.pop(); }
  ]) {
    const review = structuredClone(successor); mutate(review);
    assert.throws(() => assertReviewedArgallSourceFile(source, bytes, review), /reviewed-source-successor/);
  }
});

test('an additional source edit cannot disappear behind a changed current-version hash', () => {
  for (const extra of ['\n// Unreviewed extra hunk\n', '\n ']) {
    const changed = Buffer.concat([bytes, Buffer.from(extra)]);
    assert.throws(() => assertReviewedArgallSourceFile(source, changed), /current-full-hash/);
    assert.throws(() => assertReviewedArgallSourceFile(source, changed, currentReview(changed)), /complete-predecessor-hash/);
  }
  const review = structuredClone(successor); review.hunks[0].before += '// Unreviewed predecessor edit\n';
  assert.throws(() => assertReviewedArgallSourceFile(source, bytes, review), /complete-predecessor-hash/);
});

test('each missing or duplicate source hunk and any line-ending normalization is rejected', () => {
  for (const hunk of successor.hunks) {
    for (const changed of [
      Buffer.from(bytes.toString('utf8').replace(hunk.after, '')),
      Buffer.concat([bytes, Buffer.from(hunk.after)])
    ]) assert.throws(() => assertReviewedArgallSourceFile(source, changed, currentReview(changed)), /unique-after/);
  }
  const crlf = Buffer.from(bytes.toString('utf8').replaceAll('\n', '\r\n'));
  assert.throws(() => assertReviewedArgallSourceFile(source, crlf, currentReview(crlf)), /unique-after/);
});

test('unrelated sources still require their own exact direct hash and cannot use the successor', () => {
  const unrelated = { path: 'Stammbäume/assets/js/services/another-source.js', sha256: source.sha256 };
  assert.throws(() => assertReviewedArgallSourceFile(unrelated, bytes));
  assert.equal(assertReviewedArgallSourceFile({ ...unrelated, sha256: hash(bytes) }, bytes), hash(bytes));
  let predecessor = bytes.toString('utf8');
  for (const hunk of successor.hunks) predecessor = predecessor.replace(hunk.after, hunk.before);
  assert.throws(() => assertReviewedArgallSourceFile(source, Buffer.from(predecessor)), /current-full-hash/);
});
