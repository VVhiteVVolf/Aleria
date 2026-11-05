import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';

const { families } = JSON.parse(readFileSync(new URL('./fixtures/argall-portrait-affair-amendment-20261105.json', import.meta.url), 'utf8'));
const fingerprint = family => createHash('sha256').update(JSON.stringify(family)).digest('hex');

// Follow the reviewed-expectations convention: the old receipt stays immutable.
// Only the exact later source amendment can be compared with its predecessor.
export function familyBeforeReviewedArgallViewAmendment(family) {
  const id = family?.document?.id;
  const amendment = families[id];
  if (!amendment) return family;
  if (fingerprint(family) !== amendment.protectedHash) throw Error(`Unexpected protected-family amendment ${id}`);
  const copy = structuredClone(family);
  for (const change of amendment.changes) {
    const entity = copy[change.collection].find(row => row.id === change.entityId);
    const parent = change.path.slice(0, -1).reduce((value, field) => value?.[field], entity);
    const field = change.path.at(-1);
    if (!parent || JSON.stringify(parent[field]) !== JSON.stringify(change.value) || change.previouslyPresent) {
      throw Error(`Unexpected reviewed view field ${id}`);
    }
    delete parent[field];
  }
  if (fingerprint(copy) !== amendment.previousProtectedHash) throw Error(`Protected predecessor mismatch ${id}`);
  return copy;
}
