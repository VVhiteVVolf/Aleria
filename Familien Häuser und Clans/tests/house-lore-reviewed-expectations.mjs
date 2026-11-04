import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';

// Initial import fixtures remain immutable. Only the separately reviewed,
// explicitly listed 2026-11-04 corrections amend their expected values.
const { families } = JSON.parse(readFileSync(
  new URL('./fixtures/house-lore-corrections-20261104.json', import.meta.url), 'utf8',
));
const { families: lifeStatusFamilies } = JSON.parse(readFileSync(
  new URL('./fixtures/house-life-status-corrections-20261104.json', import.meta.url), 'utf8',
));
const { families: contentFamilies } = JSON.parse(readFileSync(
  new URL('./fixtures/house-content-lore-corrections-20261104.json', import.meta.url), 'utf8',
));

export function reviewedGraphFingerprint(id, original) {
  const amendment = families[id];
  const reviewed = amendment?.previousGraphFingerprints?.includes(original)
    ? amendment.graphFingerprint : original;
  const lifeStatus = lifeStatusFamilies[id];
  return lifeStatus?.previousGraphFingerprint === reviewed ? lifeStatus.graphFingerprint : reviewed;
}

export function reviewedBiographyFingerprint(id, original) {
  return contentFamilies[id]?.biographyFingerprint ?? families[id]?.biographyFingerprint ?? original;
}

export function reviewedBiographySourceRevision(id, original) {
  return contentFamilies[id]?.biographySourceRevision ?? families[id]?.biographySourceRevision ?? original;
}

export function reviewedContentVersion(id, original) {
  return contentFamilies[id]?.contentVersion ?? families[id]?.contentVersion ?? original;
}

// Earlier preservation receipts stay immutable. Only the exactly reviewed new
// defaults may be compared using their captured predecessor biography.
export function biographyBeforeReviewedContentCorrection(id, biography) {
  const amendment = contentFamilies[id];
  if (!amendment?.biographyChanged) return biography;
  const fingerprint = createHash('sha256').update(JSON.stringify(biography)).digest('hex');
  if (fingerprint !== amendment.biographyFingerprint) throw new Error(`Unexpected biography amendment ${id}`);
  return amendment.previousBiography;
}
