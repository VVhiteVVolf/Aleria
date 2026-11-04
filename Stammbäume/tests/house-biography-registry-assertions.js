import assert from 'node:assert/strict';
import { HOUSE_BIOGRAPHY_DEFAULTS } from '../assets/js/data/house-biographies.registry.js';
import { FAMILY_REGISTRY } from '../assets/js/data/families.registry.js';
import { houseBiographyDefaultFingerprint } from '../assets/js/modules/house-biography/house-biography-fingerprint.js';

export function assertHouseBiographyRegistryRevision(family, historicalMinimum) {
  const expected = FAMILY_REGISTRY.find(record => record.id === family.document.id).family.extensions.sourceRevision;
  assert.equal(family.extensions.sourceRevision, expected);
  assert.ok(expected >= historicalMinimum);
}

// A registry entry may add a biography, its source revision and explicit metadata
// boundaries. The imported source document and graph collections retain identity.
export function assertHouseBiographyRegistrySource(actual, source) {
  const { extensions: actualExtensions, ...actualGraph } = actual;
  const { extensions: sourceExtensions, ...sourceGraph } = source;
  assert.deepEqual(actualGraph, sourceGraph);
  for (const key of Object.keys(sourceGraph)) {
    assert.equal(actual[key], source[key], key);
  }
  const { houseBiographyModule, sourceRevision, registryManagedEntitySourceRevision, ...actualMetadata } = actualExtensions || {};
  const { houseBiographyModule: oldBiography, sourceRevision: oldRevision, registryManagedEntitySourceRevision: oldEntityRevision, ...sourceMetadata } = sourceExtensions || {};
  const expectedMetadata = { ...sourceMetadata };
  for (const area of ['Document', 'HouseProfile', 'Extension', 'View', 'Lineage']) {
    const fields = sourceExtensions?.[`registryManaged${area}Fields`] || [];
    const key = `registryManaged${area}FieldRevisions`;
    expectedMetadata[key] = {
      ...Object.fromEntries(fields.map(field => [field, Number(oldRevision) || 0])),
      ...sourceExtensions?.[key]
    };
  }
  assert.deepEqual(actualMetadata, expectedMetadata);
  if (registryManagedEntitySourceRevision !== undefined) {
    assert.equal(registryManagedEntitySourceRevision, oldEntityRevision ?? oldRevision ?? 0);
  }
  assert.ok(sourceRevision >= (oldRevision || 0));
  assert.ok(houseBiographyModule);
  if (oldBiography && houseBiographyModule !== oldBiography) {
    const defaults = HOUSE_BIOGRAPHY_DEFAULTS[source.document.id];
    assert.ok(defaults);
    assert.deepEqual(houseBiographyModule, defaults.biography);
    const oldFingerprint = houseBiographyDefaultFingerprint(oldBiography);
    assert.ok(defaults.replacedDefaultFingerprints.includes(oldFingerprint)
      || oldFingerprint === houseBiographyDefaultFingerprint(defaults.biography));
  }
}
