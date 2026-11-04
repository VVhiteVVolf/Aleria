import assert from 'node:assert/strict';
import { GAWAIN_ID, GAWAIN_WORLD_ID, GAWAIN_PUBLIC_SUMMARY, GAWAIN_PUBLIC_BIOGRAPHY } from './gawain-public-biography.mjs';
import { hasExactReviewedBiographyTraitCards } from '../character-trait-review/character-trait-review-model.js';

// This projection deliberately does not reconcile the rest of Haus Draig.
// Other persons may have pending independent lineage edits in FAMILY_REGISTRY.
export function projectGawainFamilySnapshot({ envelope, registry, sourceFamily, now }) {
  assert.equal(envelope.familyId, 'haus-draig');
  assert.equal(envelope.family?.document?.id, 'haus-draig');
  assert.equal(sourceFamily.document?.id, 'haus-draig');
  const matches = envelope.family.persons.filter(person => person.worldPersonId === GAWAIN_WORLD_ID);
  const sources = sourceFamily.persons.filter(person => person.worldPersonId === GAWAIN_WORLD_ID);
  assert.equal(matches.length, 1, 'Gawains veröffentlichte Identität muss eindeutig sein.');
  assert.equal(sources.length, 1, 'Gawains Quellidentität muss eindeutig sein.');
  const previous = matches[0], source = sources[0];
  assert.equal(previous.id, source.id);
  assert.equal(source.title, 'Sir');
  assert.equal(source.notes, GAWAIN_PUBLIC_SUMMARY);
  assert.deepEqual(source.extensions.biographyModule, GAWAIN_PUBLIC_BIOGRAPHY);
  const sourceRevision = source.extensions.registryManagedSourceRevision;
  assert.ok(Number.isSafeInteger(sourceRevision) && sourceRevision > 0);
  const family = structuredClone(envelope.family);
  const person = family.persons.find(person => person.worldPersonId === GAWAIN_WORLD_ID);
  person.title = 'Sir';
  person.notes = GAWAIN_PUBLIC_SUMMARY;
  const biography = structuredClone(GAWAIN_PUBLIC_BIOGRAPHY);
  const cards = previous.extensions?.biographyModule?.biography?.abilities;
  if (hasExactReviewedBiographyTraitCards(cards, GAWAIN_ID)) biography.biography.abilities = structuredClone(cards);
  person.extensions = { ...person.extensions, biographyModule: biography };
  for (const field of ['registryManagedSourceRevision', 'registryManagedFields', 'registryManagedFieldRevisions', 'registryManagedExtensionFields']) {
    assert.ok(Object.hasOwn(source.extensions, field), `Gawains Quellmetadatum fehlt: ${field}`);
    person.extensions[field] = structuredClone(source.extensions[field]);
  }
  family.extensions = { ...family.extensions, sourceRevision: Math.max(Number(family.extensions?.sourceRevision || 0), sourceRevision) };
  const changed = JSON.stringify(family) !== JSON.stringify(envelope.family);
  const next = changed ? { ...envelope, revision: envelope.revision + 1, updatedAt: now, family } : envelope;
  if (changed) {
    assert.ok(Number.isSafeInteger(next.revision));
    assert.ok(Number.isFinite(Date.parse(now)), 'Ein gültiger Zeitpunkt ist erforderlich.');
  }
  const nextRegistry = structuredClone(registry);
  const entries = nextRegistry.families.filter(row => row.id === 'haus-draig');
  assert.equal(entries.length, 1, 'Haus Draigs Veröffentlichungsindex muss eindeutig sein.');
  entries[0].revision = next.revision;
  entries[0].updatedAt = next.updatedAt;
  return { envelope: next, registry: nextRegistry, changed,
    registryChanged: JSON.stringify(nextRegistry) !== JSON.stringify(registry), personId: previous.id, sourceRevision };
}
