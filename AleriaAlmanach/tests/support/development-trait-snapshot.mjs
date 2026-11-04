import assert from 'node:assert/strict';
import { DEVELOPMENT_TRAITS } from '../../modules/character-development/development-traits.js';
import { PREVIOUS_DEVELOPMENT_TRAITS } from '../../modules/character-development/development-trait-revision-source.js';

const current = new Map(DEVELOPMENT_TRAITS.map(trait => [trait.id, trait]));
const previous = new Map(PREVIOUS_DEVELOPMENT_TRAITS.map(trait => [trait.id, trait]));

// Historical source snapshots stay byte-for-data exact. Only a full declared
// previous definition permits a current catalog entry to differ from them.
export function assertDevelopmentTraitSnapshotPreserved(snapshot) {
  for (const original of snapshot) {
    assert.ok(current.has(original.id), `${original.id} remains in the catalog`);
    if (previous.has(original.id)) {
      assert.deepEqual(previous.get(original.id), original, `${original.id}: revision manifest must preserve the original definition`);
      assert.notDeepEqual(current.get(original.id), original, `${original.id}: a declared revision must contain an actual change`);
    } else {
      assert.deepEqual(current.get(original.id), original, `${original.id}: unchanged definition is protected exactly`);
    }
  }
}
