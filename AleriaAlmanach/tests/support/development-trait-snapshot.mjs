import assert from 'node:assert/strict';
import { DEVELOPMENT_TRAITS } from '../../modules/character-development/development-traits.js';
import { PREVIOUS_DEVELOPMENT_TRAITS } from '../../modules/character-development/development-trait-revision-source.js';
import { PREVIOUS_MAPLESS_DEVELOPMENT_TRAITS } from '../../modules/character-development/development-trait-revision-20261112.js';
import { isDeepStrictEqual } from 'node:util';

const current = new Map(DEVELOPMENT_TRAITS.map(trait => [trait.id, trait]));
const previous = [...PREVIOUS_DEVELOPMENT_TRAITS, ...PREVIOUS_MAPLESS_DEVELOPMENT_TRAITS];

// Historical source snapshots stay byte-for-data exact. Only a full declared
// previous definition permits a current catalog entry to differ from them.
export function assertDevelopmentTraitSnapshotPreserved(snapshot, project = entry => entry) {
  const asSnapshot = entry => JSON.parse(JSON.stringify(project(entry)));
  for (const original of snapshot) {
    assert.ok(current.has(original.id), `${original.id} remains in the catalog`);
    assert.ok(isDeepStrictEqual(asSnapshot(current.get(original.id)), asSnapshot(original))
      || previous.some(entry => entry.id === original.id && isDeepStrictEqual(asSnapshot(entry), asSnapshot(original))), `${original.id}: current catalog or an exact declared historical definition must preserve the snapshot`);
  }
}
