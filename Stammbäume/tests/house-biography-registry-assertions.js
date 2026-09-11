import assert from 'node:assert/strict';

// A registry entry may add a biography and source revision. The imported source
// document, graph collections, and all other metadata must retain their identity.
export function assertHouseBiographyRegistrySource(actual, source) {
  const { extensions: actualExtensions, ...actualGraph } = actual;
  const { extensions: sourceExtensions, ...sourceGraph } = source;
  assert.deepEqual(actualGraph, sourceGraph);
  for (const key of Object.keys(sourceGraph)) {
    assert.equal(actual[key], source[key], key);
  }
  const { houseBiographyModule, sourceRevision, ...actualMetadata } = actualExtensions || {};
  const { houseBiographyModule: oldBiography, sourceRevision: oldRevision, ...sourceMetadata } = sourceExtensions || {};
  assert.deepEqual(actualMetadata, sourceMetadata);
  assert.ok(sourceRevision >= (oldRevision || 0));
  assert.ok(houseBiographyModule);
  if (oldBiography) assert.equal(houseBiographyModule, oldBiography);
}
