import test from 'node:test';
import assert from 'node:assert/strict';
import { withoutInheritedBiographyMaps, sourceMetadataProvenance } from '../assets/js/data/source-family-metadata-provenance.js';
import { getRegisteredSourceMetadataProvenance } from '../assets/js/data/families.registry.js';

test('historical metadata provenance retains explicit source versions and the biography result', () => {
  const original = { extensions: { sourceRevision: 4, registryManagedEntitySourceRevision: 3,
    registryManagedViewFieldRevisions: { focusPersonId: 2 } } };
  const biographed = { extensions: { ...original.extensions, sourceRevision: 5,
    houseBiographyModule: { source: 'new authored default' },
    registryManagedViewFieldRevisions: { focusPersonId: 2, limitGenerations: 3 },
    registryManagedLineageFieldRevisions: {} } };
  const before = structuredClone({ original, biographed });
  const result = withoutInheritedBiographyMaps(original, biographed);
  assert.deepEqual(result.extensions.registryManagedViewFieldRevisions, { focusPersonId: 2 });
  assert.equal(Object.hasOwn(result.extensions, 'registryManagedLineageFieldRevisions'), false);
  assert.equal(result.extensions.sourceRevision, 5);
  assert.deepEqual(result.extensions.houseBiographyModule, biographed.extensions.houseBiographyModule);
  assert.deepEqual({ original, biographed }, before);
});

test('metadata receipts describe only generated ownership and preserve absent containers', () => {
  const family = { extensions: { sourceNote: 'Original source comment' },
    persons: [], partnerships: [], parentages: [], houses: [{ id: 'house-test', name: 'Existing house' }],
    cadetBranches: [], timeJumps: [] };
  const current = structuredClone(family);
  current.extensions.registryManagedViewFieldRevisions = { focusPersonId: 3 };
  current.extensions.sourceNote = 'A separate content amendment';
  current.houses[0].extensions = { registryManagedSourceRevision: 3 };
  const snapshot = structuredClone({ family, current });
  const receipt = sourceMetadataProvenance(family, current);
  assert.deepEqual(receipt.fields.map(field => field.path), [
    ['family', 'extensions', 'registryManagedViewFieldRevisions'],
    ['family', 'houses', '@house-test', 'extensions']
  ]);
  assert.equal(receipt.fields[1].beforePresent, false);
  assert.deepEqual({ family, current }, snapshot);
  current.houses[0].extensions.registryManagedSourceRevision = 99;
  assert.equal(receipt.fields[1].after.registryManagedSourceRevision, 3);
});

test('Kendryck inherited seats are separate from its explicit accepted placement revisions', () => {
  const receipt = getRegisteredSourceMetadataProvenance('haus-kendryck');
  const field = receipt.fields.find(field => field.path.at(-1) === 'registryManagedHouseProfileFieldRevisions');
  assert.equal(field.after.secondarySeats, 2);
  assert.equal(Object.hasOwn(field.before, 'secondarySeats'), false);
  assert.equal(field.before.rankId, 5);
  assert.equal(field.after.rankId, 5);
  field.after.rankId = 99;
  const reread = getRegisteredSourceMetadataProvenance('haus-kendryck');
  assert.equal(reread.fields.find(field => field.path.at(-1) === 'registryManagedHouseProfileFieldRevisions').after.rankId, 5);
});
