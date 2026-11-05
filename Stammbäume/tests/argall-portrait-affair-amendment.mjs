import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const { families } = JSON.parse(readFileSync(new URL('./fixtures/argall-portrait-affair-amendment-20261105.json', import.meta.url), 'utf8'));
const fingerprint = family => createHash('sha256').update(JSON.stringify(family)).digest('hex');

function restoreReviewedChanges(copy, changes, id) {
  for (const change of changes) {
    const entity = copy[change.collection].find(row => row.id === change.entityId);
    const parent = change.path.slice(0, -1).reduce((value, field) => value?.[field], entity);
    const field = change.path.at(-1);
    if (!parent || !Object.hasOwn(parent, field) || JSON.stringify(parent[field]) !== JSON.stringify(change.value)) {
      throw Error(`Unexpected reviewed view field ${id}`);
    }
    if (change.previouslyPresent) parent[field] = structuredClone(change.previousValue);
    else delete parent[field];
  }
}

// Follow the reviewed-expectations convention: the old receipt stays immutable.
// Only the exact later source amendment can be compared with its predecessor.
export function familyBeforeReviewedArgallViewAmendment(family) {
  const id = family?.document?.id;
  const amendment = families[id];
  if (!amendment) return family;
  const copy = structuredClone(family);
  const layout = amendment.layoutRevisionCorrection;
  if (layout && fingerprint(copy) === layout.protectedHash) {
    restoreReviewedChanges(copy, layout.changes, id);
    if (fingerprint(copy) !== layout.previousProtectedHash || layout.previousProtectedHash !== amendment.protectedHash) {
      throw Error(`Protected layout predecessor mismatch ${id}`);
    }
  }
  if (fingerprint(copy) !== amendment.protectedHash) throw Error(`Unexpected protected-family amendment ${id}`);
  restoreReviewedChanges(copy, amendment.changes, id);
  if (fingerprint(copy) !== amendment.previousProtectedHash) throw Error(`Protected predecessor mismatch ${id}`);
  return copy;
}
